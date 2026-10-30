# Data model

Seven tables. `Community` is the tenant; everything that belongs to one carries
its `communityId`. `User` is global, so one person can belong to several
communities through `Membership`.

```mermaid
erDiagram
    User ||--o{ Session : "signed in on"
    User ||--o{ Membership : has
    Community ||--o{ Membership : has
    Community ||--o{ Notice : has
    Community ||--o{ CommunityInfo : has
    User ||--o{ JoinRequest : made
    Community ||--o{ JoinRequest : has
    User ||--o{ Notice : wrote

    User {
        string id PK "cuid"
        string email UK "stored lowercased"
        string name
        string passwordHash "scrypt"
    }
    Session {
        string id PK "SHA-256 of the cookie token"
        string userId FK
        datetime expiresAt
    }
    Membership {
        string userId PK,FK
        string communityId PK,FK
        enum role "member | admin"
    }
    Community {
        string id PK "cuid"
        string slug UK "used in URLs"
        string name
        string joinCode UK "secret in the join link"
    }
    JoinRequest {
        string id PK "cuid"
        string userId FK
        string communityId FK
        string note "free text: who they say they are"
        enum status "pending | approved | rejected"
    }
    CommunityInfo {
        string id PK "cuid"
        string communityId FK
        string icon "key into an icon map"
        string label
        string value
        int sortOrder
    }
    Notice {
        string id PK "cuid"
        string communityId FK
        string authorId FK
        string title
        string content
        enum category "announcement | help | event | lost_found"
    }
```

Timestamps are left out of the diagram: `User`, `Community`, `Notice` and
`JoinRequest` have
`createdAt` and `updatedAt`, `Session` and `Membership` only `createdAt`, and
`CommunityInfo` neither. The schema itself is
in [`prisma/schema.prisma`](../prisma/schema.prisma), commented model by model.

## The tables

| Table | One row is | Notes |
| --- | --- | --- |
| `Community` | A community with its own board | The tenant boundary. `slug` is unique and appears in every URL. |
| `CommunityInfo` | A "Good to know" line on the community home page | Separate table because every community has different ones. |
| `Notice` | One post on a board | `authorId` points at the `User` who posted it. |
| `User` | A person with a login | Global, not per community. |
| `Session` | One signed-in browser | Deleting the row signs that browser out. |
| `Membership` | A user belonging to a community | What authorisation checks. Primary key is the pair. |
| `JoinRequest` | Someone asking to join through the join link | Approving it creates the `Membership`. Unique per user and community. |

## Design decisions

**Every id is a cuid.** `Notice.id` used to be an autoincrement integer. A
counter shared by every tenant makes notice URLs guessable and lets one
community read the platform's total volume off its own ids. The migration gave
existing notices fresh random ids rather than keeping `"13"`, `"14"`.

**No stored member count.** `Community.memberCount` used to be a typed-in
number. A stored count drifts the moment someone joins or leaves without it
being updated, so it is now `_count: { memberships: true }`.

**`Session.id` is a hash, not the token.** The cookie holds a random token; the
table holds its SHA-256. Someone who reads the database cannot turn that back
into a working cookie. See [Authentication](authentication.md).

**`Membership` has a composite primary key `(userId, communityId)`.** Nobody can
be a member of the same community twice, and the key's index (starting with
`userId`) serves "my communities". A second index on `communityId` serves
"members of this community".

**`Community.joinCode` is stored as is, not hashed.** It is the secret in the
join link and QR code, but knowing it only lets someone *ask* to join - an
admin approves every request. Admins need to see it again to reprint the QR
code, which a hash would make impossible. Rotating it kills old links. Postgres
generates it (`gen_random_uuid()`, 122 random bits), which is also how the
migration gave existing communities one each.

**One `JoinRequest` per user and community.** Asking again after a rejection
reuses the row, so the admin's list never fills with duplicates. Approved and
rejected rows stay as the record of who joined how.

**Cascades.** Deleting a community deletes its notices, info rows,
memberships and join requests. Deleting a user deletes their sessions,
memberships, join requests and notices.
Keeping a deleted user's notices under "deleted user" would need an optional
relation; that is a product decision for when account deletion exists.

**Indexes follow the queries.** Every notice read filters by community and sorts
by date, so the index is `(communityId, createdAt)`, not `createdAt` alone.
`Notice.authorId` and `Session.userId` are indexed because Postgres does not
index foreign key columns on its own, and cascading deletes need to find those
rows.

## Migrations

Migrations live in `prisma/migrations/` and are committed. Several were written
by hand, because Prisma's generated SQL would have lost or mangled data:

| Migration | Why by hand |
| --- | --- |
| `rename_building_to_community` | Prisma would have dropped and recreated the tables. Written as renames. |
| `notice_cuid` | Prisma would have cast ids to text (`"13"`), keeping them guessable. Gives each row a new random id. |
| `notice_author_user` | Prisma would have added a required column that fails on existing rows and dropped the author names. Backfills `authorId` by matching names to members of the same community, and fails rather than guess when one does not match. |
| `join_request_note` | Prisma would have dropped `apartment` and added `note`, losing every request's text. Written as a rename. |

The rule of thumb: generate the SQL, then **read it** before applying it. If it
drops a column or table that holds data you want, write the migration yourself.
How to do that is in [Development](development.md#changing-the-schema).
