"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export type CreateCommunityState = {
  error?: string;
  name?: string;
};

const MAX_NAME = 100;

/**
 * The URL slug for a new community: the name made URL-safe, plus a random
 * suffix - "Maple Street" becomes "maple-street-k3f9".
 *
 * The suffix is always there, not only when the plain slug is taken. Adding it
 * only on a clash would answer "does a community called Maple Street exist?"
 * for anyone who tries to create one, which is the customer list the 404s
 * elsewhere are careful not to give away.
 */
// Letters that are not "a base letter plus an accent", so normalising below
// cannot take them apart and they would otherwise be dropped.
const STANDALONE_LETTERS: Record<string, string> = {
  ø: "o",
  æ: "ae",
  ß: "ss",
  đ: "d",
  ł: "l",
  þ: "th",
};

function slugFor(name: string) {
  const base = name
    .toLowerCase()
    .replace(/[øæßđłþ]/g, (letter) => STANDALONE_LETTERS[letter])
    // Splits "ä" into "a" plus a combining mark, which the next line drops, so
    // accented letters keep their base letter instead of vanishing.
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50)
    .replace(/-+$/, "");
  // 4 characters of base 36 from 3 random bytes: enough that clashes are rare,
  // short enough to type. A clash is retried, never trusted to not happen.
  const suffix = (randomBytes(3).readUIntBE(0, 3) % 36 ** 4)
    .toString(36)
    .padStart(4, "0");
  return `${base || "community"}-${suffix}`;
}

/**
 * Create a community with the signed-in user as its first admin.
 *
 * Any signed-in user may do this. Who should be allowed to - everyone, paying
 * customers, accounts the operator approved - is a business decision not made
 * yet; this is the part every answer to it needs.
 */
export async function createCommunity(
  _previous: CreateCommunityState,
  formData: FormData,
): Promise<CreateCommunityState> {
  const user = await requireUser();

  const value = formData.get("name");
  const name = typeof value === "string" ? value.trim() : "";
  if (name.length < 2) return { name, error: "Give the community a name." };
  if (name.length > MAX_NAME)
    return { name, error: "That name is too long." };

  let slug: string | undefined;
  for (let attempt = 0; attempt < 5 && !slug; attempt++) {
    const candidate = slugFor(name);
    try {
      await prisma.community.create({
        data: {
          name,
          slug: candidate,
          // A nested create runs in the same statement as the community, so
          // there is never a community without its admin - one nobody could
          // ever manage.
          memberships: { create: { userId: user.id, role: "admin" } },
        },
      });
      slug = candidate;
    } catch (error) {
      // A slug clash: go round with a new suffix. Anything else is a real
      // error.
      if (
        !(
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        )
      ) {
        throw error;
      }
    }
  }
  if (!slug) {
    return { name, error: "Something went wrong. Please try again." };
  }

  // Straight to the admin page: the first thing a new community needs is its
  // join link, so there is someone to post to.
  redirect(`/community/${slug}/admin`);
}
