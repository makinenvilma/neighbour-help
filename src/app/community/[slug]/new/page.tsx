import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCommunityBySlug } from "@/lib/community";
import NewNoticeForm from "./NewNoticeForm";

// A server component so the community is resolved here and handed to the form,
// rather than the form guessing which community it is posting into.
export default async function NewNoticePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const community = await getCommunityBySlug(slug);
  if (!community) notFound();

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <section className="rounded-lg bg-gradient-to-br from-primary to-accent p-8 text-primary-foreground sm:p-10">
        <Link
          href={`/community/${community.slug}/feed`}
          className="inline-flex items-center gap-2 text-sm font-medium opacity-80 transition-opacity duration-200 hover:opacity-100"
        >
          <ArrowLeft className="h-4 w-4" /> Back to the board
        </Link>
        <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">
          Post a notice
        </h1>
        <p className="mt-3 max-w-xl opacity-90">
          Ask for a hand, share what is happening, or let {community.name} know
          about something you found.
        </p>
      </section>

      <NewNoticeForm communitySlug={community.slug} />
    </div>
  );
}
