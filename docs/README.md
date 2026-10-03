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
| [Tenancy and access](tenancy-and-access.md) | The community boundary and the membership check |
| [Notices](notices.md) | Reading notices, posting one, validation |
| [UI and navigation](ui.md) | The app shell, desktop and mobile navigation, colours |
| [Development](development.md) | Setup, seed accounts, migrations, testing by hand, pitfalls |

## Where things stand

Working: sign-up, sign-in and sign-out; an index of the communities you belong
to; each community's home page, notice board, single-notice page and posting
form, all restricted to members.

Not built yet, roughly in the order they should come:

1. **Invitations.** A new account belongs to no community, and there is no way
   to join one from the app. Memberships come from the seed.
2. **Roles.** `Membership.role` is stored (`member` or `admin`) but nothing
   checks it yet. Admins should manage members and remove notices.
3. **Hardening sign-in.** No rate limiting, no email verification, no password
   reset. Sessions last a fixed 30 days and expired rows are never cleaned up.
4. **Row-level security in Postgres**, so the database enforces the tenant
   boundary even if application code gets it wrong.
5. **Smaller items.** Comments (the button on feed cards does nothing), feed
   pagination, a category filter in the UI, dates hardcoded to `en-US`.
