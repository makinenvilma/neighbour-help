# Pages and routes

Everything except the sign-in pages requires a signed-in user, and everything
under `/community/[slug]` also requires membership of that community. A
signed-out visitor is redirected to `/login`; a signed-in non-member gets a 404.

| URL | Shows | Requires | File |
| --- | --- | --- | --- |
| `/login` | Sign-in form | Signed out (signed-in users are sent to `/`) | `src/app/(auth)/login/page.tsx` |
| `/signup` | Sign-up form | Signed out | `src/app/(auth)/signup/page.tsx` |
| `/` | Your communities with member counts | Signed in | `src/app/page.tsx` |
| `/community/[slug]` | Community home: stats, latest 3 notices, up to 5 help requests, "Good to know" | Member | `src/app/community/[slug]/page.tsx` |
| `/community/[slug]/feed` | Every notice, newest first | Member | `src/app/community/[slug]/feed/page.tsx` |
| `/community/[slug]/new` | Form for a new notice, with a live preview | Member | `src/app/community/[slug]/new/page.tsx` |
| `/community/[slug]/notice/[id]` | One notice in full | Member, and the notice must belong to that community | `src/app/community/[slug]/notice/[id]/page.tsx` |

## Layouts

| Layout | Wraps | Does |
| --- | --- | --- |
| `src/app/layout.tsx` | Everything | `<html>`, fonts, global CSS |
| `src/app/(auth)/layout.tsx` | `/login`, `/signup` | Centred card, no navigation; redirects signed-in users to `/` |
| `src/app/community/[slug]/layout.tsx` | Everything in a community | Renders the `AppShell` with the community's name in the navigation |

`(auth)` is a route group: the parentheses keep it out of the URL, so the pages
are at `/login` and `/signup` while sharing a layout.

The index page `/` renders its own `AppShell`, because the root layout has no
community to give it.

## Not-found pages

| File | Shown when |
| --- | --- |
| `src/app/not-found.tsx` | Any unknown URL |
| `src/app/community/[slug]/not-found.tsx` | The community does not exist **or** you are not a member |
| `src/app/community/[slug]/notice/[id]/not-found.tsx` | The notice does not exist or is in another community |

The community layout deliberately does not call `notFound()` itself. A layout
that throws is skipped together with everything it renders, which would drop
the sidebar off the 404 page. The pages call it instead, and the not-found page
renders inside the layout with the navigation intact.

## Server actions

| Action | File | Called from |
| --- | --- | --- |
| `signUp`, `signIn`, `signOut` | `src/app/(auth)/actions.ts` | The auth forms, and the sign-out button in the navigation |
| `createNotice` | `src/app/community/[slug]/new/actions.ts` | The new notice form |
