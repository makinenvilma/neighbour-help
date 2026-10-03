import NavLinks, { type NavCommunity } from "@/components/NavLinks";
import SignOutButton from "@/components/SignOutButton";

/**
 * The desktop sidebar. Hidden below `md`, where BottomTabs takes over.
 */
export default function Sidebar({
  community,
  userName,
}: {
  community: NavCommunity;
  userName: string | null;
}) {
  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-56 flex-col border-r border-border bg-card md:flex">
      <div className="p-6 text-lg font-bold">Koto</div>
      <NavLinks community={community} />
      {userName && (
        // Pinned to the bottom by NavLinks' flex-1, the usual place to look for
        // who you are signed in as.
        <div className="border-t border-border p-4">
          <p
            className="truncate px-3 text-sm font-medium"
            title={userName}
          >
            {userName}
          </p>
          <SignOutButton className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground" />
        </div>
      )}
    </aside>
  );
}
