"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCommunityForAdmin } from "@/lib/community";

/**
 * Both actions take the slug and the request id from the page, and trust
 * neither. The slug goes through the admin check; the request id is only ever
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
