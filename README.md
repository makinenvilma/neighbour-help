# Koto

A notice board for communities. Members can post announcements, ask each other
for help, and report lost and found items.

A community is whatever group shares the board: an apartment block, a street, a
co-working space, a club. Each one gets its own board at its own URL, and no
community can see another's notices.

Detailed documentation, one page per area (architecture, data model, routes,
authentication, tenancy, notices, UI, development), is in [`docs/`](docs/README.md).

## Status

Work in progress, heading towards a product where each community is its own
tenant. Notices live in PostgreSQL, posting one works end to end, and every
community is reachable at its own URL.

Working right now:

- Sign up, sign in and sign out at `/signup` and `/login`
- Community index at `/`, listing only the communities you belong to
- Community home page at `/community/[slug]` with the latest notices, open help
  requests and community info
- Notice board at `/community/[slug]/feed`
- New notice form at `/community/[slug]/new` that validates and saves
- Reads and writes are scoped to one community, and only its members can see or
  post to it. An unknown slug and a community you are not in are the same 404
- Notices are posted under the signed-in user's name
- Community name, member count and the "Good to know" rows come from the
  database, so every community renders its own
- Responsive shell: a sidebar from 768px up, bottom tabs below it

Not done yet:

- No way to join a community from the app. A new account belongs to nothing
  until invitations exist; for now memberships come from the seed.
- No email verification, password reset or rate limiting on sign-in.
- Roles are stored (`member`, `admin`) but nothing checks them yet.
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

### Authentication

Hand-rolled rather than a library, in three small modules:

- `src/lib/password.ts` hashes passwords with scrypt from Node's standard
  library. The hash string carries its own salt and parameters.
- `src/lib/session.ts` keeps sessions in the database. The browser's cookie
  holds a random token, the `Session` row holds its SHA-256 hash, so reading the
  database does not let anyone sign in. Signing out deletes the row.
- `src/lib/auth.ts` has `getCurrentUser()` (cached per request) and
  `requireUser()`, which redirects to `/login`.

Being signed in says who you are; a `Membership` row says which communities you
may see. `getCommunityForMember(slug)` in `src/lib/community.ts` checks both and is
the one way pages and actions resolve a community. Each page and action calls it
itself - a check in the layout alone is not enough, because Next.js renders a
layout and its page independently.

There is no `middleware.ts`. It could redirect signed-out visitors earlier, but
it cannot replace the per-page check, and a second place for the same rule is a
second place for it to be wrong.

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

- Membership is checked on every read and write through
  `getCommunityForMember`, so editing the slug in the URL gets you a 404, not
  someone else's board.

One thing is deliberately not done yet: the database does not enforce any of
this itself. Postgres row-level security is the belt-and-braces version, worth
adding before the first paying customer.

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
npx prisma db seed         # adds an example community, members and notices
npm run dev
```

Then open http://localhost:3000 and sign in as `mary@maple-street.example` with
the password `maple-street`. Every seeded member has that password;
`maintenance@maple-street.example` is the community's admin.

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
  schema.prisma            Community, CommunityInfo, Notice, User, Session, Membership
  migrations/              generated SQL, committed
  seed.ts                  one community, its members and example notices
prisma.config.ts           schema path, migrations path, seed command, datasource URL
src/
  app/
    layout.tsx             sidebar + main content wrapper
    page.tsx               your communities
    (auth)/                /login and /signup, their layout and server actions
    community/[slug]/
      page.tsx             community home
      feed/page.tsx        notice board
      notice/[id]/page.tsx one notice
      new/page.tsx         server component, resolves the community
      new/NewNoticeForm.tsx the form itself, a client component
      new/actions.ts       createNotice server action
  components/
    AppShell.tsx           sidebar + main column, picks the nav for the width
    Sidebar.tsx            desktop sidebar, hidden below md
    BottomTabs.tsx         mobile tab bar, hidden from md up
    NavLinks.tsx           the sidebar's links
    MobileTopBar.tsx       mobile top bar: community switcher and account menu
    CommunitySwitcher.tsx  mobile menu for moving between your communities
    AccountMenu.tsx        mobile menu with the signed-in user and sign out
    SignOutButton.tsx      sign-out form, used by the sidebar and account menu
  lib/
    db.ts                  Prisma client singleton
    auth.ts                getCurrentUser, requireUser
    session.ts             database sessions and the session cookie
    password.ts            scrypt password hashing
    community.ts           community lookups, including the membership check
    queries.ts             read queries, all scoped by communityId
    notices.ts             category labels, badge styles, date formatting
  generated/prisma         generated Prisma client (gitignored)
  globals.css              colour variables
```

## Next up

1. Invitations, so a new account can join a community
2. Use the roles: admins manage members and can remove notices
3. Rate limiting on sign-in, email verification and password reset
4. Postgres row-level security, so the database enforces the tenant boundary
   even if application code gets it wrong
5. Comments
