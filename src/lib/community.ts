import { prisma } from "@/lib/db";

/**
 * The community a page is rendering, looked up from the slug in the URL.
 * Returns null for an unknown slug so the page can call notFound().
 */
export function getCommunityBySlug(slug: string) {
  return prisma.community.findUnique({
    where: { slug },
    include: { infoItems: { orderBy: { sortOrder: "asc" } } },
  });
}

/**
 * Every community, for the index at `/`.
 *
 * This lists all tenants to anyone who asks, which is fine while the app is a
 * local development toy and wrong the moment it is real: customers should not
 * be enumerable. It goes away when authentication lands and `/` becomes either
 * a marketing page or a redirect to the community you belong to.
 */
export function getCommunities() {
  return prisma.community.findMany({ orderBy: { name: "asc" } });
}

export type CommunityWithInfo = NonNullable<
  Awaited<ReturnType<typeof getCommunityBySlug>>
>;
