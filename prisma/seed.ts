import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const BUILDING = {
  slug: "maple-street-12",
  name: "Maple Street 12",
  residentCount: 24,
};

const INFO_ITEMS = [
  { icon: "shirt", label: "Laundry room", value: "Book in the hallway, 2 h slots", sortOrder: 0 },
  { icon: "flame", label: "Sauna", value: "Wednesdays 5-9 PM", sortOrder: 1 },
  { icon: "trash", label: "Recycling", value: "Cardboard & bio emptied Mondays", sortOrder: 2 },
  { icon: "phone", label: "Caretaker", value: "040 123 4567, weekdays 8-16", sortOrder: 3 },
];

const NOTICES = [
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
  // The add_building migration already creates this building so it can backfill
  // the notices that predate multi-tenancy. Upsert so the seed also works on a
  // database where that row is missing.
  const building = await prisma.building.upsert({
    where: { slug: BUILDING.slug },
    update: {},
    create: BUILDING,
  });

  const infoCount = await prisma.buildingInfo.count({
    where: { buildingId: building.id },
  });
  if (infoCount === 0) {
    await prisma.buildingInfo.createMany({
      data: INFO_ITEMS.map((item) => ({ ...item, buildingId: building.id })),
    });
  }

  // Non-destructive: a board that already has notices is left alone.
  const existing = await prisma.notice.count({
    where: { buildingId: building.id },
  });
  if (existing > 0) {
    console.log(
      `Skipping notices, ${building.name} already has ${existing} of them.`,
    );
    return;
  }

  await prisma.notice.createMany({
    data: NOTICES.map((notice) => ({ ...notice, buildingId: building.id })),
  });
  console.log(`Seeded ${NOTICES.length} notices for ${building.name}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
