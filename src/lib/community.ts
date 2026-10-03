import { cache } from "react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

/**
 * The community a page is rendering, looked up from the slug in the URL - but
 * only if the signed-in user is a member of it. Redirects to sign in when
 * nobody is.
 *
 * Returns null both for a slug that does not exist and for one the user does
 * not belong to, and callers turn either into a 404. Answering "forbidden" for
 * the second would confirm the community exists, which is the enumeration this
 * is here to prevent.
 *
 * This is the authorisation check for everything under /community/[slug], so
 * pages and actions must come through here rather than querying by slug
 * themselves. Wrapped in `cache` so the layout and the page it wraps share one
 * query instead of asking the database the same thing twice per request.
 */
export const getCommunityForMember = cache(async (slug: string) => {
  const user = await requireUser();
  return prisma.community.findFirst({
    where: { slug, memberships: { some: { userId: user.id } } },
    include: {
      infoItems: { orderBy: { sortOrder: "asc" } },
      _count: { select: { memberships: true } },
    },
  });
});

/**
 * The communities `userId` belongs to, for the index at `/`.
 *
 * Scoped to the user's memberships rather than listing every community:
 * customers must not be enumerable by anyone who opens the front page.
 */
export function getCommunitiesForUser(userId: string) {
  return prisma.community.findMany({
    where: { memberships: { some: { userId } } },
    orderBy: { name: "asc" },
    include: { _count: { select: { memberships: true } } },
  });
}

export type CommunityWithInfo = NonNullable<
  Awaited<ReturnType<typeof getCommunityForMember>>
>;
