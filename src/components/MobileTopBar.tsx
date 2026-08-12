import Link from "next/link";
import { UsersRound } from "lucide-react";
import type { NavCommunity } from "@/components/NavLinks";

/**
 * Mobile-only bar carrying the three things the tab bar cannot: the product
 * name, which community you are in, and the way back out of it. Sticky, so all
 * three survive scrolling. Hidden from `md` up, where the sidebar says the same.
 */
export default function MobileTopBar({
  community,
}: {
  community: NavCommunity;
}) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-card px-4 py-3 md:hidden">
      {/* Text, not a link: it would point at `/`, which is exactly where the
          Communities link beside it already goes. The sidebar renders "Koto"
          as a plain heading above its Communities link for the same reason. */}
      <span className="shrink-0 text-sm font-bold">Koto</span>

      {community && (
        <>
          {/* Centred against the bar rather than by flex spacers: "Koto" and
              "Communities" are very different widths, so a balanced row would
              centre the name between them and leave it visibly off-centre. The
              max-width stops a long name short of either side, and
              pointer-events-none keeps it from swallowing taps on the link if
              it gets there anyway. */}
          <span
            className="pointer-events-none absolute left-1/2 max-w-[45%] -translate-x-1/2 truncate text-sm font-semibold"
            title={community.name}
          >
            {community.name}
          </span>

          {/* The only way out of a community on mobile: BottomTabs covers just
              the three places inside one. UsersRound rather than a back chevron
              because it sits on the right and matches the sidebar's own
              Communities link. shrink-0 so a long name truncates instead of
              squeezing the exit off the screen. */}
          <Link
            href="/"
            className="ml-auto flex shrink-0 items-center gap-1 whitespace-nowrap text-sm font-medium text-primary hover:underline"
          >
            <UsersRound className="h-4 w-4 shrink-0" /> Communities
          </Link>
        </>
      )}
    </header>
  );
}
