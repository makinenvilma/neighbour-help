# Neighbour Help

A notice board for people who live in the same building. Residents can post
announcements, ask neighbours for help, and report lost and found items.

## Status

Work in progress. Notices now live in a real PostgreSQL database and posting one
works end to end.

Working right now:

- Front page with the latest notices, open help requests and building info
- Notice board page at `/feed`
- New notice form at `/new` that validates and saves to the database
- Light and dark mode, toggled from the sidebar

Not done yet:

- The "Comment" buttons do not do anything yet.
- No authentication, so the board is not restricted to residents. `Notice.author`
  is still free text that the poster types in themselves.

## Tech

Next.js 15 with the App Router, React 19, TypeScript and Tailwind CSS v4. Icons are
from lucide-react. Colours come from CSS variables in `src/globals.css`, so dark mode
is just a class on `<html>`.

The data layer is Prisma 7 on PostgreSQL. Prisma 7 generates its client into
`src/generated/prisma` (gitignored) and connects through the `@prisma/adapter-pg`
driver adapter, so `src/lib/db.ts` builds the client with an adapter rather than a
connection string alone. The datasource URL is read in `prisma.config.ts`, not in
`schema.prisma`.

Reads go through `src/lib/queries.ts` from server components. Writes go through the
server action in `src/app/new/actions.ts`, which re-validates the input before
touching the database and then revalidates `/` and `/feed`.

`/` and `/feed` are prerendered at build time and kept fresh by the `revalidatePath`
calls in the server action. Two things follow from that: `npm run build` needs a
reachable database, and a notice added straight through SQL or Prisma Studio will not
appear until something revalidates the route. If either becomes annoying, add
`export const dynamic = "force-dynamic"` to those two pages.

## Running it

You need PostgreSQL running locally. On macOS:

```bash
brew install postgresql@18
brew services start postgresql@18
createdb neighbour_help
```

Then:

```bash
git clone https://github.com/makinenvilma/neighbour-help.git
cd neighbour-help
npm install
cp .env.example .env       # then check DATABASE_URL matches your setup
npx prisma migrate dev     # creates the tables
npx prisma db seed         # optional: adds a few example notices
npm run dev
```

Then open http://localhost:3000.

`DATABASE_URL` is the only environment variable. A local Homebrew Postgres has no
password and a superuser named after your macOS account, so it looks like:

```
DATABASE_URL="postgresql://<your-username>@localhost:5432/neighbour_help?schema=public"
```

Useful commands:

```bash
npx prisma studio      # browse and edit the data in a browser
npx prisma migrate dev # after editing schema.prisma
npx prisma generate    # regenerate the client
```

## Layout of the code

```
prisma/
  schema.prisma     the Notice model and NoticeCategory enum
  migrations/       generated SQL, committed
  seed.ts           example notices, only runs on an empty board
prisma.config.ts    schema path, migrations path, seed command, datasource URL
src/
  app/
    layout.tsx      sidebar + main content wrapper
    page.tsx        front page
    feed/page.tsx   notice board
    new/page.tsx    form for posting a notice
    new/actions.ts  createNotice server action
  components/
    Navbar.tsx      sidebar, holds the dark mode toggle
  lib/
    db.ts           Prisma client singleton
    queries.ts      read queries used by the server components
    notices.ts      category labels, badge styles, date formatting
  generated/prisma  generated Prisma client (gitignored)
  globals.css       theme variables for light and dark
```

## Next up

1. Comments
2. Authentication, so the board is restricted to residents - this is also when
   `Notice.author` should become a relation to a `User` table
