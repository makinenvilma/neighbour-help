"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { MembershipRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import {
  getCommunityForAdmin,
  isLastAdmin,
  lockCommunity,
} from "@/lib/community";

/**
 * Every action here takes the slug (and the request id) from the page, and
 * trusts neither. The slug goes through the admin check; the request id is only ever
 * used together with that community's id, so an admin of one community cannot
 * approve a request made to another by sending its id.
 */
async function requireAdminOf(slug: string) {
  const community = await getCommunityForAdmin(slug);
  if (!community) {
    throw new Error(`Not an admin of a community "${slug}".`);
  }
  return community;
}

export async function approveJoinRequest(slug: string, requestId: string) {
  const community = await requireAdminOf(slug);

  await prisma.$transaction(async (tx) => {
    // updateMany, not update: it can filter on more than the id. Matching on
    // status too means two admins clicking at once approve it once, and a
    // request someone already rejected is not quietly approved.
    const { count } = await tx.joinRequest.updateMany({
      where: { id: requestId, communityId: community.id, status: "pending" },
      data: { status: "approved" },
    });
    if (count === 0) return;

    const request = await tx.joinRequest.findUniqueOrThrow({
      where: { id: requestId },
      select: { userId: true },
    });
    // skipDuplicates: if they somehow are a member already, that is the goal
    // reached, not an error.
    await tx.membership.createMany({
      data: { userId: request.userId, communityId: community.id },
      skipDuplicates: true,
    });
  });

  revalidatePath(`/community/${community.slug}/admin`);
}

export async function rejectJoinRequest(slug: string, requestId: string) {
  const community = await requireAdminOf(slug);

  await prisma.joinRequest.updateMany({
    where: { id: requestId, communityId: community.id, status: "pending" },
    data: { status: "rejected" },
  });

  revalidatePath(`/community/${community.slug}/admin`);
}

/**
 * Give the community a new join code. Every link and QR code made from the old
 * one stops working at once - the fix for a code that has spread further than
 * it should, or for a printout left up after it was meant to come down.
 *
 * Requests already made with the old code stay in the list: those people asked
 * while the code was valid, and an admin still decides on each of them.
 */
export async function rotateJoinCode(slug: string) {
  const community = await requireAdminOf(slug);

  await prisma.community.update({
    where: { id: community.id },
    // 16 random bytes as hex: the same 32-character shape as the
    // gen_random_uuid() code Postgres gave the community at first, and a few
    // bits harder to guess (128 against 122).
    data: { joinCode: randomBytes(16).toString("hex") },
  });

  revalidatePath(`/community/${community.slug}/admin`);
}

/**
 * Make `userId` an admin or a plain member of the community.
 *
 * The one rule: a community always keeps at least one admin. Without one,
 * nobody could ever let a new member in or make another admin again.
 */
export async function setMemberRole(
  slug: string,
  userId: string,
  role: MembershipRole,
) {
  const community = await requireAdminOf(slug);
  // `role` is bound in by the page, but arrives over the wire like the rest.
  if (role !== "admin" && role !== "member") {
    throw new Error(`Not a role: "${role}".`);
  }

  const user = await requireUser();
  let demotedSelf = false;

  await prisma.$transaction(async (tx) => {
    await lockCommunity(tx, community.id);
    if (role === "member" && (await isLastAdmin(tx, community.id, userId))) {
      return;
    }

    // updateMany so the community id is part of the match: a userId from
    // another community changes nothing.
    const { count } = await tx.membership.updateMany({
      where: { userId, communityId: community.id },
      data: { role },
    });
    demotedSelf = count > 0 && role === "member" && userId === user.id;
  });

  // Someone who just gave up their own admin role cannot see this page any
  // more; send them to the community instead of a 404.
  if (demotedSelf) redirect(`/community/${community.slug}`);
  revalidatePath(`/community/${community.slug}/admin`);
}

/**
 * Take `userId` out of the community - someone who moved away, left the club,
 * or should not have been let in.
 *
 * They lose access on their next request, signed in or not: every community
 * page and action checks membership itself. What they posted stays on the
 * board under their name; the notices belong to the community's history, not
 * to the membership.
 *
 * Not for removing yourself. Leaving is something every member should be able
 * to do, not only admins, so it belongs on its own, not on this page.
 */
export async function removeMember(slug: string, userId: string) {
  const community = await requireAdminOf(slug);
  const user = await requireUser();
  if (userId === user.id) {
    throw new Error("Admins cannot remove themselves from the admin page.");
  }

  await prisma.$transaction(async (tx) => {
    await lockCommunity(tx, community.id);
    // Looks unneeded - the caller is an admin and cannot remove themselves - but
    // the caller was checked before the lock. If another admin demoted them in
    // the meantime, the person being removed may be the last admin left.
    if (await isLastAdmin(tx, community.id, userId)) return;

    // deleteMany: someone already gone is the goal reached, not an error.
    await tx.membership.deleteMany({
      where: { userId, communityId: community.id },
    });
  });

  revalidatePath(`/community/${community.slug}/admin`);
}
