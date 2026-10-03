-- Notice ids go from a shared autoincrement counter to cuid-style strings, like
-- every other model. A counter makes notice URLs guessable and lets one tenant
-- read the platform's total volume off its own ids.
--
-- Written by hand. Prisma's generated diff casts the column to TEXT and stops,
-- which leaves every existing notice at "13", "14", ... - still sequential,
-- still guessable. Existing rows get fresh random ids here instead. Nothing
-- references Notice.id yet, so no foreign keys need following.
--
-- New ids come from Prisma Client (cuid() is generated in the app, not the
-- database), so the column has no default afterwards.

ALTER TABLE "Notice" DROP CONSTRAINT "Notice_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT;

DROP SEQUENCE "Notice_id_seq";

-- 'c' plus 24 random characters: the same shape as a cuid, so old and new ids
-- look alike in URLs. gen_random_uuid() is built in from PostgreSQL 13.
UPDATE "Notice"
SET "id" = 'c' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 24);

ALTER TABLE "Notice" ADD CONSTRAINT "Notice_pkey" PRIMARY KEY ("id");
