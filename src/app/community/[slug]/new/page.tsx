import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getCommunityForMember } from "@/lib/community";
import NewNoticeForm from "./NewNoticeForm";

// A server component so the community is resolved here and handed to the form,
// rather than the form guessing which community it is posting into.
export default async function NewNoticePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [user, community] = await Promise.all([
    requireUser(),
    getCommunityForMember(slug),
  ]);
  if (!community) notFound();

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <section className="rounded-lg bg-gradient-to-br from-primary to-accent p-8 text-primary-foreground sm:p-10">
        {/* The mobile top bar already names the community right above this. */}
        <p className="hidden text-sm font-medium uppercase tracking-wide opacity-80 md:block">
          {community.name}
        </p>
        <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
          Post a notice
        </h1>
        <p className="mt-3 max-w-xl opacity-90">
          Ask for a hand, share what is happening, or let the community know
          about something you found.
        </p>
      </section>

      <NewNoticeForm communitySlug={community.slug} authorName={user.name} />
    </div>
  );
}
