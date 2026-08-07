import Link from "next/link";
import { ArrowRight, Users, UsersRound } from "lucide-react";
import AppShell from "@/components/AppShell";
import { getCommunities } from "@/lib/community";

// Communities are added at runtime, so a prerendered list would go stale.
export const dynamic = "force-dynamic";

export default async function CommunityIndex() {
  const communities = await getCommunities();

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-10">
        <section className="rounded-lg bg-gradient-to-br from-primary to-accent p-8 text-primary-foreground sm:p-10">
          {/* The mobile top bar already says Koto right above this. */}
          <p className="hidden text-sm font-medium uppercase tracking-wide opacity-80 md:block">
            Koto
          </p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Notice boards
          </h1>
          <p className="mt-3 max-w-xl opacity-90">
            Every community has its own board. Pick one to see what the members
            have posted.
          </p>
        </section>

        {communities.length === 0 ? (
          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-bold">No communities yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Run{" "}
              <code className="rounded bg-muted px-1.5 py-0.5">
                npx prisma db seed
              </code>{" "}
              to add an example community with a few notices.
            </p>
          </section>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2">
            {communities.map((community) => (
              <Link
                key={community.id}
                href={`/community/${community.slug}`}
                className="group rounded-lg border border-border bg-card p-6 transition-shadow duration-300 hover:shadow-lg"
              >
                <UsersRound className="h-5 w-5 text-primary" />
                <h2 className="mt-3 text-xl font-bold text-card-foreground">
                  {community.name}
                </h2>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {community.memberCount} members
                </p>
                <p className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Open the board
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </p>
              </Link>
            ))}
          </section>
        )}
      </div>
    </AppShell>
  );
}
