# SEO Retrofit + Reusable System — Design

**Date:** 2026-06-22
**Status:** Approved (design); pending implementation plan.

## Goal

Bring the 7 existing public pages into line with the agreed keyword strategy, and
build a reusable per-page SEO system so every future page is optimized by
construction. Document the new-landing-page fleet as a roadmap (not built here).

## Decisions (locked)

- **Geography:** Austin, TX is the business HQ → drives *local* SEO. Miami is the
  datacenter → drives a *latency / Latin-America gateway* performance angle. The
  two signals are kept separate so they don't muddy each other. (The pasted SEO
  plan's Miami-only "Geographic" cluster was reconciled this way.)
- **Scope:** Retrofit existing pages + reusable system + roadmap. New landing
  pages are NOT built in this effort.
- **Copy approach:** Surgical. Brand voice is preserved. Optimize titles,
  descriptions, H1s, and add at most one keyword-bearing supporting element per
  commercial page where it reads naturally. No paragraph rewrites.
- **Meta `keywords` tag:** NOT used. Search engines ignore it. Keyword intent is
  captured in titles/H1/visible copy and documented in the page registry.
- **No fabricated structured data:** no phone/social `sameAs`, no reviews/ratings,
  no FAQ schema (FAQ copy + plan prices remain placeholders). Consistent with the
  site's existing deliberate omissions.

## Keyword → page map

Each page gets ONE primary keyword + a small Tier-1 supporting cluster. Nothing
chases a head term.

| Page | Primary keyword | Supporting cluster | JSON-LD |
|---|---|---|---|
| `/` | brand + "managed cPanel hosting" | trust/value; light Austin mention | (Organization/WebSite sitewide) |
| `/hosting` | secure cPanel hosting on CloudLinux + Imunify360 | PHP Selector / multiple PHP versions, CageFS, Node.js & Python apps, low-density | Service |
| `/hosting/reseller` | cPanel reseller hosting (managed, white-label) | reseller plan, dedicated resources, reseller alternative | Service |
| `/hosting/wordpress` | managed WordPress hosting | on the CloudLinux/Imunify360 stack (kept modest) | Service |
| `/why` | developer-friendly, low-density shared hosting | fewer accounts per server, managed, annual billing | — |
| `/domains` | (not a plan target) | metadata polish only | — |
| `/support` | (not a plan target) | metadata polish only | — |
| `/about` | brand/trust + Austin local signal | founder story already present | (LocalBusiness anchor) |

The strongest *uncaptured* Tier-1 clusters — Passenger app hosting (Rails/Node/
Python), the geo pages (Austin / Miami), and Tier-3 comparison pages — are the
new-page roadmap (§5). `/hosting` captures Node/Python interim because it already
lists them.

## 1. Reusable SEO system

Refactor `lib/seo.ts` into a single source-of-truth **page registry**. Today
`ROUTES` holds path/name/sitemap data while metadata lives in each `page.tsx`.
Merge them so each route declares everything in one object:

```ts
PAGE_SEO = {
  "/hosting": {
    name, title, description,
    targetKeyword, cluster: string[],   // documentation that drives copy + titles
    jsonLd: "Service",                  // which schema to emit (or none)
    changeFrequency, priority,
  },
  ...
}
```

- `pageMetadata()`, `app/sitemap.ts`, and `breadcrumbTrail()` all derive from this
  one object. Existing `pageMetadata({title, description, path})` call sites keep
  working; the registry becomes the canonical source those values come from.
- New helpers: `serviceJsonLd(path)` and `localBusinessJsonLd()`.
- **Outcome:** a new page = add one registry entry + render the helper. It cannot
  ship un-optimized. `targetKeyword` / `cluster` are documentation, not meta tags.

**Boundaries / interfaces.** `lib/seo.ts` stays the only place site facts live.
The registry is a plain typed object (no runtime deps). JSON-LD helpers return
the props object consumed by `next-seo`'s components; pages stay declarative.

## 2. Per-page changes (surgical)

- **Metadata (all pages):** rewrite title + description to lead with the target
  keyword. Examples:
  - `/hosting` title → "Secure cPanel Hosting on CloudLinux + Imunify360"
  - `/hosting/reseller` title → "cPanel Reseller Hosting — Managed & White-Label"
  - `/why` title → keep "Why SERVERIZZ" but description leads with low-density /
    developer-friendly framing.
- **Home page:** add explicit `metadata` (currently inherits the root default).
  Keep the brand-led default title; enrich the description with "managed cPanel
  hosting" + a light Austin mention.
- **One keyword-bearing element per commercial page**, in the existing voice:
  - `/hosting`: tune H1 + intro sentence; add a short supporting line
    "Built on CloudLinux + Imunify360, served from our Miami datacenter."
    (The "what's included" list already names CloudLinux 10 / PHP Selector /
    Imunify360 — no list rewrite needed.)
  - `/hosting/reseller`: H1/intro aligned to "managed cPanel reseller hosting";
    one line positioning vs. big-host reseller plans (no named competitor on-page
    yet — that lives on the Tier-3 comparison pages in §5).
  - `/hosting/wordpress`: note it runs on the same hardened stack; kept modest.
- **H1s** aligned to the keyword only where they currently omit it. No paragraph
  rewrites anywhere.

## 3. Local + datacenter signals

- **`LocalBusiness` JSON-LD** sitewide in `app/layout.tsx`, built from the real
  Austin NAP in `ORG`. `areaServed` = Austin / Texas + "United States & Latin
  America." No fabricated phone/social.
- **`Service` JSON-LD** on `/hosting`, `/hosting/reseller`, `/hosting/wordpress`
  (provider = the org, `areaServed`, `serviceType`).
- **Miami datacenter** appears as a latency / LatAm-gateway line on `/hosting` and
  `/why` — framed as a performance claim, kept separate from the Austin *local*
  signal.
- **Off-site (manual, not code):** a Google Business Profile + NAP consistency is
  the dominant local-SEO lever and must be done by the owner. Noted here so it's
  not forgotten.

## 4. Verification

- `next build` + TypeScript typecheck clean.
- Spot-check rendered `<head>` (title, description, canonical, OG/Twitter) and the
  JSON-LD blocks on each route.
- Confirm `app/sitemap.ts` still emits every route after the registry refactor.
- Existing tests still pass.

## 5. New-page roadmap (documented, NOT built here)

Each is a ready-to-build card: target keyword, intent, outline. Building them later
is mechanical (registry entry + page).

- `/hosting/rails` — "Ruby on Rails shared hosting cPanel" (Passenger).
- `/hosting/nodejs` — "Node.js shared hosting Passenger".
- `/hosting/python` — "Python / Django app hosting cPanel" (Passenger).
- `/hosting/austin` — "Austin cPanel hosting" / "Texas web hosting" (local).
- `/hosting/miami` — "Miami cPanel hosting" / low-latency LatAm (datacenter).
- `/compare/[host]-reseller-alternative` — Tier-3, one page per competitor
  (InMotion / A2 / HostGator reseller alternative).

## Out of scope (YAGNI)

Meta keywords tag; fabricated reviews/ratings; FAQ schema; and building the §5
pages.
