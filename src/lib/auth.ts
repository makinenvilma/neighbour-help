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
 */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
