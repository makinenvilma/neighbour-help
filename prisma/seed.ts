import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// The notices that used to live in src/lib/notices.ts as placeholder data.
const notices = [
  {
    title: "Neighbour Evening Announcement",
    content:
      "You are welcome to the neighbour evening next Saturday at 6 PM in the housing association's club room!",
    author: "Mary Example",
    category: "event",
    createdAt: new Date("2025-04-24"),
  },
  {
    title: "Lost & Found: Bicycle Key",
    content:
      "A bicycle key was found in the bike storage. You can pick it up from under the notice board in staircase A.",
    author: "Peter Example",
    category: "lost_found",
    createdAt: new Date("2025-04-23"),
  },
  {
    title: "Help carrying a sofa on Sunday",
    content:
      "Moving in to apartment B 24 and the sofa will not fit up the stairs alone. Two pairs of hands for 15 minutes would save my back - coffee and pulla as payment.",
    author: "Anna Example",
    category: "help",
    createdAt: new Date("2025-04-22"),
  },
  {
    title: "Water shut-off on Thursday 9-14",
    content:
      "The pipe maintenance continues in staircase A. Water will be off between 9 AM and 2 PM. Please store some drinking water in advance.",
    author: "Housing Association",
    category: "announcement",
    createdAt: new Date("2025-04-21"),
  },
  {
    title: "Anyone have a drill I could borrow?",
    content:
      "Putting up shelves this weekend and would rather borrow than buy. Happy to return it the same day.",
    author: "Jonas Example",
    category: "help",
    createdAt: new Date("2025-04-20"),
  },
] as const;

async function main() {
  // Non-destructive: a board that already has notices is left alone.
  const existing = await prisma.notice.count();
  if (existing > 0) {
    console.log(`Skipping seed, the board already has ${existing} notices.`);
    return;
  }

  await prisma.notice.createMany({ data: [...notices] });
  console.log(`Seeded ${notices.length} notices.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
