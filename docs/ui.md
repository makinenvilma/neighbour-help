# UI and navigation

The interface has two shapes: a sidebar from 768px (`md`) up, and a top bar plus
bottom tabs below that. Both are rendered by `AppShell`, and CSS decides which
one shows.

## The shell

`src/components/AppShell.tsx` wraps every signed-in page. It takes the community
being viewed (or `null` on the index) and reads the signed-in user itself.

```
Desktop (md and up)                 Mobile (below md)
┌──────────┬─────────────────────┐  ┌─────────────────────────┐
│ Koto     │                     │  │ Koto  Maple St ▾    (ME)│  MobileTopBar
│          │                     │  ├─────────────────────────┤
│ Communit.│                     │  │                         │
│ ──────── │       <main>        │  │         <main>          │
│ MAPLE ST │                     │  │                         │
│ Home     │                     │  │                         │
│ Board    │                     │  ├─────────────────────────┤
│ New      │                     │  │  Home  Notices   New    │  BottomTabs
│ ──────── │                     │  └─────────────────────────┘
│ Mary Ex. │                     │
│ Sign out │                     │
└──────────┴─────────────────────┘
  Sidebar
```

| Component | Shown | Job |
| --- | --- | --- |
| `Sidebar.tsx` | `md` and up | Product name, `NavLinks`, signed-in user and Sign out at the bottom |
| `NavLinks.tsx` | Inside the sidebar | "Communities", then the current community's Home, Notice Board and New Notice |
| `MobileTopBar.tsx` | Below `md` | Product name, the community switcher centred, and the account menu |
| `CommunitySwitcher.tsx` | Mobile top bar, inside a community | The community's name as a menu: your other communities, and All communities |
| `AccountMenu.tsx` | Mobile top bar | Initials button opening the signed-in user's name and email, and Sign out |
| `BottomTabs.tsx` | Below `md`, inside a community | Home, Notices, New, one tap away; the current one highlighted |
| `SignOutButton.tsx` | Sidebar; the account menu | A form that calls `signOut` |

### Mobile details

- The top bar is sticky, so the community name and the account menu survive
  scrolling.
- The community name is centred against the whole bar, not between its
  neighbours: "Koto" and the account button differ in width, so centring
  between them would look off-centre. It truncates rather than covering the
  button.
- The community name is the community switcher. Tapping it lists the
  communities you belong to (the current one ticked) and "All communities".
  Choosing one goes to that community's home page.
- The account menu holds who you are signed in as and sign out. It is on every
  page, including the communities index where the bottom tabs are not shown.
- Both menus use the HTML `popover` attribute, not React state. The browser
  opens them from their button and closes them on a tap outside or Escape, and
  opening one closes the other. They need no JavaScript and stay server
  components.
- The switcher is keyed by the community's slug. Moving between two communities
  keeps the layout mounted, and without a fresh element the open menu would
  stay open over the new page.
- The bottom tabs leave room for the iPhone home indicator
  (`env(safe-area-inset-bottom)`), and `<main>` gets extra bottom padding only
  where the tabs are actually shown.

## Page patterns

Most pages open with the same gradient hero (`from-primary to-accent`) holding a
small community name, a heading, a sentence and the main action. Content below
sits in white cards with a border (`rounded-lg border border-border bg-card`).
The boards are `max-w-5xl`; the single-notice page is `max-w-3xl` for a readable
line length.

`NoticeCard.tsx` is the card used on both the community home and the feed. Only
the title is a link: wrapping the whole card would nest the footer's button
inside a link, which is invalid HTML and confuses screen readers. What differs
between the two pages (the feed's Comment button) is passed in as `footer`.

The sign-in and sign-up pages have no shell, just a centred card, because the
navigation would lead to pages a signed-out visitor cannot open.

## Colours

Colours are CSS variables in `src/globals.css` (HSL values), mapped to Tailwind
names in `tailwind.config.ts`. Use the names, never raw colours:

| Name | Use |
| --- | --- |
| `background`, `foreground` | Page and body text |
| `card`, `card-foreground` | Cards and the navigation surfaces |
| `primary` | Links, buttons, the hero gradient start, icons |
| `accent` | The hero gradient end, the help panel icon |
| `muted`, `muted-foreground` | Hover backgrounds, secondary text |
| `destructive` | Form errors |
| `border`, `input`, `ring` | Borders, input borders, the focused input border |
| `badge-*` | Category badges (see [Notices](notices.md#categories)) |

There is no dark mode; the palette is light only.
