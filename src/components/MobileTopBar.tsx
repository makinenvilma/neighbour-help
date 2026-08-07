import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { NavCommunity } from "@/components/NavLinks";

/**
 * Mobile-only bar carrying the two things the tab bar cannot: which community
 * you are in, and the way back out of it. Sticky, so both survive scrolling.
 * Hidden from `md` up, where the sidebar says the same.
 */
export default function MobileTopBar({
  community,
}: {
  community: NavCommunity;
}) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-card px-4 py-3 md:hidden">
      {/* No min-w-0 here on purpose: this column refuses to shrink below the
          link, so a long community name truncates instead of squeezing the way
          back out of the community off the screen. */}
      <div className="flex flex-1 justify-start">
        {community && (
          <Link
            href="/"
            className="flex items-center gap-1 whitespace-nowrap text-sm font-medium text-primary hover:underline"
          >
            <ChevronLeft className="h-4 w-4 shrink-0" /> Communities
          </Link>
        )}
      </div>

      <span
        className="min-w-0 truncate text-sm font-semibold"
        title={community?.name}
      >
        {community ? community.name : "Koto"}
      </span>

      {/* Balances the link so the title sits in the middle of the bar rather
          than the middle of whatever space the link left over. */}
      <div className="min-w-0 flex-1" aria-hidden="true" />
    </header>
  );
}
