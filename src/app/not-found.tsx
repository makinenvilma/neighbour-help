import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AppShell from "@/components/AppShell";

// Wrapped in AppShell so a 404 still has the sidebar and a way back, rather
// than dropping the reader onto a bare page.
export default function NotFound() {
  return (
    <AppShell>
      <div className="mx-auto max-w-5xl">
        <section className="rounded-lg border border-border bg-card p-6">
          <h1 className="text-2xl font-bold">Not found</h1>
          <p className="mt-2 text-muted-foreground">
            That page does not exist. The community may have been removed, or
            the address may have a typo in it.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> All communities
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
