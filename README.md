# Neighbour Help

A notice board for people who live in the same building. Residents can post
announcements, ask neighbours for help, and report lost and found items.

## Status

Work in progress. The front end is up and running, but everything is still built on
placeholder data.

Working right now:

- Front page with the latest notices, open help requests and building info
- Notice board page at `/feed`
- New notice form at `/new`, with validation
- Light and dark mode, toggled from the sidebar

Not done yet:

- No database. All notices live in `src/lib/notices.ts` as a plain array.
- The new notice form validates but cannot save - submitting a valid notice
  says so instead of posting it.
- The "Comment" buttons do not do anything yet.
- No authentication, so the board is not restricted to residents.

## Tech

Next.js 15 with the App Router, React 19, TypeScript and Tailwind CSS v4. Icons are
from lucide-react. Colours come from CSS variables in `src/globals.css`, so dark mode
is just a class on `<html>`.

Prisma and PostgreSQL are the plan for the data layer, but neither is installed yet.

## Running it

```bash
git clone https://github.com/makinenvilma/neighbour-help.git
cd neighbour-help
npm install
npm run dev
```

Then open http://localhost:3000. No environment variables needed at this point,
since there is no database to connect to.

## Layout of the code

```
src/
  app/
    layout.tsx      sidebar + main content wrapper
    page.tsx        front page
    feed/page.tsx   notice board
    new/page.tsx    form for posting a notice
  components/
    Navbar.tsx      sidebar, holds the dark mode toggle
  lib/
    notices.ts      the placeholder notices, shared by the pages
  globals.css       theme variables for light and dark
```

## Next up

1. Prisma schema and a real PostgreSQL database, so `/new` can actually save
2. Comments
3. Authentication, so the board is restricted to residents
