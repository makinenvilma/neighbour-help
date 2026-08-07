import type { Notice, NoticeCategory } from "@/generated/prisma/client";

// Types come from the Prisma schema, so the database is the single source of
// truth for what a notice looks like.
export type { Notice, NoticeCategory };

export const categoryLabels: Record<NoticeCategory, string> = {
  announcement: "Announcement",
  help: "Help needed",
  event: "Event",
  lost_found: "Lost & found",
};

export const categoryStyles: Record<NoticeCategory, string> = {
  announcement: "bg-badge-announcement text-badge-announcement-foreground",
  help: "bg-badge-help text-badge-help-foreground",
  event: "bg-badge-event text-badge-event-foreground",
  lost_found: "bg-badge-neutral text-badge-neutral-foreground",
};

export function formatNoticeDate(createdAt: Date) {
  return createdAt.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
