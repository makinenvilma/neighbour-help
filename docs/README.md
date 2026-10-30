# Koto documentation

Koto is a notice board for communities: an apartment block, a street, a
co-working space, a club. Members post announcements, ask each other for help,
share events and report lost and found items. Each community is its own tenant,
and one community's data never reaches another.

The [project README](../README.md) covers getting it running in five minutes.
These pages go deeper, one area each:

| Page | What it covers |
| --- | --- |
| [Architecture](architecture.md) | The stack, the layers, where each kind of code lives |
| [Data model](data-model.md) | Every table, how they relate, and why they are shaped that way |
| [Pages and routes](routes.md) | Every URL, what it shows and what it requires |
| [Authentication](authentication.md) | Passwords, sessions, the cookie, sign-in, sign-up and sign-out |
| [Tenancy and access](tenancy-and-access.md) | The community boundary, the membership check, roles, joining, creating and leaving communities |
| [Notices](notices.md) | Reading notices, posting one, validation |
| [UI and navigation](ui.md) | The app shell, desktop and mobile navigation, colours |
| [Development](development.md) | Setup, seed accounts, migrations, testing by hand, pitfalls |

## Where things stand

Working:

- Sign-up, sign-in and sign-out, coming back to the page you started from.
- An index of the communities you belong to.
- Each community's home page, notice board, single-notice page and posting
  form, all restricted to members.
- **Creating a community**, which makes you its first admin.
- **Joining** through a community's join link or QR code (or by pasting the
  link or code), as a request an admin approves or rejects.
- **An admin page** per community: the join link and QR code (downloadable,
  and replaceable to cut off old ones), join requests, and the member list
  with make admin, step down and remove.
- **Leaving** a community. A community always keeps at least one admin.

Not built yet, roughly in the order they should come:

1. **Hardening sign-in.** No rate limiting (the design questions are open), no
   email verification, no password reset. Sessions last a fixed 30 days and
   expired rows are never cleaned up.
2. **Tidier refusals.** An unauthorised server action call throws, which is a
   500. Nothing is written, but a clean result or 404 would be better.
3. **Admins moderating notices** - removing one that should not be there.
4. **Row-level security in Postgres**, so the database enforces the tenant
   boundary even if application code gets it wrong.
5. **Smaller items.** Comments (the button on feed cards does nothing), feed
   pagination, a category filter in the UI, dates hardcoded to `en-US`.
6. **Next.js 16**, with `next lint` replaced by the ESLint CLI (it goes away in
   16), and the remaining `npm audit` items in build tools.
