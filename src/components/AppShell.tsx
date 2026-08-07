import Sidebar from "@/components/Sidebar";
import MobileTopBar from "@/components/MobileTopBar";
import BottomTabs from "@/components/BottomTabs";
import type { NavCommunity } from "@/components/NavLinks";

/**
 * Navigation plus main column. Lives here rather than in the root layout so the
 * community layout can tell it which community it is showing - the root layout
 * has no slug of its own to look one up with.
 *
 * Below `md` navigation is split in two: the top bar says where you are and
 * how to get out, the bottom tabs move you around inside. From `md` up the
 * sidebar does both and neither is rendered.
 */
export default function AppShell({
  community = null,
  children,
}: {
  community?: NavCommunity;
  children: React.ReactNode;
}) {
  return (
    <>
      <Sidebar community={community} />
      <div className="flex min-w-0 flex-1 flex-col md:ml-56">
        <MobileTopBar community={community} />
        {/* Extra bottom padding only where the tabs actually cover content. */}
        <main
          className={`flex-1 p-4 md:p-6 ${community ? "pb-24 md:pb-6" : ""}`}
        >
          {children}
        </main>
      </div>
      <BottomTabs community={community} />
    </>
  );
}
