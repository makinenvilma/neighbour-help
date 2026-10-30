"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getJoinTarget } from "@/lib/join";

export type JoinFormState = {
  error?: string;
  note?: string;
};

// Enough for a sentence like "Second floor, the one with the dog"; an
// unbounded field would let anyone put a novel in front of the admins.
const MAX_NOTE = 100;

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

  const value = formData.get("note");
  const note = typeof value === "string" ? value.trim() : "";
  if (!note) return { error: "Tell the admins who you are." };
  if (note.length > MAX_NOTE)
    return { note, error: "That is too long. A few words will do." };

  const community = await getJoinTarget(code, user.id);
  if (!community) {
    return {
      note,
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
    create: { userId: user.id, communityId: community.id, note },
    update: { note, status: "pending" },
  });

  // Back to the same page, which now finds the pending request and says so.
  redirect(`/join/${encodeURIComponent(code)}`);
}
