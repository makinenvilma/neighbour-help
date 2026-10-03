# Development

## Setup

You need Node.js and PostgreSQL. On macOS:

```bash
brew install postgresql@18
brew services start postgresql@18
createdb koto
```

Then:

```bash
npm install
cp .env.example .env       # check DATABASE_URL
npx prisma migrate dev     # create the tables
npx prisma db seed         # example community, members and notices
npm run dev                # http://localhost:3000
```

`DATABASE_URL` is the only environment variable. A local Homebrew Postgres has no
password and a superuser named after your macOS account:

```
DATABASE_URL="postgresql://<your-username>@localhost:5432/koto?schema=public"
```

## Seed accounts

The seed creates one community, **Maple Street**, with five members. Every one
has the password `maple-street`.

| Email | Role |
| --- | --- |
| `mary@maple-street.example` | member |
| `peter@maple-street.example` | member |
| `anna@maple-street.example` | member |
| `jonas@maple-street.example` | member |
| `maintenance@maple-street.example` | admin |

The seed is safe to run again: users and memberships are upserted, and notices
are only added to a board that has none.

To see what a non-member sees, sign up with a new account. It belongs to no
community, and `/community/maple-street` is a 404 for it.

## Commands

| Command | Does |
| --- | --- |
| `npm run dev` | Dev server with Turbopack |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Type check, including `prisma/seed.ts` |
| `npx prisma studio` | Browse and edit the data in a browser |
| `npx prisma generate` | Regenerate the client after a schema change |
| `npx prisma migrate deploy` | Apply committed migrations |
| `npx prisma migrate status` | Which migrations are applied |
| `npx prisma db seed` | Run the seed |

There is no automated test suite yet. Changes so far have been checked by
running the app and driving it in a browser.

## Changing the schema

`npx prisma migrate dev` creates and applies a migration in one step, but it
needs an interactive terminal. When it is not available, or when you want to
read the SQL before it runs (always a good idea), do it in steps:

```bash
# 1. Edit prisma/schema.prisma

# 2. See the SQL Prisma would run against the current database
npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script

# 3. Save it (edited if needed) as
#    prisma/migrations/<yyyymmddhhmmss>_<name>/migration.sql

# 4. Apply it, regenerate the client, check nothing is left over
npx prisma migrate deploy
npx prisma generate
npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script
#    → "-- This is an empty migration."

# 5. Restart the dev server
```

**Read the SQL in step 2.** If it drops a column or table that holds data, or
adds a required column to a table that has rows, write the migration yourself.
The hand-written ones in `prisma/migrations/` are worked examples: renaming
instead of dropping, generating new ids, backfilling a new column before making
it required. Start each with a comment saying why it was written by hand.

## Pitfalls

**Restart the dev server after `prisma generate`.** The Prisma client is kept on
`globalThis` across hot reloads, so the server keeps using the old client. The
symptom is a Prisma error that does not match the schema, for example
`Expected an integer in column 'id', got string`.

**Do not put auth checks only in a layout.** Pages render independently of their
layout. Call `requireUser()` or `getCommunityForMember()` in the page or action
itself. See [Tenancy and access](tenancy-and-access.md).

**Cookies can only be set in server actions and route handlers.** Calling
`createSession` or `deleteSession` while rendering a page throws.

**`redirect()` works by throwing.** Keep it outside `try`/`catch`, or the catch
swallows the redirect.

**New Tailwind classes not showing up?** The browser is using an old copy of
the stylesheet. The dev server serves the CSS under the same file name after it
changes, and browsers (Safari especially) keep the cached one. Do a hard reload:
Cmd + Shift + R in Chrome and Firefox, **Cmd + Option + R** in Safari, where
Cmd + Shift + R does something else. If that is not enough, restart the dev
server and reload again. Check that the class is really missing first: if
`curl` on the page's CSS file finds it, the server is fine and the cache is not.

**Testing in a browser:** the sidebar's Sign out button is a submit button and
comes before `<main>` in the page. A test that clicks `button[type=submit]`
signs itself out; scope the selector to `main`. The mobile menus are popovers:
check `element.matches(":popover-open")` to see whether one is open.
