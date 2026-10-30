import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Clock } from "lucide-react";
import AppShell from "@/components/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { getJoinCommunityName, getJoinTarget } from "@/lib/join";
import { requestToJoin } from "./actions";
import JoinForm from "./JoinForm";

export const metadata = { title: "Join a community - Koto" };

/**
 * Where a community's join link and QR code lead. People arrive here from
 * outside, usually signed out and usually without an account, so a signed-out
 * visitor is shown what they are joining and pointed at sign-up first, rather
 * than being dropped on a bare sign-in form.
 */
export default async function JoinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const user = await getCurrentUser();
  if (!user) return <SignedOutJoin code={code} />;

  const community = await getJoinTarget(code, user.id);
  if (!community) notFound();
  if (community.memberships.length > 0) {
    redirect(`/community/${community.slug}`);
  }

  const status = community.joinRequests[0]?.status;

  return (
    <AppShell>
      <div className="mx-auto max-w-xl">
        <section className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Join a community
          </p>
          <h1 className="mt-1 text-2xl font-bold">{community.name}</h1>

          {status === "pending" ? (
            <div className="mt-6 flex gap-3 rounded-lg bg-muted p-4">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
              <p className="text-sm">
                Your request is waiting for an admin to approve it. Once they
                do, {community.name} shows up on your front page.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              <p className="text-muted-foreground">
                {status === "rejected"
                  ? "Your earlier request was not approved. If that was a mistake, you can ask again."
                  : "An admin of this community approves every new member. Tell them who you are and they will let you in."}
              </p>
              <JoinForm action={requestToJoin.bind(null, code)} />
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

async function SignedOutJoin({ code }: { code: string }) {
  const community = await getJoinCommunityName(code);
  if (!community) notFound();

  const next = `?next=${encodeURIComponent(`/join/${code}`)}`;

  return (
    <main className="flex min-h-dvh flex-1 items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <p className="mb-6 text-center text-2xl font-extrabold">Koto</p>
        <section className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Join a community
          </p>
          <h1 className="mt-1 text-2xl font-bold">{community.name}</h1>
          <p className="mt-3 text-muted-foreground">
            {community.name} has its notice board on Koto. Create an account and
            ask to join - an admin of the community lets new members in.
          </p>
          <Link
            href={`/signup${next}`}
            className="mt-6 block w-full rounded-full bg-primary px-5 py-2.5 text-center font-medium text-primary-foreground"
          >
            Create an account
          </Link>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href={`/login${next}`}
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
