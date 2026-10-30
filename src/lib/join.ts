import { prisma } from "@/lib/db";

/**
 * The community a join code belongs to, and where `userId` stands with it: a
 * membership if they already have one, their join request if they made one.
 * Null for a code that matches nothing - mistyped, or rotated by an admin.
 *
 * Selects only the name and slug. Someone holding the code may see what they
 * are joining, not the community's notices or members.
 */
export function getJoinTarget(joinCode: string, userId: string) {
  return prisma.community.findUnique({
    where: { joinCode },
    select: {
      id: true,
      slug: true,
      name: true,
      // Both filtered to this one user, so each is empty or a single row.
      memberships: { where: { userId }, select: { role: true } },
      joinRequests: { where: { userId }, select: { status: true } },
    },
  });
}

/**
 * The requests waiting for an admin of `communityId`, oldest first so nobody
 * who asked early is left at the bottom of the list.
 *
 * Takes the id rather than a slug: the caller has already been through
 * getCommunityForAdmin, which is the check that matters.
 */
export function getPendingJoinRequests(communityId: string) {
  return prisma.joinRequest.findMany({
    where: { communityId, status: "pending" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      note: true,
      createdAt: true,
      // Name and email so the admin can tell who this is. Nothing else about
      // the user is the admin's business.
      user: { select: { name: true, email: true } },
    },
  });
}

/**
 * Just the name of the community a join code belongs to, for the page a
 * signed-out visitor sees. Showing it reveals nothing new: anyone with the code
 * could sign up and see it on the next page anyway.
 *
 * A separate query rather than `getJoinTarget` with no user: Prisma reads
 * `where: { userId: undefined }` as no filter at all, which would load every
 * member of the community.
 */
export function getJoinCommunityName(joinCode: string) {
  return prisma.community.findUnique({
    where: { joinCode },
    select: { name: true },
  });
}
