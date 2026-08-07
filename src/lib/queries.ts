import { prisma } from "@/lib/db";

/**
 * Every notice for one building, newest first.
 *
 * `buildingId` is required on purpose: this is the tenant boundary, and an
 * unscoped `findMany` would hand one housing company's notices to another.
 * Making it a parameter turns that mistake into a type error instead of a
 * silent data leak, so pages should always come through here rather than
 * calling `prisma.notice` directly.
 */
export function getNotices(buildingId: string) {
  return prisma.notice.findMany({
    where: { buildingId },
    orderBy: { createdAt: "desc" },
  });
}
