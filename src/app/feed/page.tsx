import Link from "next/link";
import { MessageCircle, Plus } from "lucide-react";
import {
  categoryLabels,
  categoryStyles,
  formatNoticeDate,
  notices,
} from "@/lib/notices";

export default function FeedPage() {
  const posts = notices;

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <section className="rounded-lg bg-gradient-to-br from-primary to-accent p-8 text-primary-foreground sm:p-10">
        <p className="text-sm font-medium uppercase tracking-wide opacity-80">
          Maple Street 12
        </p>
        <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
          Neighbourhood notice board
        </h1>
        <p className="mt-3 max-w-xl opacity-90">
          Everything the neighbours have posted, newest first.
        </p>
        <div className="mt-6">
          <Link
            href="/new"
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
            <article
              key={post.id}
              className="rounded-lg border border-border bg-card p-6 transition-shadow duration-300 hover:shadow-lg"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${categoryStyles[post.category]}`}
                >
                  {categoryLabels[post.category]}
                </span>
                <span className="text-sm text-muted-foreground">
                  {formatNoticeDate(post.createdAt)} - {post.author}
                </span>
              </div>
              <h3 className="mt-3 text-xl font-bold text-card-foreground">
                {post.title}
              </h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                {post.content}
              </p>

              <div className="mt-4 flex justify-end">
                <button className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-primary transition-colors duration-200 hover:bg-muted">
                  <MessageCircle className="h-4 w-4" /> Comment
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
