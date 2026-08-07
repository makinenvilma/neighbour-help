# Koto

A notice board for communities. Members can post announcements, ask each other
for help, and report lost and found items.

A community is whatever group shares the board: an apartment block, a street, a
co-working space, a club. Each one gets its own board at its own URL, and no
community can see another's notices.

## Status

Work in progress, heading towards a product where each community is its own
tenant. Notices live in PostgreSQL, posting one works end to end, and every
community is reachable at its own URL.

Working right now:

- Community index at `/`
- Community home page at `/community/[slug]` with the latest notices, open help
  requests and community info
- Notice board at `/community/[slug]/feed`
- New notice form at `/community/[slug]/new` that validates and saves
- Reads and writes are scoped to one community; an unknown slug is a 404
- Community name, member count and the "Good to know" rows come from the
  database, so every community renders its own
- Responsive shell: a sidebar from 768px up, bottom tabs below it

Not done yet:

- No authentication, so boards are not restricted to members and nothing stops
  someone posting into a community they do not belong to. `Notice.author` is
  still free text that the poster types in themselves.
- `/` lists every community to anyone who asks. Fine for local development,
  wrong for a real deployment - customers should not be enumerable.
- The "Comment" buttons do not do anything yet.

## Tech

Next.js 15 with the App Router, React 19, TypeScript and Tailwind CSS v4. Icons are
from lucide-react. Colours come from CSS variables in `src/globals.css`. There is no
dark mode - the palette is light only.

The data layer is Prisma 7 on PostgreSQL. Prisma 7 generates its client into
`src/generated/prisma` (gitignored) and connects through the `@prisma/adapter-pg`
driver adapter, so `src/lib/db.ts` builds the client with an adapter rather than a
connection string alone. The datasource URL is read in `prisma.config.ts`, not in
`schema.prisma`.

Reads go through `src/lib/queries.ts` from server components. Writes go through the
server action in `src/app/community/[slug]/new/actions.ts`, which re-validates the
input before touching the database and then revalidates that community's pages.

### The tenant boundary

`Community` is the tenant. Every row that belongs to one carries its
`communityId`, and one community's data must never reach another. The danger is
that forgetting the filter does not crash anything - the page renders, there are
just too many notices on it - so the boundary is enforced by shape rather than by
care:

- `getNotices(communityId)` takes the id as a required parameter, so omitting it
  is a type error rather than a silent leak. Pages call this instead of touching
  `prisma.notice` directly.
- `createNotice` takes a **slug** and looks the community up server-side. A raw
  foreign key accepted off the wire is a request to write into any community at
  all.
- Deleting a community cascades to its notices and info rows, so nothing is left
  orphaned and unscoped.

Two things are deliberately not done yet. There is no check that the poster is
*allowed* to post in a community - the slug comes from the URL, which anyone can
edit, so that check has to compare the signed-in user's membership, and it
arrives with authentication. And the database does not enforce any of this
itself; Postgres row-level security is the belt-and-braces version, worth adding
before the first paying customer.

## Running it

You need PostgreSQL running locally. On macOS:

```bash
brew install postgresql@18
brew services start postgresql@18
createdb koto
```

Then:

```bash
git clone https://github.com/makinenvilma/neighbour-help.git
cd neighbour-help
npm install
cp .env.example .env       # then check DATABASE_URL matches your setup
npx prisma migrate dev     # creates the tables
npx prisma db seed         # optional: adds an example community and notices
npm run dev
```

Then open http://localhost:3000 and pick a community.

`DATABASE_URL` is the only environment variable. A local Homebrew Postgres has no
password and a superuser named after your macOS account, so it looks like:

```
DATABASE_URL="postgresql://<your-username>@localhost:5432/koto?schema=public"
```

Useful commands:

```bash
npx prisma studio      # browse and edit the data in a browser
npx prisma migrate dev # after editing schema.prisma
npx prisma generate    # regenerate the client
```

Two things worth knowing when the schema changes: `prisma migrate dev` does not
always regenerate the client, so run `prisma generate` after it, and the dev
server keeps the old client in memory, so restart it too.

## Layout of the code

```
prisma/
  schema.prisma            Community, CommunityInfo, Notice, NoticeCategory
  migrations/              generated SQL, committed
  seed.ts                  one community and its example notices
prisma.config.ts           schema path, migrations path, seed command, datasource URL
src/
  app/
    layout.tsx             sidebar + main content wrapper
    page.tsx               community index
    community/[slug]/
      page.tsx             community home
      feed/page.tsx        notice board
      new/page.tsx         server component, resolves the community
      new/NewNoticeForm.tsx the form itself, a client component
      new/actions.ts       createNotice server action
  components/
    AppShell.tsx           sidebar + main column, picks the nav for the width
    Sidebar.tsx            desktop sidebar, hidden below md
    BottomTabs.tsx         mobile tab bar, hidden from md up
    NavLinks.tsx           the sidebar's links
  lib/
    db.ts                  Prisma client singleton
    community.ts           community lookups
    queries.ts             read queries, all scoped by communityId
    notices.ts             category labels, badge styles, date formatting
  generated/prisma         generated Prisma client (gitignored)
  globals.css              colour variables
```

## Next up

1. Authentication and roles (member, moderator, administrator). This is where
   `Notice.author` becomes a relation to a `User` table, and where the check
   that a poster actually belongs to the community they are posting in lives.
   The URL alone must never be trusted for that.
2. Postgres row-level security, so the database enforces the tenant boundary
   even if application code gets it wrong
3. Replace the open community index at `/` with something that does not leak the
   customer list
4. Comments
