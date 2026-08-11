import { cache } from "react";
import { prisma } from "@/lib/db";
import { NoticeCategory } from "@/generated/prisma/enums";

export type NoticeQuery = {
  /** Only this category. Omit for every category. */
  category?: NoticeCategory;
  /** Newest N. Omit only when the page genuinely renders the whole board. */
  take?: number;
};

/**
 * Notices for one community, newest first.
 *
 * `communityId` is required on purpose: this is the tenant boundary, and an
 * unscoped `findMany` would hand one community's notices to another. Making it
 * a parameter turns that mistake into a type error instead of a silent data
 * leak, so pages should always come through here rather than calling
 * `prisma.notice` directly.
 *
 * `category` and `take` exist so callers narrow in SQL rather than fetching the
 * board and filtering the array. A page that wants three cards should ask for
 * three rows.
 */
export function getNotices(
  communityId: string,
  { category, take }: NoticeQuery = {},
) {
  return prisma.notice.findMany({
    where: { communityId, category },
    orderBy: { createdAt: "desc" },
    take,
  });
}

/**
 * One notice, or null if this community does not have it.
 *
 * `findFirst` on both columns rather than `findUnique` on the id: the id comes
 * out of the URL next to a slug anyone can swap, so looking it up by id alone
 * would serve /community/anyone-else/notice/5 the notice with id 5 whoever owns
 * it. Matching both means a mismatched pair is simply a 404.
 *
 * Wrapped in `cache` so generateMetadata and the page it titles share one query.
 */
export const getNotice = cache((communityId: string, id: number) => {
  return prisma.notice.findFirst({ where: { id, communityId } });
});

/** Every category, plus `total`. Categories with no notices are 0, not absent. */
export type NoticeCounts = Record<NoticeCategory, number> & { total: number };

/**
 * How many notices per category, counted in the database.
 *
 * The alternative - load every notice and call `.filter().length` - moves the
 * whole board across the wire to render four numbers, and gets slower every
 * time somebody posts. One grouped count is O(rows) in Postgres and O(1) here.
 */
export async function getNoticeCounts(
  communityId: string,
): Promise<NoticeCounts> {
  const rows = await prisma.notice.groupBy({
    by: ["category"],
    where: { communityId },
    _count: { _all: true },
  });

  // groupBy omits categories with no rows, so start from a zero for each one -
  // callers index this record directly and undefined would render as blank.
  const counts = Object.fromEntries(
    Object.values(NoticeCategory).map((category) => [category, 0]),
  ) as Record<NoticeCategory, number>;

  let total = 0;
  for (const row of rows) {
    counts[row.category] = row._count._all;
    total += row._count._all;
  }

  return { ...counts, total };
}
