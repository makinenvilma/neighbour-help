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
      {/* shrink-0 on purpose: the link keeps its full width, so a long
          community name truncates instead of squeezing the way back out of the
          community off the screen. */}
      {community && (
        <Link
          href="/"
          className="flex shrink-0 items-center gap-1 whitespace-nowrap text-sm font-medium text-primary hover:underline"
        >
          <ChevronLeft className="h-4 w-4 shrink-0" /> Communities
        </Link>
      )}

      {/* Takes the rest of the row rather than sitting in the middle of it, so
          the title reads as the next thing after the link. min-w-0 is what
          lets truncate actually fire inside a flex child. */}
      <span
        className="min-w-0 flex-1 truncate text-sm font-semibold"
        title={community?.name}
      >
        {community ? community.name : "Koto"}
      </span>
    </header>
  );
}
