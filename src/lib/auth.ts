import { cache } from "react";
import { redirect } from "next/navigation";
import { readSession } from "@/lib/session";

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof readSession>>>;

/**
 * Who is signed in, or null.
 *
 * Wrapped in `cache` so the shell, the page and anything else rendering in the
 * same request share one session lookup.
 */
export const getCurrentUser = cache(readSession);

/**
 * The signed-in user, or a redirect to the sign-in page.
 *
 * Every page and action that needs a user calls this itself. Checking once in a
 * layout is not enough: Next.js renders layouts and pages separately, and a
 * page's data fetching does not wait for its layout's check to pass.
 *
 * `returnTo` is where signing in should lead back to, for pages people arrive
 * at from outside - a join link opened from a QR code would otherwise be lost
 * on the way through the sign-in form.
 */
export async function requireUser(returnTo?: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(
      returnTo ? `/login?next=${encodeURIComponent(returnTo)}` : "/login",
    );
  }
  return user;
}

// Never a real origin: `.invalid` is reserved and cannot resolve.
const PATH_BASE = "http://koto.invalid";

/**
 * `next` if it is a path on this site, otherwise "/".
 *
 * `next` arrives in the URL, so anyone can make a sign-in link carrying one.
 * Redirecting to it as is would be an open redirect: a real Koto sign-in page
 * that sends people on to a look-alike site asking for their password again.
 *
 * Checking for a leading "/" is not enough - "//evil.example" and
 * "/\evil.example" are both read by browsers as another host. Resolving it the
 * way a browser would and checking the origin did not change catches those and
 * whatever tricks a prefix check would miss.
 */
export function safeNextPath(next: string | undefined): string {
  if (!next?.startsWith("/")) return "/";
  try {
    const url = new URL(next, PATH_BASE);
    if (url.origin === PATH_BASE) return url.pathname + url.search + url.hash;
  } catch {
    // Not parseable as a URL at all.
  }
  return "/";
}
