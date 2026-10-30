import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Check, Shield, User, X } from "lucide-react";
import QRCode from "qrcode";
import { requireUser } from "@/lib/auth";
import { getCommunityForAdmin, getMembers } from "@/lib/community";
import { getPendingJoinRequests } from "@/lib/join";
import { formatNoticeDate } from "@/lib/notices";
import {
  approveJoinRequest,
  rejectJoinRequest,
  rotateJoinCode,
  setMemberRole,
} from "./actions";
import JoinLinkPanel from "./JoinLinkPanel";

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

  const [user, requests, members, joinUrl] = await Promise.all([
    requireUser(),
    getPendingJoinRequests(community.id),
    getMembers(community.id),
    joinLinkFor(community.joinCode),
  ]);
  const adminCount = members.filter((m) => m.role === "admin").length;
  // SVG so it prints sharp at any size; as a data URL so it is an ordinary
  // image the browser can also download, rather than markup put into the page.
  const qrSvg = await QRCode.toString(joinUrl, { type: "svg", margin: 1 });
  const qrDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(qrSvg)}`;

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <section className="rounded-lg bg-gradient-to-br from-primary to-accent p-8 text-primary-foreground sm:p-10">
        {/* The mobile top bar already names the community right above this. */}
        <p className="hidden text-sm font-medium uppercase tracking-wide opacity-80 md:block">
          {community.name}
        </p>
        <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Admin</h1>
        <p className="mt-3 max-w-xl opacity-90">
          Let new members in and choose who else runs {community.name}. Only
          admins see this page.
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold">Join link</h2>
        <JoinLinkPanel
          url={joinUrl}
          qrDataUrl={qrDataUrl}
          rotate={rotateJoinCode.bind(null, community.slug)}
        />
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
                      - {request.note}
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

      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-2xl font-bold">Members</h2>
          <p className="text-sm text-muted-foreground">
            {members.length} members, {adminCount}{" "}
            {adminCount === 1 ? "admin" : "admins"}
          </p>
        </div>

        <ul className="space-y-3">
          {members.map((member) => {
            const isAdmin = member.role === "admin";
            const isYou = member.user.id === user.id;
            // The server refuses this too; hiding the button just saves a
            // click that would do nothing.
            const isLastAdmin = isAdmin && adminCount === 1;
            return (
              <li
                key={member.user.id}
                className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {isAdmin ? (
                    <Shield className="h-5 w-5 shrink-0 text-primary" />
                  ) : (
                    <User className="h-5 w-5 shrink-0 text-muted-foreground" />
                  )}
                  <div className="min-w-0">
                    <p className="font-medium">
                      {member.user.name}
                      {isYou && (
                        <span className="text-muted-foreground"> (you)</span>
                      )}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {/* The membership's createdAt is when they joined, not
                          when their role last changed. */}
                      {member.user.email} - {isAdmin ? "admin" : "member"},
                      joined {formatNoticeDate(member.createdAt)}
                    </p>
                  </div>
                </div>
                {isLastAdmin ? (
                  <p className="shrink-0 text-sm text-muted-foreground">
                    Make someone else an admin before stepping down.
                  </p>
                ) : (
                  <form
                    action={setMemberRole.bind(
                      null,
                      community.slug,
                      member.user.id,
                      isAdmin ? "member" : "admin",
                    )}
                    className="shrink-0"
                  >
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
                    >
                      {isAdmin
                        ? isYou
                          ? "Step down as admin"
                          : "Make member"
                        : "Make admin"}
                    </button>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

/**
 * The full join link, with the address this page was opened at as its origin.
 * In production that is the real domain; in development it is whatever the
 * admin typed, so a page opened by the machine's network address makes a QR
 * code a phone on the same network can actually open, where "localhost" would
 * not.
 *
 * Trusting the Host header is fine here and only here: the link is shown to
 * the admin who sent the request, so a forged header only fools its sender.
 */
async function joinLinkFor(joinCode: string) {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const protocol =
    h.get("x-forwarded-proto") ??
    (process.env.NODE_ENV === "production" ? "https" : "http");
  return `${protocol}://${host}/join/${joinCode}`;
}
