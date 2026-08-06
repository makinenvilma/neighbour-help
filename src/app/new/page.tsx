"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";
import { categoryLabels, type NoticeCategory } from "@/lib/notices";

const categories = Object.keys(categoryLabels) as NoticeCategory[];

type FieldName = "title" | "author" | "content";
type Errors = Partial<Record<FieldName, string>>;

const inputClasses =
  "mt-2 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground outline-none transition-colors duration-200 focus:border-ring";

export default function NewNoticePage() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState<NoticeCategory>("announcement");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [blocked, setBlocked] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const found: Errors = {};
    if (!title.trim()) found.title = "Give the notice a title.";
    if (!author.trim()) found.author = "Tell your neighbours who is posting.";
    if (content.trim().length < 10)
      found.content = "Write at least a sentence so people know what you mean.";

    setErrors(found);
    setBlocked(Object.keys(found).length === 0);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <section className="rounded-lg bg-gradient-to-br from-primary to-accent p-8 text-primary-foreground sm:p-10">
        <Link
          href="/feed"
          className="inline-flex items-center gap-2 text-sm font-medium opacity-80 transition-opacity duration-200 hover:opacity-100"
        >
          <ArrowLeft className="h-4 w-4" /> Back to the board
        </Link>
        <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">
          Post a notice
        </h1>
        <p className="mt-3 max-w-xl opacity-90">
          Ask for a hand, share what is happening, or let the building know
          about something you found.
        </p>
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
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
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as NoticeCategory)}
                className={inputClasses}
              >
                {categories.map((key) => (
                  <option key={key} value={key}>
                    {categoryLabels[key]}
                  </option>
                ))}
              </select>
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
              className={`${inputClasses} resize-y leading-relaxed`}
            />
            {errors.content && (
              <p className="mt-1 text-sm text-destructive">{errors.content}</p>
            )}
          </div>

          {blocked && (
            <div className="flex gap-3 rounded-lg border border-border bg-muted p-4">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium text-card-foreground">
                  Nothing was posted yet
                </p>
                <p className="text-sm text-muted-foreground">
                  The notice looks fine, but there is no database to save it to.
                  Your text is still here - it will go through once the data
                  layer is in place.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-medium text-primary-foreground transition-transform duration-200 hover:scale-105"
            >
              Post notice
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
    </div>
  );
}
