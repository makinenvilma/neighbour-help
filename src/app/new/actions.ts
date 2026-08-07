"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { categoryLabels, type NoticeCategory } from "@/lib/notices";

export type NoticeField = "title" | "author" | "content" | "category";
export type NoticeFieldErrors = Partial<Record<NoticeField, string>>;

export type NewNoticeInput = {
  buildingSlug: string;
  title: string;
  author: string;
  content: string;
  category: NoticeCategory;
};

export type NewNoticeResult =
  | { ok: true; id: number }
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
  if (!author) errors.author = "Tell your neighbours who is posting.";
  if (content.length < 10)
    errors.content = "Write at least a sentence so people know what you mean.";
  if (!Object.hasOwn(categoryLabels, input.category))
    errors.category = "Pick one of the categories.";

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  // Take a slug and resolve it here rather than accepting a buildingId from the
  // client: a raw foreign key off the wire is a request to write into any
  // building at all.
  //
  // This confirms the building exists, not that the poster is allowed to post
  // in it. That check belongs here too, and lands with authentication.
  const building = await prisma.building.findUnique({
    where: { slug: input.buildingSlug },
    select: { id: true },
  });

  if (!building) {
    throw new Error(`No building with slug "${input.buildingSlug}".`);
  }

  const notice = await prisma.notice.create({
    data: {
      buildingId: building.id,
      title,
      author,
      content,
      category: input.category,
    },
  });

  revalidatePath("/");
  revalidatePath("/feed");

  return { ok: true, id: notice.id };
}
