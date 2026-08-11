import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle, Plus } from "lucide-react";
import { getNotices } from "@/lib/queries";
import { getCommunityBySlug } from "@/lib/community";
import NoticeCard from "@/components/NoticeCard";

export default async function FeedPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const community = await getCommunityBySlug(slug);
  if (!community) notFound();

  // No `take`: this page is the whole board by definition. It is the one read
  // that grows with the community, and the place pagination goes when it does.
  const posts = await getNotices(community.id);

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <section className="rounded-lg bg-gradient-to-br from-primary to-accent p-8 text-primary-foreground sm:p-10">
        {/* The mobile top bar already names the community right above this. */}
        <p className="hidden text-sm font-medium uppercase tracking-wide opacity-80 md:block">
          {community.name}
        </p>
        <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
          Community notice board
        </h1>
        <p className="mt-3 max-w-xl opacity-90">
          Everything the community has posted, newest first.
        </p>
        <div className="mt-6">
          <Link
            href={`/community/${community.slug}/new`}
            className="inline-flex items-center gap-2 rounded-full bg-card px-5 py-2.5 font-medium text-card-foreground transition-transform duration-200 hover:scale-105"
          >
            <Plus className="h-4 w-4" /> New notice
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-2xl font-bold">All notices</h2>
          <p className="text-sm text-muted-foreground">
            {posts.length} notices
          </p>
        </div>

        <div className="space-y-4">
          {posts.map((post) => (
            <NoticeCard
              key={post.id}
              notice={post}
              href={`/community/${community.slug}/notice/${post.id}`}
              footer={
                <button className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-primary transition-colors duration-200 hover:bg-muted">
                  <MessageCircle className="h-4 w-4" /> Comment
                </button>
              }
            />
          ))}
        </div>
      </section>
    </div>
  );
}
