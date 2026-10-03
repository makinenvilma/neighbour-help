import type { NavCommunity } from "@/components/NavLinks";
import AccountMenu, { type MenuUser } from "@/components/AccountMenu";

/**
 * Mobile-only bar carrying what the tab bar cannot: the product name, which
 * community you are in, and the account menu - who you are signed in as, the
 * way back to your communities, and sign out. Sticky, so all of it survives
 * scrolling. Hidden from `md` up, where the sidebar says the same.
 */
export default function MobileTopBar({
  community,
  user,
}: {
  community: NavCommunity;
  user: MenuUser | null;
}) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-card px-4 py-3 md:hidden">
      {/* Text, not a link: it would point at `/`, which the account menu
          already leads to. The sidebar renders "Koto" as a plain heading for
          the same reason. */}
      <span className="shrink-0 text-sm font-bold">Koto</span>

      {community && (
        // Centred against the bar rather than by flex spacers: "Koto" and the
        // account button are different widths, so a balanced row would leave
        // the name visibly off-centre. The max-width stops a long name short
        // of either side, and pointer-events-none keeps it from swallowing
        // taps on the button if it gets there anyway.
        <span
          className="pointer-events-none absolute left-1/2 max-w-[45%] -translate-x-1/2 truncate text-sm font-semibold"
          title={community.name}
        >
          {community.name}
        </span>
      )}

      {/* The way out of a community lives in the menu now: BottomTabs covers
          just the three places inside one. */}
      {user && (
        <div className="ml-auto">
          <AccountMenu user={user} />
        </div>
      )}
    </header>
  );
}
