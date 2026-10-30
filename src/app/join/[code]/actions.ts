"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getJoinTarget } from "@/lib/join";

export type JoinFormState = {
  error?: string;
  apartment?: string;
};

// Enough for "Building B, staircase 2, apartment 34"; an unbounded field would
// let anyone put a novel in front of the admins.
const MAX_APARTMENT = 50;

/**
 * Ask to join the community whose join code is `code`. `code` is bound in by
 * the page, but a server action is a public endpoint, so it is looked up and
 * checked again here as if it came straight off the wire - which it can.
 */
export async function requestToJoin(
  code: string,
  _previous: JoinFormState,
  formData: FormData,
): Promise<JoinFormState> {
  const user = await requireUser(`/join/${encodeURIComponent(code)}`);

  const value = formData.get("apartment");
  const apartment = typeof value === "string" ? value.trim() : "";
  if (!apartment) return { error: "Tell the admins which apartment is yours." };
  if (apartment.length > MAX_APARTMENT)
    return {
      apartment,
      error: "That is too long. Just the apartment will do.",
    };

  const community = await getJoinTarget(code, user.id);
  if (!community) {
    return {
      apartment,
      error: "This join link no longer works. Ask for the new one.",
    };
  }
  if (community.memberships.length > 0) {
    redirect(`/community/${community.slug}`);
  }

  // Upsert on the unique (userId, communityId) pair: asking again after a
  // rejection reopens the same row rather than adding a second one, and two
  // submits racing each other cannot make two either.
  await prisma.joinRequest.upsert({
    where: {
      userId_communityId: { userId: user.id, communityId: community.id },
    },
    create: { userId: user.id, communityId: community.id, apartment },
    update: { apartment, status: "pending" },
  });

  // Back to the same page, which now finds the pending request and says so.
  redirect(`/join/${encodeURIComponent(code)}`);
}
