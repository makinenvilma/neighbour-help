import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Its own boundary because the one at the community level says "Community not
// found", which is the wrong thing to tell someone whose community exists and
// whose notice does not.
//
// A server component, like its sibling. An earlier version read the slug with
// useParams() to link back to that community's board, but a client boundary
// here ships no markup at all - the response carried the <title> and an empty
// body. The slug is not worth a blank page, and the sidebar still links to the
// board the reader came from.
export default function NoticeNotFound() {
  return (
    <div className="mx-auto max-w-5xl">
      <section className="rounded-lg border border-border bg-card p-6">
        <h1 className="text-2xl font-bold">Notice not found</h1>
        <p className="mt-2 text-muted-foreground">
          This notice is not on the board. It may have been taken down, or the
          link may have a typo in it.
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
