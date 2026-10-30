import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Its own page rather than the generic 404: the likeliest reason is an admin
// changing the code, and the fix is to ask for the new one.
//
// No AppShell, unlike the other 404s: people reach this from a QR code, often
// signed out, and the shell's navigation is only for signed-in users.
export default function JoinLinkNotFound() {
  return (
    <main className="flex min-h-dvh flex-1 items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <p className="mb-6 text-center text-2xl font-extrabold">Koto</p>
        <section className="rounded-lg border border-border bg-card p-6">
          <h1 className="text-2xl font-bold">This join link does not work</h1>
          <p className="mt-2 text-muted-foreground">
            The community may have changed its join code, which turns off the
            old links and QR codes. Ask someone in the community for the new
            one.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Go to Koto
          </Link>
        </section>
      </div>
    </main>
  );
}
