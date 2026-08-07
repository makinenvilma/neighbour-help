import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// No AppShell here - this boundary sits inside the community layout, which
// already renders the sidebar.
export default function CommunityNotFound() {
  return (
    <div className="mx-auto max-w-5xl">
      <section className="rounded-lg border border-border bg-card p-6">
        <h1 className="text-2xl font-bold">Community not found</h1>
        <p className="mt-2 text-muted-foreground">
          There is no community at this address. It may have been removed, or
          the link may have a typo in it.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> All communities
        </Link>
      </section>
    </div>
  );
}
