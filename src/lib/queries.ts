import { prisma } from "@/lib/db";

/**
 * Every notice, newest first. A single building's board is small enough that
 * the pages can filter this list in memory instead of querying per section.
 */
export function getNotices() {
  return prisma.notice.findMany({ orderBy: { createdAt: "desc" } });
}
