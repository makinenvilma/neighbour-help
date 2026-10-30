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

`Membership.role` is `member` or `admin`, and it belongs to the membership, not
the user: the same person can be an admin in one community and a member in
another. A membership is `member` unless something says otherwise. Exactly two
things do: creating a community makes its creator an admin, and the seed makes
the "Maintenance" account one. Approving a join request never does, so a join
link can never hand out admin rights.

`getCommunityForMember` returns the caller's `role` alongside the community.
Admin-only pages and actions go through `getCommunityForAdmin` instead, which
returns null for plain members as well as non-members, so callers handle both
the same way (a 404). The admin page, `/community/[slug]/admin`, and its
actions use it.

### Changing roles

The admin page lists every member. Admins can make a member an admin, make
another admin a member, or step down themselves (`setMemberRole`). The rule
that matters: **a community always keeps at least one admin**, or nobody could
ever let anyone in or make a new admin again. The page hides the button on the
last admin, and the action refuses it.

Counting admins and then demoting is a race on its own: two admins demoting
each other at the same moment both count two, both go ahead, and leave none.
The action therefore locks the community row (`SELECT ... FOR UPDATE`, in
`lockCommunity`) for the length of its transaction, so the second demotion waits, counts one, and stops.
This was tested by firing both demotions at once: with the lock one admin
always remains; with the lock removed, two runs out of three left none.

An admin who steps down is sent to the community home rather than a 404 on the
page they can no longer see.

### Removing a member

`removeMember` takes someone out of the community after a confirmation. They
lose access on their very next request, even mid-session, because every page
and action checks membership itself. Their notices stay on the board: they are
the community's history, not part of the membership. They can still open the
join link and ask again, and an admin decides.

It uses the same lock and the same last-admin rule as role changes. That check
looks unneeded - the caller is an admin and cannot remove themselves - but the
caller was checked before the lock: if another admin demoted them a moment
earlier, the person being removed may be the last admin left.

Admins cannot remove themselves here; leaving is for every member, below.

### Leaving

Any member can leave from the community home page ("Your membership"), after a
confirmation, and is sent to `/`. As with removal, their notices stay and they
can ask to join again. The only admin cannot leave: the page says so and links
to the admin page to make someone else an admin, and `leaveCommunity` refuses
it under the same lock, in case the other admin stepped down in the meantime.

`lockCommunity` and `isLastAdmin`, which the admin actions and
`leaveCommunity` share, live in `src/lib/community.ts` rather than in either
actions file. Every export of a `"use server"` file becomes an endpoint anyone
can call, so helpers there must stay unexported - and a helper two files need
has to be exported from somewhere.

The Admin link in the navigation is shown only to admins (`isAdmin` on the
navigation's community). That is convenience, not protection: the page and the
actions check the role themselves, and a member who types the URL gets a 404.

## Creating a community

Any signed-in user can create one at `/communities/new` and becomes its first
admin. Who *should* be allowed to - everyone, paying customers, accounts the
operator approved - is a business decision not made yet; every answer to it
needs this part.

`createCommunity` creates the community and the admin membership in one
statement (a nested create), so a community without an admin - one nobody
could ever manage - cannot exist even briefly.

The slug is the name made URL-safe plus a random suffix, e.g.
`maple-street-k3f9`, and the suffix is **always** added, not only when the
plain slug is taken. Adding it only on a clash would tell anyone who tries to
create "Maple Street" that a community of that name exists - the same customer
list the 404s are careful not to give away. A clash on the suffix is retried.

## Joining

A community is joined through its join link, `/join/<joinCode>`, which admins
will print as a QR code. Opening it does not make anyone a member: it lets a
signed-in user send a **join request** saying who they are, and an admin
approves it. So the code is a way to *ask*, and leaking it - it is meant to
hang where anyone can see it - lets strangers ask, not get in.

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

Signed-in users can also get there from `/` ("Join a community"), by pasting
the link or typing the code - for a link that arrived on another device or
was read out to them. `goToJoinPage` only pulls the code out of what was
pasted and redirects to `/join/<code>`; it does not look the code up, so it is
no faster a way to test codes than the join page itself. It accepts only
letters and digits, since the code ends up in a URL path. There is
deliberately **no search or list of communities** to join: that would list
every customer to anyone, and the code is how a community decides who may
ask.

`requestToJoin` checks everything again, like every action: signed in, the
code still valid, not already a member. It upserts on the unique
`(userId, communityId)` pair, so asking again after a rejection reopens the
same request.

Admins see pending requests on `/community/[slug]/admin` and approve or reject
them. `approveJoinRequest` and `rejectJoinRequest` in
`src/app/community/[slug]/admin/actions.ts`:

- go through `getCommunityForAdmin` first, and throw for anyone else;
- only touch a request matching **both** its id and that community's id, so an
  admin of one community cannot approve a request made to another by sending
  its id;
- only move a request that is still `pending` (`updateMany` with a status
  filter), so two admins clicking at once approve it once, and a rejected
  request is not quietly approved;
- approve in a transaction: the request becomes `approved` and the
  `Membership` is created together, or neither happens.

This was tested by capturing an admin's approve call and replaying it with a
plain member's cookie: it fails and nothing changes.

The same page shows the join link and its QR code, with buttons to copy the
link, download the QR code (SVG, so it prints sharp) and make a new link.

- **The QR code is drawn on the server** with the `qrcode` package and sent as
  an image, so no QR library reaches the browser.
- **The link's origin is the address the admin opened the page at** (the Host
  header). In production that is the real domain. In development it means a
  page opened at the machine's network address, e.g. `http://192.168.1.5:3000`,
  makes a QR code a phone on the same network can open, where `localhost` would
  not. Trusting the header is safe here only because the link is shown to the
  admin who sent it.
- **`rotateJoinCode`** gives the community a new random code after a
  confirmation. Old links and printed QR codes stop working at once. Requests
  already made with the old code stay in the list for the admin to decide.

## Not built yet

- **Row-level security.** The database does not enforce any of this itself.
  Postgres row-level security would make it refuse cross-tenant reads even if
  application code got a filter wrong. Worth adding before the first paying
  customer.
