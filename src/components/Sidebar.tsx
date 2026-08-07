import NavLinks, { type NavCommunity } from "@/components/NavLinks";

/**
 * The desktop sidebar. Hidden below `md`, where BottomTabs takes over.
 */
export default function Sidebar({ community }: { community: NavCommunity }) {
  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-56 flex-col border-r border-border bg-card md:flex">
      <div className="p-6 text-lg font-bold">Koto</div>
      <NavLinks community={community} />
    </aside>
  );
}
