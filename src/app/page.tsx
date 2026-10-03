import Link from "next/link";
import { ArrowRight, Users, UsersRound } from "lucide-react";
import AppShell from "@/components/AppShell";
import { requireUser } from "@/lib/auth";
import { getCommunitiesForUser } from "@/lib/community";

export default async function CommunityIndex() {
  // Reading the session cookie already makes this page dynamic, so the old
  // `force-dynamic` is no longer needed.
  const user = await requireUser();
  const communities = await getCommunitiesForUser(user.id);

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
            Every community has its own board. These are the ones you belong
            to.
          </p>
        </section>

        {communities.length === 0 ? (
          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-bold">No communities yet</h2>
            {/* There is no way to join one from the app yet - invitations come
                next. Until then memberships are made by the seed. */}
            <p className="mt-2 text-sm text-muted-foreground">
              You are not a member of any community yet. Ask someone in yours to
              invite you.
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
                  {community._count.memberships} members
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
