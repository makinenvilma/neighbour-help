import Link from "next/link";
import { Check, ChevronDown, UsersRound } from "lucide-react";

export type SwitcherCommunity = { slug: string; name: string };

const itemClasses =
  "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted";

/**
 * The community name in the mobile top bar, as a menu: tap it to jump to
 * another community you belong to, or to the full list.
 *
 * Same `popover` approach as AccountMenu - the browser opens and dismisses it,
 * no client JavaScript. Two `popover="auto"` menus close each other, so the
 * account menu and this one are never open at once.
 *
 * Only ever lists the signed-in user's own communities, so it reveals nothing
 * the communities index would not.
 */
export default function CommunitySwitcher({
  current,
  communities,
}: {
  current: SwitcherCommunity;
  communities: SwitcherCommunity[];
}) {
  return (
    <>
      {/* Centred against the bar rather than by flex spacers: "Koto" and the
          account button are different widths, so a balanced row would leave
          the name visibly off-centre. The max-width stops a long name short
          of either side. */}
      <button
        type="button"
        popoverTarget="community-switcher"
        aria-label={`Switch community, current: ${current.name}`}
        className="absolute left-1/2 flex max-w-[55%] -translate-x-1/2 items-center gap-1 rounded-md px-2 py-1 text-sm font-semibold cursor-pointer"
      >
        <span className="truncate" title={current.name}>
          {current.name}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {/* inset-auto and m-0 undo the popover's default centring; left-1/2
          with the translate centres it under the name instead. */}
      <div
        id="community-switcher"
        popover="auto"
        className="fixed inset-auto left-1/2 top-16 m-0 w-64 -translate-x-1/2 rounded-lg border border-border bg-card p-2 text-card-foreground shadow-lg"
      >
        <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Your communities
        </p>
        <ul>
          {communities.map((community) => {
            const isCurrent = community.slug === current.slug;
            return (
              <li key={community.slug}>
                <Link
                  href={`/community/${community.slug}`}
                  aria-current={isCurrent ? "page" : undefined}
                  className={`${itemClasses} ${isCurrent ? "font-semibold" : ""}`}
                >
                  <span className="min-w-0 flex-1 truncate">
                    {community.name}
                  </span>
                  {isCurrent && (
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="mt-2 border-t border-border pt-2">
          <Link href="/" className={itemClasses}>
            <UsersRound className="h-4 w-4 shrink-0" /> All communities
          </Link>
        </div>
      </div>
    </>
  );
}
