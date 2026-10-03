import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const COMMUNITY = {
  slug: "maple-street",
  name: "Maple Street",
};

// Every seeded account has this password. Fine for a local database full of
// example people; it is printed below so nobody has to look it up.
const DEV_PASSWORD = "maple-street";

const USERS = [
  { name: "Mary Example", email: "mary@maple-street.example", role: "member" },
  { name: "Peter Example", email: "peter@maple-street.example", role: "member" },
  { name: "Anna Example", email: "anna@maple-street.example", role: "member" },
  { name: "Jonas Example", email: "jonas@maple-street.example", role: "member" },
  { name: "Maintenance", email: "maintenance@maple-street.example", role: "admin" },
] as const;

const INFO_ITEMS = [
  { icon: "calendar", label: "Community meetup", value: "First Tuesday of the month, 6 PM", sortOrder: 0 },
  { icon: "shirt", label: "Shared laundry", value: "Book in the hallway, 2 h slots", sortOrder: 1 },
  { icon: "trash", label: "Recycling", value: "Cardboard and food waste collected on Mondays", sortOrder: 2 },
  { icon: "phone", label: "Contact", value: "hello@maple-street.example, weekdays 9-17", sortOrder: 3 },
];

const NOTICES = [
  {
    title: "Community evening next Saturday",
    content:
      "You are welcome to the community evening next Saturday at 6 PM in the common room!",
    author: "Mary Example",
    category: "event",
    createdAt: new Date("2025-04-24"),
  },
  {
    title: "Found: bicycle key",
    content:
      "A bicycle key was found by the bike racks. You can pick it up from the noticeboard by the main entrance.",
    author: "Peter Example",
    category: "lost_found",
    createdAt: new Date("2025-04-23"),
  },
  {
    title: "Help carrying a sofa on Sunday",
    content:
      "Moving in this week and the sofa will not fit up the stairs alone. Two pairs of hands for 15 minutes would save my back - coffee and cake as thanks.",
    author: "Anna Example",
    category: "help",
    createdAt: new Date("2025-04-22"),
  },
  {
    title: "Water shut-off on Thursday 9-14",
    content:
      "Water will be off between 9 AM and 2 PM while the pipes are serviced. Please store some drinking water in advance.",
    author: "Maintenance",
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
  const community = await prisma.community.upsert({
    where: { slug: COMMUNITY.slug },
    update: {},
    create: COMMUNITY,
  });

  // Hashed once and shared: scrypt is slow on purpose, and five identical
  // hashes would only make seeding slower.
  const passwordHash = await hashPassword(DEV_PASSWORD);
  const userIds = new Map<string, string>();
  for (const { name, email, role } of USERS) {
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { name, email, passwordHash },
    });
    userIds.set(name, user.id);
    await prisma.membership.upsert({
      where: {
        userId_communityId: { userId: user.id, communityId: community.id },
      },
      update: {},
      create: { userId: user.id, communityId: community.id, role },
    });
  }
  console.log(
    `Seeded ${USERS.length} members. Sign in as ${USERS[0].email} / ${DEV_PASSWORD}.`,
  );

  const infoCount = await prisma.communityInfo.count({
    where: { communityId: community.id },
  });
  if (infoCount === 0) {
    await prisma.communityInfo.createMany({
      data: INFO_ITEMS.map((item) => ({ ...item, communityId: community.id })),
    });
  }

  // Non-destructive: a board that already has notices is left alone.
  const existing = await prisma.notice.count({
    where: { communityId: community.id },
  });
  if (existing > 0) {
    console.log(
      `Skipping notices, ${community.name} already has ${existing} of them.`,
    );
    return;
  }

  await prisma.notice.createMany({
    // NOTICES name their author; the table wants the user's id.
    data: NOTICES.map(({ author, ...notice }) => ({
      ...notice,
      communityId: community.id,
      authorId: userIds.get(author)!,
    })),
  });
  console.log(`Seeded ${NOTICES.length} notices for ${community.name}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
