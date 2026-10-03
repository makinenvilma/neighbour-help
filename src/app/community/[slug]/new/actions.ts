"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { categoryLabels, type NoticeCategory } from "@/lib/notices";

export type NoticeField = "title" | "author" | "content" | "category";
export type NoticeFieldErrors = Partial<Record<NoticeField, string>>;

export type NewNoticeInput = {
  communitySlug: string;
  title: string;
  author: string;
  content: string;
  category: NoticeCategory;
};

export type NewNoticeResult =
  | { ok: true; id: string }
  | { ok: false; errors: NoticeFieldErrors };

export async function createNotice(
  input: NewNoticeInput,
): Promise<NewNoticeResult> {
  const title = input.title.trim();
  const author = input.author.trim();
  const content = input.content.trim();

  // The form validates too, but a server action is a public endpoint - the
  // browser is not the only thing that can call it.
  const errors: NoticeFieldErrors = {};
  if (!title) errors.title = "Give the notice a title.";
  if (!author) errors.author = "Tell the community who is posting.";
  if (content.length < 10)
    errors.content = "Write at least a sentence so people know what you mean.";
  if (!Object.hasOwn(categoryLabels, input.category))
    errors.category = "Pick one of the categories.";

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  // Take a slug and resolve it here rather than accepting a communityId from
  // the client: a raw foreign key off the wire is a request to write into any
  // community at all.
  //
  // This confirms the community exists, not that the poster is allowed to post
  // in it. The slug arrives from the URL, which anyone can edit, so that check
  // has to compare the signed-in user's membership - and it lands with
  // authentication.
  const community = await prisma.community.findUnique({
    where: { slug: input.communitySlug },
    select: { id: true, slug: true },
  });

  if (!community) {
    throw new Error(`No community with slug "${input.communitySlug}".`);
  }

  const notice = await prisma.notice.create({
    data: {
      communityId: community.id,
      title,
      author,
      content,
      category: input.category,
    },
  });

  // Only this community's pages: revalidating another tenant's routes would be
  // pointless work at best.
  revalidatePath(`/community/${community.slug}`);
  revalidatePath(`/community/${community.slug}/feed`);

  return { ok: true, id: notice.id };
}
