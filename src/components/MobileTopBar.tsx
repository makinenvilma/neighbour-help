import type { NavCommunity } from "@/components/NavLinks";
import AccountMenu, { type MenuUser } from "@/components/AccountMenu";
import CommunitySwitcher, {
  type SwitcherCommunity,
} from "@/components/CommunitySwitcher";

/**
 * Mobile-only bar carrying what the tab bar cannot: the product name, which
 * community you are in (and a menu to switch to another), and the account
 * menu. Sticky, so all of it survives scrolling. Hidden from `md` up, where
 * the sidebar says the same.
 */
export default function MobileTopBar({
  community,
  communities,
  user,
}: {
  community: NavCommunity;
  communities: SwitcherCommunity[];
  user: MenuUser | null;
}) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-card px-4 py-3 md:hidden">
      {/* Text, not a link: it would point at `/`, which the community
          switcher already leads to. The sidebar renders "Koto" as a plain
          heading for the same reason. */}
      <span className="shrink-0 text-sm font-bold">Koto</span>

      {community && (
        // Keyed by the community: moving between two communities keeps this
        // layout mounted, and without a fresh element the open menu would
        // stay open over the page it just navigated to.
        <CommunitySwitcher
          key={community.slug}
          current={community}
          communities={communities}
        />
      )}

      {user && (
        <div className="ml-auto">
          <AccountMenu user={user} />
        </div>
      )}
    </header>
  );
}
