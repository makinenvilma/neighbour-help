-- Written by hand. Prisma generates DROP COLUMN "apartment" + ADD COLUMN "note",
-- which would throw away every request's text (and fail on existing rows,
-- since the new column is NOT NULL with no default). A rename keeps the data.
ALTER TABLE "JoinRequest" RENAME COLUMN "apartment" TO "note";
