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
  Shirt,
  Trash2,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  categoryLabels,
  categoryStyles,
  formatNoticeDate,
} from "@/lib/notices";
import { getNotices } from "@/lib/queries";
import { getCommunityBySlug } from "@/lib/community";

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

export default async function CommunityHome({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const community = await getCommunityBySlug(slug);
  if (!community) notFound();

  const notices = await getNotices(community.id);
  const latest = notices.slice(0, 3);
  const helpRequests = notices.filter((n) => n.category === "help");
  const events = notices.filter((n) => n.category === "event");

  const stats = [
    { icon: Megaphone, value: notices.length, label: "Active notices" },
    { icon: HeartHandshake, value: helpRequests.length, label: "Help requests" },
    { icon: CalendarDays, value: events.length, label: "Upcoming events" },
    { icon: Users, value: community.memberCount, label: "Members" },
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
              <article
                key={notice.id}
                className="rounded-lg border border-border bg-card p-6 transition-shadow duration-300 hover:shadow-lg"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${categoryStyles[notice.category]}`}
                  >
                    {categoryLabels[notice.category]}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatNoticeDate(notice.createdAt)} - {notice.author}
                  </span>
                </div>
                <h3 className="mt-3 text-xl font-bold text-card-foreground">
                  {notice.title}
                </h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  {notice.content}
                </p>
              </article>
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
                    {notice.author} · {formatNoticeDate(notice.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
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

        </div>
      </div>
    </div>
  );
}
