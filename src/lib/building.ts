import { prisma } from "@/lib/db";

/**
 * Until `/talo/[slug]` routing lands, every page renders this one building.
 * Once routing exists the slug comes from the URL, and after that from the
 * signed-in user's membership.
 */
const DEFAULT_BUILDING_SLUG =
  process.env.DEFAULT_BUILDING_SLUG ?? "maple-street-12";

export function getBuildingBySlug(slug: string) {
  return prisma.building.findUnique({
    where: { slug },
    include: { infoItems: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function getCurrentBuilding() {
  const building = await getBuildingBySlug(DEFAULT_BUILDING_SLUG);

  if (!building) {
    throw new Error(
      `No building with slug "${DEFAULT_BUILDING_SLUG}". Run \`npx prisma db seed\`, or set DEFAULT_BUILDING_SLUG to a building that exists.`,
    );
  }

  return building;
}

export type BuildingWithInfo = Awaited<ReturnType<typeof getCurrentBuilding>>;
