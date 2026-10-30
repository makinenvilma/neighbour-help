import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  Flame,
  HeartHandshake,
  Info,
  Megaphone,
  Phone,
  LogOut,
  Shield,
  Shirt,
  Trash2,
  Users,
  type LucideIcon,
} from "lucide-react";
import { formatNoticeDate } from "@/lib/notices";
import { getNoticeCounts, getNotices } from "@/lib/queries";
import { countAdmins, getCommunityForMember } from "@/lib/community";
import ConfirmButton from "@/components/ConfirmButton";
import NoticeCard from "@/components/NoticeCard";
import { leaveCommunity } from "./actions";

// CommunityInfo.icon is a key, not a component name - communities pick from
// this set rather than naming anything the bundle has to resolve at runtime.
const infoIcons: Record<string, LucideIcon> = {
  shirt: Shirt,
  flame: Flame,
  trash: Trash2,
  phone: Phone,
  calendar: CalendarDays,
  info: Info,
};

// This page is a summary, so every list on it is a preview of a longer one on
// the feed. The counts below come from the database, not from these arrays.
const LATEST_LIMIT = 3;
const HELP_LIMIT = 5;

export default async function CommunityHome({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const community = await getCommunityForMember(slug);
  if (!community) notFound();

  // Three narrow queries in parallel rather than one wide one: the page shows
  // at most eight notices, so fetching the whole board to slice it would grow
  // unboundedly for output that never does.
  const [latest, helpRequests, counts, adminCount] = await Promise.all([
    getNotices(community.id, { take: LATEST_LIMIT }),
    getNotices(community.id, { category: "help", take: HELP_LIMIT }),
    getNoticeCounts(community.id),
    // Only an admin's page needs it, to say whether they may leave.
    community.role === "admin" ? countAdmins(community.id) : null,
  ]);
  const isOnlyAdmin = adminCount === 1;

  const stats = [
    { icon: Megaphone, value: counts.total, label: "Active notices" },
    { icon: HeartHandshake, value: counts.help, label: "Help requests" },
    { icon: CalendarDays, value: counts.event, label: "Upcoming events" },
    { icon: Users, value: community._count.memberships, label: "Members" },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <section className="rounded-lg bg-gradient-to-br from-primary to-accent p-8 text-primary-foreground sm:p-10">
        {/* The mobile top bar already names the community right above this. */}
        <p className="hidden text-sm font-medium uppercase tracking-wide opacity-80 md:block">
          {community.name}
        </p>
        <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
          Your community notice board
        </h1>
        <p className="mt-3 max-w-xl opacity-90">
          Ask for a hand, lend a drill, and keep up with what is happening -
          all in one place, just for the people who are part of it.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/community/${community.slug}/feed`}
            className="inline-flex items-center gap-2 rounded-full bg-card px-5 py-2.5 font-medium text-card-foreground transition-transform duration-200 hover:scale-105"
          >
            Browse notices <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={`/community/${community.slug}/new`}
            className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/40 px-5 py-2.5 font-medium transition-colors duration-200 hover:bg-primary-foreground/10"
          >
            Post a notice
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border bg-card p-4 transition-shadow duration-300 hover:shadow-lg"
          >
            <stat.icon className="h-5 w-5 text-primary" />
            <p className="mt-3 text-3xl font-bold text-card-foreground">
              {stat.value}
            </p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-2xl font-bold">Latest notices</h2>
            <Link
              href={`/community/${community.slug}/feed`}
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {latest.map((notice) => (
              <NoticeCard
                key={notice.id}
                notice={notice}
                href={`/community/${community.slug}/notice/${notice.id}`}
              />
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <HeartHandshake className="h-5 w-5 text-accent" />
              Members needing a hand
            </h2>
            <ul className="mt-4 space-y-4">
              {helpRequests.map((notice) => (
                <li key={notice.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                  <p className="font-medium text-card-foreground">{notice.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {notice.author.name} · {formatNoticeDate(notice.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
            {/* The list is capped, so say what is not on it rather than let the
                panel quietly disagree with the "Help requests" stat above. */}
            {counts.help > helpRequests.length && (
              <Link
                href={`/community/${community.slug}/feed`}
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                {counts.help - helpRequests.length} more <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </section>

          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-bold">Good to know</h2>
            <ul className="mt-4 space-y-4">
              {community.infoItems.map((item) => {
                const ItemIcon = infoIcons[item.icon] ?? Info;
                return (
                  <li key={item.id} className="flex gap-3">
                    <ItemIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <p className="font-medium text-card-foreground">
                        {item.label}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.value}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-bold">Your membership</h2>
            {isOnlyAdmin ? (
              // The action refuses this too; saying why is kinder than a
              // button that does nothing.
              <p className="mt-2 text-sm text-muted-foreground">
                You are the only admin of {community.name}, so you cannot leave
                yet.{" "}
                <Link
                  href={`/community/${community.slug}/admin`}
                  className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                >
                  <Shield className="h-4 w-4" /> Make someone else an admin
                </Link>{" "}
                first.
              </p>
            ) : (
              <>
                <p className="mt-2 text-sm text-muted-foreground">
                  You are {community.role === "admin" ? "an admin" : "a member"}{" "}
                  of {community.name}.
                </p>
                <div className="mt-4">
                  <ConfirmButton
                    action={leaveCommunity.bind(null, community.slug)}
                    question={`Leave ${community.name}? You lose access straight away. To come back, you ask to join again.`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-destructive hover:bg-muted"
                  >
                    <LogOut className="h-4 w-4" /> Leave {community.name}
                  </ConfirmButton>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
