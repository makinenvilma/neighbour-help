import AppShell from "@/components/AppShell";
import { getCommunityBySlug } from "@/lib/community";

// Resolves the community so the sidebar has a name to show. Deliberately does
// NOT call notFound(): a layout that throws is skipped along with everything it
// renders, which would drop the sidebar off the 404. The pages below throw
// instead, and not-found.tsx renders inside this layout with the chrome intact.
export default async function CommunityLayout({
  params,
  children,
}: {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}) {
  const { slug } = await params;
  const community = await getCommunityBySlug(slug);

  return (
    <AppShell
      community={
        community ? { slug: community.slug, name: community.name } : null
      }
    >
      {children}
    </AppShell>
  );
}
