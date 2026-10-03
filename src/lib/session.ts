import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

/**
 * Database sessions behind a cookie.
 *
 * Signing in creates a random token. The browser keeps the token in a cookie,
 * the database keeps only its SHA-256 hash. On every request the cookie's token
 * is hashed and looked up. A database leak therefore hands over hashes that
 * cannot be turned back into working cookies, and signing someone out is just
 * deleting their row.
 *
 * Plain SHA-256 is enough here, unlike for passwords: the token is 32 random
 * bytes, not something a person chose, so there is nothing to guess.
 */
const COOKIE_NAME = "session";
const SESSION_DAYS = 30;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Start a session for `userId` and give the browser its cookie.
 *
 * Next.js only lets server actions and route handlers set cookies, so this is
 * called from the sign-in and sign-up actions and nowhere else.
 */
export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: { id: hashToken(token), userId, expiresAt },
  });

  (await cookies()).set(COOKIE_NAME, token, {
    // JavaScript in the page cannot read it, so an XSS bug cannot steal it.
    httpOnly: true,
    // Only sent over HTTPS - except on localhost, which is plain HTTP.
    secure: process.env.NODE_ENV === "production",
    // Not sent on cross-site POSTs, the usual CSRF route. Still sent when
    // someone follows a link here, so arriving from an email stays signed in.
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/**
 * The signed-in user for this request, or null.
 *
 * Callers should use getCurrentUser from lib/auth.ts, which caches this per
 * request, rather than calling it directly.
 */
export async function readSession() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { id: hashToken(token) },
    // Never select passwordHash: nothing after this point needs it, and what is
    // not loaded cannot end up rendered into a page by accident.
    select: {
      expiresAt: true,
      user: { select: { id: true, email: true, name: true } },
    },
  });

  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
}

/** Sign this browser out: forget the session server-side and drop the cookie. */
export async function deleteSession() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token) {
    // deleteMany rather than delete: a session that is already gone is not an
    // error when the goal is for it to be gone.
    await prisma.session.deleteMany({ where: { id: hashToken(token) } });
  }
  store.delete(COOKIE_NAME);
}
