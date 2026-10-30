"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import {
  getCommunityForMember,
  isLastAdmin,
  lockCommunity,
} from "@/lib/community";

/**
 * Leave the community. Any member may, and nobody can do it for them except an
 * admin removing them.
 *
 * The community's only admin cannot leave: it would be left with nobody able to
 * let anyone in or make a new admin. The page tells them to hand over first;
 * this refuses it as well, under the same lock as the admin actions, in case
 * the other admin stepped down in the meantime.
 *
 * Like being removed, leaving keeps what they posted on the board, and they can
 * ask to join again through the join link.
 */
export async function leaveCommunity(slug: string) {
  const user = await requireUser();
  const community = await getCommunityForMember(slug);
  if (!community) {
    throw new Error(`Not a member of a community "${slug}".`);
  }

  const left = await prisma.$transaction(async (tx) => {
    await lockCommunity(tx, community.id);
    if (await isLastAdmin(tx, community.id, user.id)) return false;

    await tx.membership.deleteMany({
      where: { userId: user.id, communityId: community.id },
    });
    return true;
  });

  // Nowhere in the community is open to them any more; the index is the one
  // page that makes sense. Refused, they stay where they were.
  if (left) redirect("/");
}
