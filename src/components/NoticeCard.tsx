import {
  categoryLabels,
  categoryStyles,
  formatNoticeDate,
  type Notice,
} from "@/lib/notices";

/**
 * One notice as it appears on a board. The community home page and the feed
 * render the same card; only what hangs off the bottom differs, so that part
 * arrives as `footer` rather than as a flag the card has to interpret.
 */
export default function NoticeCard({
  notice,
  footer,
}: {
  notice: Notice;
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
          {formatNoticeDate(notice.createdAt)} - {notice.author}
        </span>
      </div>
      <h3 className="mt-3 text-xl font-bold text-card-foreground">
        {notice.title}
      </h3>
      <p className="mt-2 leading-relaxed text-muted-foreground">
        {notice.content}
      </p>
      {footer ? <div className="mt-4 flex justify-end">{footer}</div> : null}
    </article>
  );
}
