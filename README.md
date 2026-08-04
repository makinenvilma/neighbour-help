# Neighbour App

A small notice board for people who live in the same building. The idea came from
the paper notice board in our stairwell, which nobody ever reads: someone needs help
carrying a sofa, someone found a bike key, the water is going off on Thursday. This
is that board, except it fits in your pocket.

## Status

Work in progress. The front end is up and running, but everything is still built on
placeholder data.

Working right now:

- Front page with the latest notices, open help requests and building info
- Notice board page at `/feed`
- Light and dark mode, toggled from the sidebar

Not done yet:

- No database. All notices live in `src/lib/notices.ts` as a plain array.
- The "New Notice" and "Comment" buttons do not do anything yet.
- No login, so there is nothing keeping non-residents out.

## Tech

Next.js 15 with the App Router, React 19, TypeScript and Tailwind CSS v4. Icons are
from lucide-react. Colours come from CSS variables in `src/globals.css`, so dark mode
is just a class on `<html>`.

Prisma and PostgreSQL are the plan for the data layer, but neither is installed yet.

## Running it

```bash
git clone https://github.com/makinenvilma/naapuri-app.git
cd naapuri-app
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
  components/
    Navbar.tsx      sidebar, holds the dark mode toggle
  lib/
    notices.ts      the placeholder notices, shared by both pages
  globals.css       theme variables for light and dark
```

## Next up

1. Prisma schema and a real PostgreSQL database
2. A form that actually posts a notice
3. Comments
4. Some kind of login so the board stays between neighbours
