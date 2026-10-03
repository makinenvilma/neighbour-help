"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getCommunityForMember } from "@/lib/community";
import { categoryLabels, type NoticeCategory } from "@/lib/notices";

export type NoticeField = "title" | "content" | "category";
export type NoticeFieldErrors = Partial<Record<NoticeField, string>>;

export type NewNoticeInput = {
  communitySlug: string;
  title: string;
  content: string;
  category: NoticeCategory;
};

export type NewNoticeResult =
  | { ok: true; id: string }
  | { ok: false; errors: NoticeFieldErrors };

export async function createNotice(
  input: NewNoticeInput,
): Promise<NewNoticeResult> {
  // First, before looking at the input: a server action is a public endpoint,
  // and the page that renders the form being protected does not protect this.
  const user = await requireUser();

  const title = input.title.trim();
  const content = input.content.trim();

  // The form validates too, but the browser is not the only thing that can
  // call this.
  const errors: NoticeFieldErrors = {};
  if (!title) errors.title = "Give the notice a title.";
  if (content.length < 10)
    errors.content = "Write at least a sentence so people know what you mean.";
  if (!Object.hasOwn(categoryLabels, input.category))
    errors.category = "Pick one of the categories.";

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  // Take a slug and resolve it here rather than accepting a communityId from
  // the client: a raw foreign key off the wire is a request to write into any
  // community at all. The slug is just as editable, which is why this goes
  // through the membership check rather than a plain lookup - a slug for a
  // community you are not in resolves to nothing.
  const community = await getCommunityForMember(input.communitySlug);
  if (!community) {
    throw new Error(`Not a member of a community "${input.communitySlug}".`);
  }

  const notice = await prisma.notice.create({
    data: {
      communityId: community.id,
      // From the session, never from the input: who posted is not something
      // the poster gets to say.
      authorId: user.id,
      title,
      content,
      category: input.category,
    },
    select: { id: true },
  });

  // Only this community's pages: revalidating another tenant's routes would be
  // pointless work at best.
  revalidatePath(`/community/${community.slug}`);
  revalidatePath(`/community/${community.slug}/feed`);

  return { ok: true, id: notice.id };
}
