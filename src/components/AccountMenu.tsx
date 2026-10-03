import Link from "next/link";
import { UsersRound } from "lucide-react";
import SignOutButton from "@/components/SignOutButton";

export type MenuUser = { name: string; email: string };

/** "Mary Example" -> "ME". One or two letters, from the first two words. */
function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

const itemClasses =
  "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted";

/**
 * The mobile account menu: an initials button that opens who you are signed in
 * as, the way back to your communities, and sign out.
 *
 * Built on the HTML `popover` attribute rather than React state. The browser
 * opens it from the button, closes it on a tap outside or Escape, and puts it
 * above everything else, all without any JavaScript of ours - so this stays a
 * server component. Following the Communities link closes it too: the index
 * renders its own shell, so the menu is replaced along with it.
 */
export default function AccountMenu({ user }: { user: MenuUser }) {
  return (
    <>
      <button
        type="button"
        popoverTarget="account-menu"
        aria-label={`Account menu for ${user.name}`}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
      >
        {initials(user.name)}
      </button>

      {/* A popover is centred in the viewport by default (inset: 0 plus
          margin: auto). inset-auto and m-0 undo that so top/right can pin it
          under the button, just below the bar. */}
      <div
        id="account-menu"
        popover="auto"
        className="fixed inset-auto right-4 top-16 m-0 w-60 rounded-lg border border-border bg-card p-2 text-card-foreground shadow-lg"
      >
        <div className="border-b border-border px-3 pb-3 pt-2">
          <p className="truncate text-sm font-semibold" title={user.name}>
            {user.name}
          </p>
          <p
            className="truncate text-xs text-muted-foreground"
            title={user.email}
          >
            {user.email}
          </p>
        </div>
        <div className="pt-2">
          <Link href="/" className={itemClasses}>
            <UsersRound className="h-4 w-4 shrink-0" /> Communities
          </Link>
          <SignOutButton className={itemClasses} />
        </div>
      </div>
    </>
  );
}
