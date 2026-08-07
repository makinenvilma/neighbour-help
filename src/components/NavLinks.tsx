import Link from "next/link";
import { Home, Megaphone, PlusCircle, UsersRound } from "lucide-react";

export type NavCommunity = { slug: string; name: string } | null;

const linkClasses =
  "flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted";

/**
 * The desktop sidebar's navigation. Mobile uses BottomTabs instead, which is a
 * different shape rather than the same list restyled.
 */
export default function NavLinks({ community }: { community: NavCommunity }) {
  return (
    <nav className="flex-1 space-y-2 px-4">
      <Link href="/" className={linkClasses}>
        <UsersRound className="h-5 w-5" /> Communities
      </Link>

      {community && (
        // Naming the community above its links makes clear that this section
        // is scoped to one board rather than more top-level navigation.
        <div className="mt-4 space-y-2 border-t border-border pt-4">
          <p
            className="truncate px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            title={community.name}
          >
            {community.name}
          </p>
          <Link href={`/community/${community.slug}`} className={linkClasses}>
            <Home className="h-5 w-5" /> Home
          </Link>
          <Link
            href={`/community/${community.slug}/feed`}
            className={linkClasses}
          >
            <Megaphone className="h-5 w-5" /> Notice Board
          </Link>
          <Link
            href={`/community/${community.slug}/new`}
            className={linkClasses}
          >
            <PlusCircle className="h-5 w-5" /> New Notice
          </Link>
        </div>
      )}
    </nav>
  );
}
