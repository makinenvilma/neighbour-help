import { notFound } from "next/navigation";
import { categoryLabels, formatNoticeDate } from "@/lib/notices";
import { getNotice } from "@/lib/queries";
import { getCommunityForMember } from "@/lib/community";

type Params = Promise<{ slug: string; id: string }>;

/**
 * Resolves the community and the notice, or null for either half that is
 * missing. Both the page and generateMetadata need exactly this, and both
 * `getCommunityForMember` and `getNotice` are request-cached, so calling it twice
 * costs one pair of queries.
 */
async function load(params: Params) {
  const { slug, id } = await params;
  const community = await getCommunityForMember(slug);
  if (!community) return { community: null, notice: null };

  const notice = await getNotice(community.id, id);
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
    // Narrower than the boards' `max-w-5xl`: this is the one page that is a
    // single column of prose, and board width makes for an unreadable measure.
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Padding is a step below the boards' `p-8 sm:p-10`: this hero carries a
          badge and a title where theirs carry a kicker, a subtitle and a call
          to action, and at board padding the leftover gradient reads as empty
          rather than as breathing room. */}
      <section className="rounded-lg bg-gradient-to-br from-primary to-accent p-6 text-primary-foreground sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          {/* Not `categoryStyles`: those pills are tinted for the card surface
              and turn muddy on the gradient. A card-coloured pill is how the
              feed already puts a control on this same background. */}
          <span className="rounded-full bg-card px-3 py-1 text-xs font-semibold text-card-foreground">
            {categoryLabels[notice.category]}
          </span>
          <span className="text-sm opacity-90">
            {formatNoticeDate(notice.createdAt)} - {notice.author.name}
          </span>
        </div>
        <h1 className="mt-3 break-words text-3xl font-extrabold sm:text-4xl">
          {notice.title}
        </h1>
      </section>

      <article className="rounded-lg border border-border bg-card p-6 sm:p-8">
        {/* Notices are typed into a textarea, so the line breaks the author put
            in are part of what they wrote. The cards on the board collapse
            them; at full size they are worth keeping. */}
        <p className="whitespace-pre-wrap break-words leading-relaxed text-muted-foreground">
          {notice.content}
        </p>
      </article>
    </div>
  );
}
