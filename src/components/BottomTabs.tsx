"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Megaphone, PlusCircle } from "lucide-react";
import type { NavCommunity } from "@/components/NavLinks";

/**
 * The mobile navigation: the three places you move between inside a community,
 * one tap away and always visible. Hidden from `md` up, where the sidebar does
 * this job.
 *
 * Renders nothing outside a community - the index is the top of the tree and
 * has nowhere to tab to.
 */
export default function BottomTabs({ community }: { community: NavCommunity }) {
  const pathname = usePathname();
  if (!community) return null;

  const base = `/community/${community.slug}`;
  const tabs = [
    { href: base, label: "Home", icon: Home },
    { href: `${base}/feed`, label: "Notices", icon: Megaphone },
    { href: `${base}/new`, label: "New", icon: PlusCircle },
  ];

  return (
    <nav
      aria-label="Community"
      // The bottom inset keeps the tabs clear of the iPhone home indicator.
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-1 flex-col items-center gap-1 px-2 py-2 text-xs font-medium transition-colors ${
              active
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="h-5 w-5" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
