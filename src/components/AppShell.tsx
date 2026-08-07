import Navbar from "@/components/Navbar";

/**
 * Sidebar plus main column. Lives here rather than in the root layout so the
 * community layout can tell the sidebar which community it is showing - the
 * root layout has no slug of its own to look one up with.
 */
export default function AppShell({
  community = null,
  children,
}: {
  community?: { slug: string; name: string } | null;
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar community={community} />
      <main className="flex-1 ml-56 p-6">{children}</main>
    </>
  );
}
