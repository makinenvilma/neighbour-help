# Tenancy and access

Each community is a tenant. The one rule that matters most in Koto is that one
community's data never reaches another, and that only members see a community
at all.

The danger is that getting this wrong does not crash anything. A page that
forgets to filter by community still renders; it just shows someone else's
notices. So the boundary is enforced by the shape of the code, not by
remembering.

## The membership check

`getCommunityForMember(slug)` in `src/lib/community.ts` is the single way any
page or action turns a slug from the URL into a community:

```ts
export const getCommunityForMember = cache(async (slug: string) => {
  const user = await requireUser();
  return prisma.community.findFirst({
    where: { slug, memberships: { some: { userId: user.id } } },
    include: { ... },
  });
});
```

In one query it:

1. requires a signed-in user (or redirects to `/login`), and
2. finds the community **only if that user is a member**.

It returns `null` both for a slug that does not exist and for a community you
are not in. Every caller turns `null` into a 404.

### Why a 404 and not "forbidden"

Answering "you are not allowed" for a real community and "not found" for a fake
one would let anyone discover which communities exist by trying slugs. Since
communities are customers, that is a customer list. The same 404 for both
cases reveals nothing.

### Why every page checks, not just the layout

Next.js renders a layout and its page independently, and a page's data fetching
does not wait for the layout's checks to pass. A check in the layout alone
protects nothing. So `layout.tsx`, `page.tsx` and each server action call
`getCommunityForMember` themselves. React `cache` makes the repeated calls in
one request cost a single query.

## Rules that keep the boundary

| Rule | Where | What it prevents |
| --- | --- | --- |
| Notice reads take `communityId` as a required argument | `getNotices`, `getNotice`, `getNoticeCounts` in `src/lib/queries.ts` | An unscoped query silently returning every community's notices |
| A single notice is looked up by `id` **and** `communityId` | `getNotice` | `/community/mine/notice/<id-from-another-community>` showing that notice |
| Actions take a slug, never a `communityId` | `createNotice` | A client sending any community's id and writing into it |
| The slug is resolved through the membership check | `createNotice` | Editing the slug in the URL to post into a community you are not in |
| The author comes from the session | `createNotice` | Posting under someone else's name |
| `/` lists only your communities | `getCommunitiesForUser` | Anyone listing every customer from the front page |
| The mobile community switcher lists only your communities | `getCommunityNavForUser` | The switcher becoming a second way to list other customers |

## Server actions are public endpoints

A server action can be called with a plain HTTP request; the form is just one
caller. So every action checks everything again, even when the page that renders
the form already did:

```ts
export async function createNotice(input) {
  const user = await requireUser();                        // who
  // ... validate input ...
  const community = await getCommunityForMember(input.communitySlug); // may they
  if (!community) throw new Error(...);
  await prisma.notice.create({ data: { communityId: community.id, authorId: user.id, ... } });
}
```

This was tested by capturing a real `createNotice` call from a member and
replaying it with a non-member's cookie: it is rejected and nothing is written.
Without a cookie, it redirects to `/login`.

## Roles

`Membership.role` is `member` or `admin`. The seed makes the "Maintenance"
account an admin.

`getCommunityForMember` returns the caller's `role` alongside the community.
Admin-only pages and actions go through `getCommunityForAdmin` instead, which
returns null for plain members as well as non-members, so callers handle both
the same way (a 404). Nothing uses it yet: the first admin features are
approving join requests and managing the join code (see Joining below).

## Joining

A community is joined through its join link, `/join/<joinCode>`, which admins
will print as a QR code. Opening it does not make anyone a member: it lets a
signed-in user send a **join request** with their apartment, and an admin
approves it. So the code is a way to *ask*, and leaking it - it hangs in a
stairwell - lets strangers ask, not get in.

A signed-out visitor sees the community's name and is pointed at creating an
account first (most people arriving from a QR code have none), with signing in
as the second choice; both come back to the join page through `?next=`.
Showing the name reveals nothing new - anyone with the code could sign up and
see it. `getJoinCommunityName` selects only the name for this.

Signed in, `getJoinTarget(code, userId)` in `src/lib/join.ts` resolves the code
and tells the page where the user stands: already a member (sent to the community),
waiting (told so), rejected or new (shown the form). It selects only the
community's name and slug, the one thing a code holder may see before
approval. An unknown or rotated code is a 404 with its own message.

`requestToJoin` checks everything again, like every action: signed in, the
code still valid, not already a member. It upserts on the unique
`(userId, communityId)` pair, so asking again after a rejection reopens the
same request.

Approving requests, and showing and rotating the code, are the admin view -
not built yet. Until then a request can only be approved in the database.

## Not built yet

- **Row-level security.** The database does not enforce any of this itself.
  Postgres row-level security would make it refuse cross-tenant reads even if
  application code got a filter wrong. Worth adding before the first paying
  customer.
