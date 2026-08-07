-- Renames the tenant from "Building" to "Community" so the app is not tied to
-- housing companies.
--
-- Written by hand as renames. Prisma's generated diff would have dropped and
-- recreated the tables, which loses every row: the schema would have matched
-- and the data would have been gone.

-- Tables
ALTER TABLE "Building" RENAME TO "Community";
ALTER TABLE "BuildingInfo" RENAME TO "CommunityInfo";

-- Columns
ALTER TABLE "Community" RENAME COLUMN "residentCount" TO "memberCount";
ALTER TABLE "CommunityInfo" RENAME COLUMN "buildingId" TO "communityId";
ALTER TABLE "Notice" RENAME COLUMN "buildingId" TO "communityId";

-- Primary keys and indexes, so their names match what Prisma expects to find
ALTER INDEX "Building_pkey" RENAME TO "Community_pkey";
ALTER INDEX "Building_slug_key" RENAME TO "Community_slug_key";
ALTER INDEX "BuildingInfo_pkey" RENAME TO "CommunityInfo_pkey";
ALTER INDEX "BuildingInfo_buildingId_sortOrder_idx" RENAME TO "CommunityInfo_communityId_sortOrder_idx";
ALTER INDEX "Notice_buildingId_createdAt_idx" RENAME TO "Notice_communityId_createdAt_idx";

-- Foreign keys
ALTER TABLE "CommunityInfo" RENAME CONSTRAINT "BuildingInfo_buildingId_fkey" TO "CommunityInfo_communityId_fkey";
ALTER TABLE "Notice" RENAME CONSTRAINT "Notice_buildingId_fkey" TO "Notice_communityId_fkey";
