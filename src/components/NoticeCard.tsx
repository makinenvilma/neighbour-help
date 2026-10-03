import Link from "next/link";
import {
  categoryLabels,
  categoryStyles,
  formatNoticeDate,
} from "@/lib/notices";
import type { NoticeWithAuthor } from "@/lib/queries";

/**
 * One notice as it appears on a board. The community home page and the feed
 * render the same card; only what hangs off the bottom differs, so that part
 * arrives as `footer` rather than as a flag the card has to interpret.
 *
 * Only the title is a link. Wrapping the whole card would nest the footer's
 * button inside an anchor, which is invalid HTML and confuses assistive tech.
 */
export default function NoticeCard({
  notice,
  href,
  footer,
}: {
  notice: NoticeWithAuthor;
  href: string;
  footer?: React.ReactNode;
}) {
  return (
    <article className="rounded-lg border border-border bg-card p-6 transition-shadow duration-300 hover:shadow-lg">
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${categoryStyles[notice.category]}`}
        >
          {categoryLabels[notice.category]}
        </span>
        <span className="text-sm text-muted-foreground">
          {formatNoticeDate(notice.createdAt)} - {notice.author.name}
        </span>
      </div>
      <h3 className="mt-3 text-xl font-bold text-card-foreground">
        <Link href={href} className="hover:underline">
          {notice.title}
        </Link>
      </h3>
      <p className="mt-2 leading-relaxed text-muted-foreground">
        {notice.content}
      </p>
      {footer ? <div className="mt-4 flex justify-end">{footer}</div> : null}
    </article>
  );
}
