import { notFound } from "next/navigation";
import { Check, X } from "lucide-react";
import { getCommunityForAdmin } from "@/lib/community";
import { getPendingJoinRequests } from "@/lib/join";
import { formatNoticeDate } from "@/lib/notices";
import { approveJoinRequest, rejectJoinRequest } from "./actions";

export const metadata = { title: "Admin - Koto" };

/**
 * The admin's page for a community. A plain member gets the same 404 as a
 * non-member - see getCommunityForAdmin.
 */
export default async function AdminPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const community = await getCommunityForAdmin(slug);
  if (!community) notFound();

  const requests = await getPendingJoinRequests(community.id);

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <section className="rounded-lg bg-gradient-to-br from-primary to-accent p-8 text-primary-foreground sm:p-10">
        {/* The mobile top bar already names the community right above this. */}
        <p className="hidden text-sm font-medium uppercase tracking-wide opacity-80 md:block">
          {community.name}
        </p>
        <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Admin</h1>
        <p className="mt-3 max-w-xl opacity-90">
          Let new members in. Only admins of {community.name} see this page.
        </p>
      </section>

      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-2xl font-bold">Join requests</h2>
          <p className="text-sm text-muted-foreground">
            {requests.length} waiting
          </p>
        </div>

        {requests.length === 0 ? (
          <p className="rounded-lg border border-border bg-card p-6 text-muted-foreground">
            Nobody is waiting. New requests show up here when someone opens the
            community&apos;s join link.
          </p>
        ) : (
          <ul className="space-y-3">
            {requests.map((request) => (
              <li
                key={request.id}
                className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium">
                    {request.user.name}{" "}
                    <span className="text-muted-foreground">
                      - {request.apartment}
                    </span>
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {request.user.email} - asked{" "}
                    {formatNoticeDate(request.createdAt)}
                  </p>
                </div>
                {/* One form per button: each is a separate action with the
                    ids bound in, and both work before the JavaScript loads. */}
                <div className="flex shrink-0 gap-2">
                  <form
                    action={approveJoinRequest.bind(
                      null,
                      community.slug,
                      request.id,
                    )}
                  >
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                    >
                      <Check className="h-4 w-4" /> Approve
                    </button>
                  </form>
                  <form
                    action={rejectJoinRequest.bind(
                      null,
                      community.slug,
                      request.id,
                    )}
                  >
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
                    >
                      <X className="h-4 w-4" /> Reject
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
