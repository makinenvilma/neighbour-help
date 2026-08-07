"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Info } from "lucide-react";
import {
  categoryLabels,
  categoryStyles,
  type NoticeCategory,
} from "@/lib/notices";
import { createNotice, type NoticeFieldErrors } from "./actions";

const categories = Object.keys(categoryLabels) as NoticeCategory[];

type Errors = NoticeFieldErrors;

const fieldBase =
  "w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground outline-none transition-colors duration-200 focus:border-ring";
const inputClasses = `mt-2 ${fieldBase} leading-6`;
const selectClasses = `${fieldBase} appearance-none pr-10 leading-6`;
const textareaClasses = `mt-2 ${fieldBase} resize-y leading-relaxed`;

export default function NewNoticeForm({
  buildingSlug,
}: {
  buildingSlug: string;
}) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState<NoticeCategory>("announcement");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFailure(null);

    const found: Errors = {};
    if (!title.trim()) found.title = "Give the notice a title.";
    if (!author.trim()) found.author = "Tell your neighbours who is posting.";
    if (content.trim().length < 10)
      found.content = "Write at least a sentence so people know what you mean.";

    setErrors(found);
    if (Object.keys(found).length > 0) return;

    startTransition(async () => {
      try {
        const result = await createNotice({
          buildingSlug,
          title,
          author,
          content,
          category,
        });
        if (!result.ok) {
          setErrors(result.errors);
          return;
        }
        router.push("/feed");
      } catch {
        setFailure(
          "The notice could not be saved. Check that the database is running and try again.",
        );
      }
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <section className="rounded-lg border border-border bg-card p-6 lg:col-span-2">
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div>
            <label htmlFor="title" className="text-sm font-medium text-card-foreground">
              Title
            </label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Anyone have a drill I could borrow?"
              className={inputClasses}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-destructive">{errors.title}</p>
            )}
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="author" className="text-sm font-medium text-card-foreground">
                Your name
              </label>
              <input
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Anna Example"
                className={inputClasses}
              />
              {errors.author && (
                <p className="mt-1 text-sm text-destructive">{errors.author}</p>
              )}
            </div>

            <div>
              <label htmlFor="category" className="text-sm font-medium text-card-foreground">
                Category
              </label>
              <div className="relative mt-2">
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as NoticeCategory)}
                  className={selectClasses}
                >
                  {categories.map((key) => (
                    <option key={key} value={key}>
                      {categoryLabels[key]}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
              {errors.category && (
                <p className="mt-1 text-sm text-destructive">{errors.category}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="content" className="text-sm font-medium text-card-foreground">
              Notice
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              placeholder="Putting up shelves this weekend and would rather borrow than buy."
              className={textareaClasses}
            />
            {errors.content && (
              <p className="mt-1 text-sm text-destructive">{errors.content}</p>
            )}
          </div>

          {failure && (
            <div className="flex gap-3 rounded-lg border border-border bg-muted p-4">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
              <div>
                <p className="font-medium text-card-foreground">
                  Nothing was posted
                </p>
                <p className="text-sm text-muted-foreground">{failure}</p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-medium text-primary-foreground transition-transform duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
            >
              {pending ? "Posting..." : "Post notice"}
            </button>
            <Link
              href="/feed"
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-medium text-muted-foreground transition-colors duration-200 hover:bg-muted"
            >
              Cancel
            </Link>
          </div>
        </form>
      </section>

      <div>
        <section className="rounded-lg border border-border bg-card p-6 lg:sticky lg:top-6">
          <h2 className="text-lg font-bold">Preview</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            How it will look on the board.
          </p>

          <article className="mt-4 rounded-lg border border-border bg-background p-4">
            <span
              className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${categoryStyles[category]}`}
            >
              {categoryLabels[category]}
            </span>
            <p className="mt-3 text-sm text-muted-foreground">
              Today - {author.trim() || "Your name"}
            </p>
            <h3
              className={`mt-2 break-words text-lg font-bold ${
                title.trim() ? "text-card-foreground" : "text-muted-foreground"
              }`}
            >
              {title.trim() || "Your title shows up here"}
            </h3>
            <p className="mt-2 whitespace-pre-wrap break-words leading-relaxed text-muted-foreground">
              {content.trim() || "And the text of your notice goes here."}
            </p>
          </article>
        </section>
      </div>
    </div>
  );
}
