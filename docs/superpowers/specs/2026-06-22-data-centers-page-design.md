# Data Centers page — design

**Date:** 2026-06-22
**Source design:** `SERVERIZZ Website.dc.html` (Claude Design project `4012c049…`), the `DATA CENTERS` section.

## Goal

Implement the marketing **Data Centers** page that showcases SERVERIZZ's global
infrastructure footprint (32 data center regions across six continents), wired
into the existing SEO registry and site chrome.

## Decisions (confirmed with user)

- **Route:** `/data-centers` (kebab-case, matches `/ai-employees`).
- **Nav placement:** linked from the footer **COMPANY** column only — matching the
  source design, which does not surface it in the top header nav.
- **Structured data:** Breadcrumb **and** Service JSON-LD. The page registers a
  `jsonLd: "Service"` entry (`serviceType: "Global infrastructure"`).
- **Copy:** carried verbatim from the approved design, including the
  enterprise framing ("enterprise customers can place workloads in any of 32
  regions").

## Architecture

A static server component at `app/(site)/data-centers/page.tsx`, mirroring the
`/ai-employees` and `/hosting` pages. No client interactivity is required.

### Data

Extract the region dataset into `lib/szz-data.ts` (where `aiTeamLines` etc. live)
as a typed export so the page file stays presentational:

```ts
export interface DcCity { city: string; code: string }
export interface DcRegion { region: string; count: string; cities: DcCity[] }
export const dcRegions: DcRegion[] = [ /* 6 regions, 32 cities */ ];
```

Dataset (from the design, verbatim):
- **North America** (11): New York `NJ · US`, Silicon Valley `CA · US`, Seattle `WA · US`,
  Los Angeles `CA · US`, Chicago `IL · US`, Dallas `TX · US`, Atlanta `GA · US`,
  Miami `FL · US`, Honolulu `HI · US`, Toronto `CA`, Mexico City `MX`
- **Europe** (8): London `GB`, Manchester `GB`, Amsterdam `NL`, Frankfurt `DE`,
  Paris `FR`, Madrid `ES`, Stockholm `SE`, Warsaw `PL`
- **Asia & Middle East** (8): Tokyo `JP`, Osaka `JP`, Seoul `KR`, Singapore `SG`,
  Mumbai `IN`, Delhi NCR `IN`, Bangalore `IN`, Tel Aviv `IL`
- **South America** (2): São Paulo `BR`, Santiago `CL`
- **Oceania** (2): Sydney `AU`, Melbourne `AU`
- **Africa** (1): Johannesburg `ZA`

### Sections (faithful to the .dc.html)

1. **Hero** — `SectionEyebrow` "Global infrastructure"; `<h1>` "Deploy in 32 cities.
   Pick yours."; lead paragraph; a row of four `Stat`s (`32` regions, `6`
   continents, `<50ms` to most major metros, `100%` enterprise region choice).
   Section on `--szz-bg-card` with a bottom border.
2. **Footprint note** — a thin bordered callout bar with a lucide `globe` icon and
   the "largest worldwide footprints" line.
3. **Region listing** — `max-width:1100px` 2-column responsive grid of `Card`s,
   one per `dcRegions` entry. Each card: region name + a "{count} REGIONS" mono
   pill in the header row, then a 2-col city list with green dots, city name, and
   a mono location code aligned right.
4. **Network features** — `SectionEyebrow` "Why_it_matters" + `<h2>` "A network
   engineered for low latency", then three `surface="deep"` cards: Localized
   peering (`route`), Low latency near you (`gauge`), Redundant by design
   (`network`, green icon).
5. **Enterprise CTA** — glowing `Card` (`glow`), green `SectionEyebrow`
   "Enterprise", `<h2>` "Need a specific region — or several?", supporting
   paragraph, and a primary `Button` "Talk to enterprise" → `/support`.

Styling follows the `/ai-employees` page conventions: shared `var(--szz-*)`
tokens, `clamp()` responsive font sizes, `szz-section`/`szz-grid-3` utility
classes where they apply, inline icons via `lucide-react`.

## SEO

Add one `PAGE_SEO` entry in `lib/seo.ts` (which auto-feeds `ROUTES`/sitemap):

```ts
{
  path: "/data-centers",
  name: "Data Centers",
  title: "Global Data Center Regions — Low-Latency Hosting",
  description: "Deploy across 32 data center regions on six continents …",
  targetKeyword: "global data center regions",
  cluster: ["low-latency hosting", "edge regions", "global infrastructure hosting"],
  jsonLd: "Service",
  serviceType: "Global infrastructure",
  changeFrequency: "monthly",
  priority: 0.6,
}
```

The page emits:
- `export const metadata = pageMetadataFor("/data-centers")`
- `<BreadcrumbJsonLd items={breadcrumbTrail("Data Centers", "/data-centers")} />`
- `<JsonLdScript … data={serviceJsonLd("/data-centers")} />`

(exactly the `/hosting` pattern).

**Footer:** add `{ label: "Data Centers", href: "/data-centers" }` to the COMPANY
column in `components/szz/site-footer.tsx`.

## Testing & verification

- `lib/seo.test.ts` already iterates every `PAGE_SEO` entry and asserts Service
  entries carry a `serviceType` — the new entry is covered automatically. Add one
  focused assertion that `seoFor("/data-centers")` is a Service with the expected
  `serviceType`, plus that `serviceJsonLd("/data-centers")` builds.
- `npx tsc --noEmit` — type-check the new data export and page.
- `npm run lint` — lint the new files.
- `npm run build` (or `next build`) to confirm the route renders and the sitemap
  picks it up.

## Out of scope

- Top-nav entry (footer-only by decision).
- An interactive/animated world map — the design is a static region grid.
- Any change to the enterprise copy's business claims (carried as-designed).
