import { cache } from "react";
import { prisma } from "@/lib/db";

/**
 * The community a page is rendering, looked up from the slug in the URL.
 * Returns null for an unknown slug so the caller can call notFound().
 *
 * Wrapped in `cache` so the layout and the page it wraps share one query
 * instead of asking the database the same thing twice per request.
 */
export const getCommunityBySlug = cache((slug: string) => {
  return prisma.community.findUnique({
    where: { slug },
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
  Awaited<ReturnType<typeof getCommunityBySlug>>
>;
