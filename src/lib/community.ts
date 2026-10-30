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
 *
 * `role` is the signed-in user's role in this community, fetched in the same
 * query so checking it costs nothing extra.
 */
export const getCommunityForMember = cache(async (slug: string) => {
  const user = await requireUser();
  const community = await prisma.community.findFirst({
    where: { slug, memberships: { some: { userId: user.id } } },
    include: {
      infoItems: { orderBy: { sortOrder: "asc" } },
      _count: { select: { memberships: true } },
      memberships: { where: { userId: user.id }, select: { role: true } },
    },
  });
  if (!community) return null;

  // The where clause above guarantees exactly one membership row here.
  const { memberships, ...rest } = community;
  return { ...rest, role: memberships[0].role };
});

/**
 * Like `getCommunityForMember`, but only for the community's admins. Returns
 * null for a plain member too, so admin pages and actions treat "not an admin"
 * exactly like "not a member" and never act on the caller's behalf.
 *
 * Admin-only pages and actions must come through here; checking `role` by hand
 * in each one is how a check gets forgotten.
 */
export async function getCommunityForAdmin(slug: string) {
  const community = await getCommunityForMember(slug);
  return community?.role === "admin" ? community : null;
}

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

/**
 * Just the names and slugs of `userId`'s communities, for the community
 * switcher in the mobile top bar. Rendered on every community page, so it asks
 * for two columns rather than the counts the index shows.
 */
export function getCommunityNavForUser(userId: string) {
  return prisma.community.findMany({
    where: { memberships: { some: { userId } } },
    orderBy: { name: "asc" },
    select: { slug: true, name: true },
  });
}

/**
 * Everyone in `communityId`, admins first and then by name, for the member
 * list on the admin page.
 *
 * Takes the id rather than a slug: the caller has already been through
 * getCommunityForAdmin, which is the check that matters.
 */
export function getMembers(communityId: string) {
  return prisma.membership.findMany({
    where: { communityId },
    // The enum is declared member, admin, so descending puts admins first.
    orderBy: [{ role: "desc" }, { user: { name: "asc" } }],
    select: {
      role: true,
      createdAt: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });
}

export type CommunityWithInfo = NonNullable<
  Awaited<ReturnType<typeof getCommunityForMember>>
>;
