import Sidebar from "@/components/Sidebar";
import MobileTopBar from "@/components/MobileTopBar";
import BottomTabs from "@/components/BottomTabs";
import type { NavCommunity } from "@/components/NavLinks";
import { getCurrentUser } from "@/lib/auth";
import { getCommunityNavForUser } from "@/lib/community";

/**
 * Navigation plus main column. Lives here rather than in the root layout so the
 * community layout can tell it which community it is showing - the root layout
 * has no slug of its own to look one up with.
 *
 * Below `md` navigation is split in two: the top bar says where you are and
 * how to get out, the bottom tabs move you around inside. From `md` up the
 * sidebar does both and neither is rendered.
 *
 * Every page that renders the shell is behind requireUser, so `user` is only
 * null if a page forgets that check - and then the shell simply shows no
 * account controls rather than pretending someone is signed in.
 */
export default async function AppShell({
  community = null,
  children,
}: {
  community?: NavCommunity;
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  // Only inside a community, where the switcher is shown. The index lists the
  // same communities itself.
  const communities =
    user && community ? await getCommunityNavForUser(user.id) : [];

  return (
    <>
      <Sidebar community={community} userName={user?.name ?? null} />
      <div className="flex min-w-0 flex-1 flex-col md:ml-56">
        <MobileTopBar
          community={community}
          communities={communities}
          user={user && { name: user.name, email: user.email }}
        />
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
