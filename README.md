# Neighbour Help

A notice board for people who live in the same building. Residents can post
announcements, ask neighbours for help, and report lost and found items.

## Status

Work in progress, heading towards a product where each housing company
(taloyhtiö) is its own tenant. Notices live in PostgreSQL, posting one works end
to end, and the data model is multi-tenant.

Working right now:

- Front page with the latest notices, open help requests and building info
- Notice board page at `/feed`
- New notice form at `/new` that validates and saves to the database
- Every notice belongs to a `Building`, and reads and writes are scoped to one
- Building name, resident count and the "Good to know" rows come from the
  database, so a second building renders its own
- Light and dark mode, toggled from the sidebar

Not done yet:

- No per-building routing. Every page renders the building named by
  `DEFAULT_BUILDING_SLUG`, so only one is reachable at a time. `/talo/[slug]` is
  the next step.
- No authentication, so the board is not restricted to residents and nothing
  stops someone posting into a building they do not live in. `Notice.author` is
  still free text that the poster types in themselves.
- The "Comment" buttons do not do anything yet.

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

### The tenant boundary

`Building` is the tenant. Every row that belongs to one carries its `buildingId`,
and one building's data must never reach another. The danger is that forgetting
the filter does not crash anything - the page renders, there are just too many
notices on it - so the boundary is enforced by shape rather than by care:

- `getNotices(buildingId)` takes the id as a required parameter, so omitting it
  is a type error rather than a silent leak. Pages call this instead of touching
  `prisma.notice` directly.
- `createNotice` takes a **slug** and looks the building up server-side. A raw
  foreign key accepted off the wire is a request to write into any building at
  all.
- Deleting a building cascades to its notices and info rows, so nothing is left
  orphaned and unscoped.

Two things are deliberately not done yet. There is no check that the poster is
*allowed* to post in a building - that is authorization, and it arrives with
authentication. And the database does not enforce any of this itself; Postgres
row-level security is the belt-and-braces version, worth adding before the first
paying customer.

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

Two environment variables. A local Homebrew Postgres has no password and a
superuser named after your macOS account, so `DATABASE_URL` looks like:

```
DATABASE_URL="postgresql://<your-username>@localhost:5432/neighbour_help?schema=public"
```

`DEFAULT_BUILDING_SLUG` picks which building the pages render, defaulting to
`maple-street-12`. It exists only until `/talo/[slug]` routing lands, and it is
also a quick way to check the tenant scoping: seed a second building, point the
variable at it, and the whole app should switch over without a trace of the
first.

Useful commands:

```bash
npx prisma studio      # browse and edit the data in a browser
npx prisma migrate dev # after editing schema.prisma
npx prisma generate    # regenerate the client
```

## Layout of the code

```
prisma/
  schema.prisma          Building, BuildingInfo, Notice, NoticeCategory
  migrations/            generated SQL, committed
  seed.ts                one building and its example notices
prisma.config.ts         schema path, migrations path, seed command, datasource URL
src/
  app/
    layout.tsx           sidebar + main content wrapper
    page.tsx             front page
    feed/page.tsx        notice board
    new/page.tsx         server component, resolves the building
    new/NewNoticeForm.tsx the form itself, a client component
    new/actions.ts       createNotice server action
  components/
    Navbar.tsx           sidebar, holds the dark mode toggle
  lib/
    db.ts                Prisma client singleton
    building.ts          resolves which building a page is showing
    queries.ts           read queries, all scoped by buildingId
    notices.ts           category labels, badge styles, date formatting
  generated/prisma       generated Prisma client (gitignored)
  globals.css            theme variables for light and dark
```

## Next up

1. `/talo/[slug]` routing, so more than one building is reachable and
   `DEFAULT_BUILDING_SLUG` can go away
2. Authentication and roles (resident, board, isännöitsijä). This is where
   `Notice.author` becomes a relation to a `User` table, and where the check
   that a poster actually belongs to the building they are posting in lives.
   The URL alone must never be trusted for that.
3. Postgres row-level security, so the database enforces the tenant boundary
   even if application code gets it wrong
4. Comments
