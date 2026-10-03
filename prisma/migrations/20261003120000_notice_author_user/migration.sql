-- Notice.author goes from free text the poster typed to a relation to User.
--
-- Written by hand. Prisma's generated diff adds "authorId" as NOT NULL straight
-- away, which fails on any table that already has notices, and drops "author"
-- without looking at it.
--
-- Instead: add the column empty, fill it by matching each notice's author name
-- to a member of the same community, and only then make it required. Matching
-- within the community matters - two communities can both have an "Anna".
--
-- A notice with no matching member makes the SET NOT NULL step fail and the
-- whole migration roll back. That is on purpose: it is a decision about whose
-- notice it is, not something to guess at. Create the user (or delete the
-- notice) and run the migration again.

ALTER TABLE "Notice" ADD COLUMN "authorId" TEXT;

UPDATE "Notice" n
SET "authorId" = u."id"
FROM "User" u
JOIN "Membership" m ON m."userId" = u."id"
WHERE m."communityId" = n."communityId"
  AND u."name" = n."author";

ALTER TABLE "Notice" ALTER COLUMN "authorId" SET NOT NULL;

ALTER TABLE "Notice" DROP COLUMN "author";

CREATE INDEX "Notice_authorId_idx" ON "Notice"("authorId");

ALTER TABLE "Notice" ADD CONSTRAINT "Notice_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
