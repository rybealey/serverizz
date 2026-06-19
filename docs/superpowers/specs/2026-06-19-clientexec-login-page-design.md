# SERVERIZZ Login Page via ClientExec — Design

**Date:** 2026-06-19
**Status:** Approved (pending spec review)

## Goal

Implement the new **login page** added to the SERVERIZZ Website design in Claude Design
(`SERVERIZZ Website.dc.html`, the `LOGIN` section). It is a full-bleed, two-panel sign-in
screen that authenticates against our billing system (ClientExec), styled entirely in the
SERVERIZZ `szz-*` design system. Authentication follows ClientExec's documented external
login-form integration.

Reference: [ClientExec — Adding a login form to your external website](https://docs.clientexec.com/en/article/adding-a-clientexec-login-form-to-your-external-website-6jgnxp/)

## Decisions (locked)

- **Page chrome:** Login is full-bleed — **no** site nav or footer. We do a **route-group
  refactor**: existing pages move under `app/(site)/` with a layout that holds the chrome;
  login lives at `app/login/` outside that group, so it inherits only the root shell.
- **Auth flow:** **Pre-validate proxy, then native hand-off.** The form first POSTs to our
  own `/api/login`, which forwards the credentials to ClientExec to check them. On failure
  we show an inline error in our own UI (no navigation). On success, the client submits a
  **hidden native form** directly to ClientExec so the browser receives ClientExec's
  session cookie (scoped to `account.serverizz.com`) and lands on the dashboard.
  - **Why not a pure proxy:** ClientExec's session cookie is set on its own domain. A
    server-side proxy receives that `Set-Cookie` but cannot relay it to the browser for a
    domain it doesn't control, so the user would never get a real session. The browser must
    ultimately post to ClientExec itself — hence the hand-off.
  - **Accepted trade-off:** the password is sent twice (once to our `/api/login`, once to
    ClientExec). It is **never logged** server-side and is held in client state only as long
    as needed for the hand-off.
- **"Create an account":** links to the **ClientExec order/signup** flow on
  `account.serverizz.com`.
- **"Forgot password?":** links to **ClientExec's password-reset** page on
  `account.serverizz.com` (exact path to confirm against the live instance).
- **Indexing:** `/login` is **`noindex`** and is **not** added to `sitemap.ts`.

## ClientExec integration (from the docs)

- **Endpoint:** `${CLIENTEXEC_URL}/index.php?fuse=admin&action=Login`
- **Method:** `POST`
- **Fields:** `email`, `passed_password`, `btnSubmit`
- `CLIENTEXEC_URL` already exists (`.env.example`, default `https://account.serverizz.com`)
  and is non-secret. It is read **server-side**; only the resulting public CE URLs are passed
  to the client component as props.

## Architecture

### Routing (route-group refactor)

```
app/
  layout.tsx          → trimmed to the root shell: <html>/<body>, fonts, OrganizationJsonLd /
                        WebSite JSON-LD, AffiliateTracker, {children}. No nav/footer.
  globals.css, sitemap.ts, robots.ts, opengraph-image.tsx, twitter-image.tsx,
    icon.svg, favicon.ico, apple-icon.png   → stay at app root (metadata routes, not pages)
  api/
    domain-search/…   → unchanged
    login/route.ts    → NEW proxy endpoint
  (site)/
    layout.tsx        → NEW: the chrome —
                        <div style=minHeight:100vh;bg><SiteNav/><main>{children}</main><SiteFooter/></div>
    page.tsx, hosting/, domains/, why/, wordpress/, support/   → MOVED here (URLs unchanged)
  login/
    page.tsx          → NEW: full-bleed two-panel layout, outside (site) → no chrome
```

There remains exactly **one** top-level root layout (`app/layout.tsx`), so there is no
duplicate `<html>` and the "multiple root layouts → full page reload" caveat does not apply.
Route groups do not change URLs, so `/`, `/hosting`, `/domains`, `/why`, `/wordpress`,
`/support` are all unchanged.

### Components / units

- **`app/login/page.tsx`** (server component)
  - What it does: reads `CLIENTEXEC_URL` server-side, derives the three public CE URLs
    (login action, forgot-password, signup/order), renders the two-panel layout, passes the
    URLs to the client form.
  - Exports `metadata` with `robots: { index: false, follow: false }`, title "Sign in".
  - Left **brand aside** (`szz-login-aside`): `TerminalLogo` linking to `/`, `SectionEyebrow`
    "Welcome_back", headline "Your sites, email & billing — one login.", supporting copy, the
    three feature rows (lucide `Gauge`, `DatabaseBackup`, `ShieldCheck`), and the
    "© 2026 Rizz Enterprises, LLC" line. Styling matches the design exactly.
  - Right panel hosts `<LoginForm … />`.

- **`components/szz/login-form.tsx`** (`"use client"`)
  - What it does: renders the "Sign in" heading + subcopy, controlled email/password fields
    (DS `Input`), the Password label row with the "Forgot password?" link, the primary
    "Sign in" `Button`, and the "New to SERVERIZZ? Create an account" line.
  - State: `status` (`idle | verifying | error`) and `error` message. Shows the
    "Verifying credentials…" banner from the design while `verifying`, and inline error text
    on failure.
  - On submit: `POST /api/login {email,password}`. On `{ok:false}` → show error, stay put.
    On `{ok:true}` → populate a **hidden native `<form method="post" action={ceLoginUrl}>`**
    (fields `email`, `passed_password`, `btnSubmit`) and call `form.submit()` to hand off.
  - Props: `ceLoginUrl`, `ceForgotUrl`, `ceSignupUrl`.
  - Depends on: `@/components/ui/input`, `@/components/ui/button`.

- **`app/api/login/route.ts`** (`POST`)
  - What it does: validates the JSON body (`email`, `password` strings), calls
    `verifyCredentials` from `lib/clientexec`, returns `{ ok: true }` or
    `{ ok: false, error }`. Mirrors `app/api/domain-search/route.ts` conventions:
    400 on malformed body, 502 when ClientExec is unreachable.
  - **Never logs the password.**

- **`lib/clientexec.ts`** (additions, server-only)
  - `buildLoginUrl()` → `${CE_URL}/index.php?fuse=admin&action=Login`
  - `buildForgotPasswordUrl()` → CE password-reset URL (path to confirm)
  - `buildSignupUrl()` → CE order/signup URL (path to confirm)
  - `verifyCredentials({email,password})` → POSTs to the login endpoint with
    `redirect: "manual"`, inspects status/`Location` to decide success vs failure (see Risk),
    returns a boolean (or `{ ok }`). Wrapped so callers can distinguish "invalid credentials"
    from "CE unreachable".

- **`components/szz/site-nav.tsx`** (edit)
  - Repoint the "Log In" link from `/support` → `/login`.

- **`app/globals.css`** (additions) — port the design's login rules:
  - `.szz-login-aside { --szz-text-light/-muted/-faint/-accent-blue overrides; }` and
    `.szz-login-aside .szz-logo__word { color:#fff; }` (the aside is always dark, regardless
    of theme).
  - `@media (max-width: 640px) { .szz-login-aside { display:none !important; } }` — the brand
    aside hides on mobile and the form panel goes full-width.

### Data flow

```
submit → status="verifying" → POST /api/login {email,password}
   ├─ route → verifyCredentials → POST CE (fuse=admin&action=Login, redirect:"manual")
   ├─ {ok:false}        → status="error", show inline error, NO navigation
   ├─ {ok:true}         → fill hidden native form + form.submit()
   │                       → browser POSTs directly to CE → CE sets session cookie → dashboard
   └─ network/502 error → status="error", generic "try again" message
```

## Error handling

- Empty/invalid email or password → client-side guard before any request.
- Invalid credentials (`{ok:false}`) → inline error, fields preserved, no navigation.
- ClientExec unreachable → `/api/login` returns 502; form shows a generic retry message.
- Malformed request body → `/api/login` returns 400.
- Password is never written to logs in the route or the lib.

## The one real risk — CE success detection

The CE docs provide only the form markup, not the failure response shape. Plan:
`verifyCredentials` POSTs with `redirect: "manual"` and treats **a redirect to the client
dashboard as success**, and **a 200 (login form re-rendered) or a redirect back to the login
page as failure**. This heuristic is isolated in one small, commented helper so it is trivial
to adjust after testing against the live `account.serverizz.com`.

**Verify-against-live-instance items:** the success/failure heuristic, the exact
forgot-password URL, and the exact signup/order URL.

## Testing

- Unit tests (vitest, mirroring `clientexec.test.ts` / `route.test.ts`):
  - the CE success/failure detection helper (redirect-to-dashboard → ok; 200/login redirect → not ok);
  - `/api/login`: valid → `{ok:true}`; invalid → `{ok:false}`; malformed body → 400;
    CE unreachable → 502.
- Build/typecheck (`next build`) to confirm the route-group move keeps every existing URL working.
- Manual verification against the live CE instance for the three verify-against-live items above.

## Out of scope (YAGNI)

- "Remember me", 2FA UI, social login — none are in the design.
- Any change to ClientExec itself or its theming.
- Migrating other auth surfaces; this is the single external login form only.
