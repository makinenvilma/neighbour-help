"use server";

import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createSession, deleteSession } from "@/lib/session";

/**
 * What a form gets back when an action does not redirect. `email` and `name`
 * come back so the form can refill them; the password never does.
 */
export type AuthFormState = {
  error?: string;
  email?: string;
  name?: string;
};

// Long enough to rule out the worst guesses, no composition rules: NIST's
// current advice is that "one capital, one digit" rules make passwords harder
// to remember without making them harder to guess.
const MIN_PASSWORD = 8;
// scrypt does not care, but an unbounded field is a free way to make the server
// hash a megabyte.
const MAX_PASSWORD = 200;

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function signUp(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = field(formData, "name").trim();
  const email = field(formData, "email").trim().toLowerCase();
  const password = field(formData, "password");
  const back = { name, email };

  if (!name) return { ...back, error: "Tell us your name." };
  if (name.length > 100) return { ...back, error: "That name is too long." };
  // Only a sanity check. The real test of an address is mail arriving at it,
  // which needs email verification - not built yet.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { ...back, error: "That does not look like an email address." };
  if (password.length < MIN_PASSWORD)
    return {
      ...back,
      error: `Use a password of at least ${MIN_PASSWORD} characters.`,
    };
  if (password.length > MAX_PASSWORD)
    return { ...back, error: "That password is too long." };

  let userId: string;
  try {
    const user = await prisma.user.create({
      data: { name, email, passwordHash: await hashPassword(password) },
      select: { id: true },
    });
    userId = user.id;
  } catch (error) {
    // The unique index on email decides, not a findUnique beforehand: two
    // sign-ups racing for one address would both pass a check-then-insert.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { ...back, error: "There is already an account with that email." };
    }
    throw error;
  }

  await createSession(userId);
  // redirect() works by throwing, so it stays outside the try above.
  redirect("/");
}

/**
 * A hash of a password nobody has, made once. Signing in with an unknown email
 * still checks the password against it, so a wrong email takes as long as a
 * wrong password. Otherwise the response time alone would tell an attacker
 * which addresses have accounts.
 */
let decoyHash: Promise<string> | undefined;

export async function signIn(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = field(formData, "email").trim().toLowerCase();
  const password = field(formData, "password");

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true },
  });

  decoyHash ??= hashPassword("decoy password that matches no account");
  const valid = await verifyPassword(
    password.slice(0, MAX_PASSWORD),
    user?.passwordHash ?? (await decoyHash),
  );

  if (!user || !valid) {
    // One message for both cases, for the same reason as the decoy hash.
    return { email, error: "Wrong email or password." };
  }

  await createSession(user.id);
  redirect("/");
}

export async function signOut() {
  await deleteSession();
  redirect("/login");
}
