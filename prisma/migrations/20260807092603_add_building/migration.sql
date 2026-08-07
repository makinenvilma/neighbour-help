-- Introduces the Building tenant boundary.
--
-- Notice.buildingId is required, but the table already has rows, so this
-- migration adds the column as nullable, backfills every existing notice into a
-- default building, and only then enforces NOT NULL.

-- CreateTable
CREATE TABLE "Building" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "residentCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Building_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuildingInfo" (
    "id" TEXT NOT NULL,
    "buildingId" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BuildingInfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Building_slug_key" ON "Building"("slug");

-- CreateIndex
CREATE INDEX "BuildingInfo_buildingId_sortOrder_idx" ON "BuildingInfo"("buildingId", "sortOrder");

-- AddForeignKey
ALTER TABLE "BuildingInfo" ADD CONSTRAINT "BuildingInfo_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- The building the app was hardcoded to before it became multi-tenant.
INSERT INTO "Building" ("id", "slug", "name", "residentCount", "createdAt", "updatedAt")
VALUES ('bldg_maple_street_12', 'maple-street-12', 'Maple Street 12', 24, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- The "Good to know" rows that used to be a const array in src/app/page.tsx.
INSERT INTO "BuildingInfo" ("id", "buildingId", "icon", "label", "value", "sortOrder")
VALUES
  ('binfo_maple_laundry',   'bldg_maple_street_12', 'shirt',  'Laundry room', 'Book in the hallway, 2 h slots',   0),
  ('binfo_maple_sauna',     'bldg_maple_street_12', 'flame',  'Sauna',        'Wednesdays 5-9 PM',                1),
  ('binfo_maple_recycling', 'bldg_maple_street_12', 'trash',  'Recycling',    'Cardboard & bio emptied Mondays',  2),
  ('binfo_maple_caretaker', 'bldg_maple_street_12', 'phone',  'Caretaker',    '040 123 4567, weekdays 8-16',      3);

-- DropIndex
DROP INDEX "Notice_createdAt_idx";

-- AlterTable: nullable first so the existing rows survive.
ALTER TABLE "Notice" ADD COLUMN "buildingId" TEXT;

-- Backfill: every notice that existed before multi-tenancy belongs to that one
-- building.
UPDATE "Notice" SET "buildingId" = 'bldg_maple_street_12' WHERE "buildingId" IS NULL;

-- Now the column can carry the constraint the schema declares.
ALTER TABLE "Notice" ALTER COLUMN "buildingId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Notice_buildingId_createdAt_idx" ON "Notice"("buildingId", "createdAt");

-- AddForeignKey
ALTER TABLE "Notice" ADD CONSTRAINT "Notice_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE CASCADE ON UPDATE CASCADE;
