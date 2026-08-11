import { notFound } from "next/navigation";
import {
  categoryLabels,
  categoryStyles,
  formatNoticeDate,
} from "@/lib/notices";
import { getNotice } from "@/lib/queries";
import { getCommunityBySlug } from "@/lib/community";

type Params = Promise<{ slug: string; id: string }>;

/**
 * Resolves the community and the notice, or null for either half that is
 * missing. Both the page and generateMetadata need exactly this, and both
 * `getCommunityBySlug` and `getNotice` are request-cached, so calling it twice
 * costs one pair of queries.
 */
async function load(params: Params) {
  const { slug, id } = await params;
  const community = await getCommunityBySlug(slug);
  if (!community) return { community: null, notice: null };

  // Digits only. `Number` alone would accept "1e3" as 1000 and "5.0" as 5,
  // giving the same notice several URLs.
  if (!/^\d+$/.test(id)) return { community, notice: null };

  const notice = await getNotice(community.id, Number(id));
  return { community, notice };
}

export async function generateMetadata({ params }: { params: Params }) {
  const { community, notice } = await load(params);
  if (!community || !notice) return { title: "Notice not found" };

  return {
    title: `${notice.title} - ${community.name}`,
    description: notice.content.slice(0, 160),
  };
}

export default async function NoticePage({ params }: { params: Params }) {
  const { community, notice } = await load(params);
  if (!community || !notice) notFound();

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <section className="rounded-lg bg-gradient-to-br from-primary to-accent p-8 text-primary-foreground sm:p-10">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${categoryStyles[notice.category]}`}
          >
            {categoryLabels[notice.category]}
          </span>
          <span className="text-sm opacity-90">
            {formatNoticeDate(notice.createdAt)} - {notice.author}
          </span>
        </div>
        <h1 className="mt-3 break-words text-3xl font-extrabold sm:text-4xl">
          {notice.title}
        </h1>
      </section>

      <section className="rounded-lg border border-border bg-card p-6 sm:p-8">
        {/* Notices are typed into a textarea, so the line breaks the author put
            in are part of what they wrote. The cards on the board collapse
            them; at full size they are worth keeping. */}
        <p className="whitespace-pre-wrap break-words leading-relaxed text-muted-foreground">
          {notice.content}
        </p>
      </section>
    </div>
  );
}
