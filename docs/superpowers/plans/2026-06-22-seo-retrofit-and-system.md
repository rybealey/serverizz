# SEO Retrofit + Reusable System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the existing public pages into line with the approved keyword strategy and add a single-source-of-truth SEO registry so future pages are optimized by construction, plus Austin-local + Miami-datacenter structured data and copy.

**Architecture:** All page SEO facts move into one `PAGE_SEO` registry in `lib/seo.ts`. `pageMetadataFor(path)`, `app/sitemap.ts`, and JSON-LD helpers (`serviceJsonLd`, `localBusinessJsonLd`) all derive from it. Pages call `pageMetadataFor(path)` and render JSON-LD via next-seo's generic `<JsonLdScript>`. Visible copy changes are surgical — title/eyebrow/one supporting line per commercial page — to preserve brand voice.

**Tech Stack:** Next.js (App Router, native Metadata API), next-seo v7.2.0 (JSON-LD only via `JsonLdScript`/`OrganizationJsonLd`/`BreadcrumbJsonLd`), TypeScript, Vitest (node environment).

## Global Constraints

- **No meta `keywords` tag.** Keyword intent lives in titles/H1/copy and in the registry's `targetKeyword`/`cluster` fields (documentation only). Never emit `<meta name="keywords">`.
- **No fabricated structured data.** No phone, no social `sameAs`, no reviews/ratings, no FAQ schema. Only real facts from `ORG` in `lib/seo.ts`.
- **Geography:** Austin, TX = the business HQ (local signal). Miami = the datacenter (latency / Latin-America angle). Keep the two separate in copy.
- **Ruby/Rails is excluded** — SERVERIZZ does not offer Ruby hosting. Do not add Ruby/Rails keywords or copy.
- **Surgical copy only.** Preserve the existing playful brand voice. Per commercial page: optimize the title, optionally the `SectionEyebrow`, and add at most one keyword-bearing supporting line. No paragraph rewrites.
- **Canonical host:** `https://www.serverizz.com` (from `SITE_URL`). All canonicals are self-referencing per page.
- **Run tests with:** `npx vitest run <file>` (config: `vitest.config.ts`, node env, `@` alias → repo root).

---

### Task 1: SEO page registry + metadata/JSON-LD helpers (the reusable system)

This is the foundation every other task consumes. Pure functions, fully unit-tested.

**Files:**
- Modify: `lib/seo.ts` (replace the `ROUTES` const; add registry + helpers)
- Test: `lib/seo.test.ts` (new)

**Interfaces:**
- Consumes: `ORG`, `SITE_URL`, `SITE_NAME`, `SITE_LOCALE`, `OG_IMAGE_URL`, `LEGAL_DOCS` (already in `lib/seo.ts`); existing `pageMetadata()` and `breadcrumbTrail()` stay as-is.
- Produces (later tasks rely on these exact signatures):
  - `PageSeo` interface and `PAGE_SEO: PageSeo[]`
  - `seoFor(path: string): PageSeo` — throws if path absent
  - `pageMetadataFor(path: string): Metadata`
  - `serviceJsonLd(path: string): Record<string, unknown>` — throws unless that path is a Service page
  - `localBusinessJsonLd(): Record<string, unknown>`
  - `ROUTES` (now derived from `PAGE_SEO` + `LEGAL_DOCS`; same shape as before, consumed by `app/sitemap.ts`)
  - `AREA_SERVED: readonly string[]`

- [ ] **Step 1: Write the failing tests**

Create `lib/seo.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  PAGE_SEO,
  ROUTES,
  seoFor,
  pageMetadataFor,
  serviceJsonLd,
  localBusinessJsonLd,
  AREA_SERVED,
} from "@/lib/seo";

describe("PAGE_SEO registry", () => {
  it("every entry has the required non-empty fields", () => {
    for (const p of PAGE_SEO) {
      expect(p.path).toMatch(/^\//);
      expect(p.name.length).toBeGreaterThan(0);
      expect(p.title.length).toBeGreaterThan(0);
      expect(p.description.length).toBeGreaterThan(0);
      expect(p.targetKeyword.length).toBeGreaterThan(0);
      expect(Array.isArray(p.cluster)).toBe(true);
      if (p.jsonLd === "Service") {
        expect(p.serviceType && p.serviceType.length).toBeTruthy();
      }
    }
  });

  it("commercial titles carry their target keyword signal", () => {
    expect(seoFor("/hosting").title).toMatch(/CloudLinux/i);
    expect(seoFor("/hosting").title).toMatch(/Imunify360/i);
    expect(seoFor("/hosting/reseller").title).toMatch(/Reseller/i);
    expect(seoFor("/hosting/wordpress").title).toMatch(/WordPress/i);
  });

  it("home description mentions managed cPanel hosting and Austin", () => {
    expect(seoFor("/").description).toMatch(/cPanel/i);
    expect(seoFor("/").description).toMatch(/Austin/i);
  });
});

describe("seoFor", () => {
  it("returns the entry for a known path", () => {
    expect(seoFor("/why").path).toBe("/why");
  });
  it("throws for an unknown path", () => {
    expect(() => seoFor("/nope")).toThrow();
  });
});

describe("ROUTES", () => {
  it("includes every PAGE_SEO path plus the legal docs", () => {
    const paths = ROUTES.map((r) => r.path);
    for (const p of PAGE_SEO) expect(paths).toContain(p.path);
    expect(paths).toContain("/about"); // regression: /about was missing from the old sitemap
    expect(paths.some((p) => p.startsWith("/legal/"))).toBe(true);
  });
});

describe("pageMetadataFor", () => {
  it("sets a self-referencing canonical and the registry title", () => {
    const meta = pageMetadataFor("/hosting");
    expect(meta.alternates?.canonical).toBe("/hosting");
    expect(meta.title).toBe("Secure cPanel Hosting on CloudLinux + Imunify360");
  });
  it("omits the title on the home page so the root default applies", () => {
    const meta = pageMetadataFor("/");
    expect(meta.title).toBeUndefined();
    expect(meta.description).toMatch(/cPanel/i);
  });
});

describe("serviceJsonLd", () => {
  it("builds a Service node for a hosting product page", () => {
    const data = serviceJsonLd("/hosting");
    expect(data["@type"]).toBe("Service");
    expect(data.serviceType).toBe("Web hosting");
    expect((data.provider as Record<string, unknown>).name).toBeDefined();
    expect(data.areaServed).toEqual(expect.arrayContaining(["Latin America"]));
  });
  it("throws for a non-Service page", () => {
    expect(() => serviceJsonLd("/why")).toThrow();
  });
});

describe("localBusinessJsonLd", () => {
  it("uses the real Austin NAP and serves Austin", () => {
    const data = localBusinessJsonLd();
    expect(data["@type"]).toBe("LocalBusiness");
    expect((data.address as Record<string, unknown>).addressLocality).toBe("Austin");
    expect(data.areaServed).toEqual(expect.arrayContaining(["Austin"]));
  });
});

describe("AREA_SERVED", () => {
  it("covers Austin, Texas, US and Latin America", () => {
    expect([...AREA_SERVED]).toEqual(
      expect.arrayContaining(["Austin", "Texas", "United States", "Latin America"]),
    );
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run lib/seo.test.ts`
Expected: FAIL — imports `PAGE_SEO`, `seoFor`, `pageMetadataFor`, `serviceJsonLd`, `localBusinessJsonLd`, `AREA_SERVED` are not exported yet.

- [ ] **Step 3: Add the registry, derived `ROUTES`, and helpers to `lib/seo.ts`**

In `lib/seo.ts`, **delete the existing `ROUTES` const** (the block starting `/** Every indexable route... */ export const ROUTES: {...}[] = [ ... ];`) and add this in its place (keep the `MetadataRoute` typing style the file already uses):

```ts
/** Geographic areas served — reused by Service and LocalBusiness JSON-LD. */
export const AREA_SERVED = ["Austin", "Texas", "United States", "Latin America"] as const;

export type JsonLdKind = "Service" | null;

export interface PageSeo {
  path: string;
  /** Breadcrumb + sitemap name. */
  name: string;
  /** <title> text. Templated with "· SERVERIZZ" unless inheritTitle is set. */
  title: string;
  /** Home only: omit the page title so the root layout's default brand title stands. */
  inheritTitle?: boolean;
  description: string;
  /** Documentation that drives copy/titles — NOT emitted as a meta tag. */
  targetKeyword: string;
  /** Supporting keywords — documentation only. */
  cluster: string[];
  jsonLd: JsonLdKind;
  /** Required when jsonLd === "Service". */
  serviceType?: string;
  changeFrequency: NonNullable<
    import("next").MetadataRoute.Sitemap[number]["changeFrequency"]
  >;
  priority: number;
}

/**
 * Single source of truth for per-page SEO. Adding a page = add an entry here and
 * call `pageMetadataFor(path)` (plus `serviceJsonLd(path)` for product pages).
 * Order is the sitemap order.
 */
export const PAGE_SEO: PageSeo[] = [
  {
    path: "/",
    name: "Home",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    inheritTitle: true,
    description:
      "Managed cPanel hosting from a real human. Claim your domain, then launch a fast, secure website — email, SSL and daily backups included. Austin-based, free migration on every plan.",
    targetKeyword: "managed cPanel hosting",
    cluster: ["small business hosting", "managed hosting Austin"],
    jsonLd: null,
    changeFrequency: "weekly",
    priority: 1,
  },
  {
    path: "/hosting",
    name: "Hosting plans",
    title: "Secure cPanel Hosting on CloudLinux + Imunify360",
    description:
      "Fully-managed cPanel hosting hardened with CloudLinux and Imunify360 — PHP Selector, CageFS isolation, Node.js and Python apps, daily backups and a dedicated account manager. Free migration.",
    targetKeyword: "secure cPanel hosting",
    cluster: [
      "CloudLinux shared hosting",
      "Imunify360 hosting",
      "PHP Selector hosting",
      "Node.js Python cPanel hosting",
      "low-density shared hosting",
    ],
    jsonLd: "Service",
    serviceType: "Web hosting",
    changeFrequency: "monthly",
    priority: 0.9,
  },
  {
    path: "/hosting/wordpress",
    name: "Managed WordPress hosting",
    title: "Managed WordPress Hosting on CloudLinux",
    description:
      "Managed WordPress hosting on a hardened CloudLinux and Imunify360 stack — automatic core and plugin updates, malware scanning, caching and daily backups, all handled for you.",
    targetKeyword: "managed WordPress hosting",
    cluster: ["WordPress hosting CloudLinux", "secure WordPress hosting"],
    jsonLd: "Service",
    serviceType: "WordPress hosting",
    changeFrequency: "monthly",
    priority: 0.9,
  },
  {
    path: "/hosting/reseller",
    name: "Reseller hosting",
    title: "cPanel Reseller Hosting — Managed & White-Label",
    description:
      "Managed, white-label cPanel reseller hosting on dedicated single-node resources. Spin up WHM accounts for your clients with free migration and $0 setup — they never see SERVERIZZ.",
    targetKeyword: "cPanel reseller hosting",
    cluster: ["managed reseller hosting", "white-label cPanel hosting", "reseller VPS cPanel"],
    jsonLd: "Service",
    serviceType: "Reseller web hosting",
    changeFrequency: "monthly",
    priority: 0.85,
  },
  {
    path: "/domains",
    name: "Domains",
    title: "Domains",
    description:
      "Search 400+ extensions, register in seconds and point it at your SERVERIZZ site automatically. Free WHOIS privacy on every domain.",
    targetKeyword: "domain registration",
    cluster: [],
    jsonLd: null,
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/why",
    name: "Why SERVERIZZ",
    title: "Why SERVERIZZ",
    description:
      "Developer-friendly, low-density shared hosting: fewer accounts per server, free migration, daily backups, 99.9% uptime and a dedicated account manager on every plan.",
    targetKeyword: "low-density shared hosting",
    cluster: ["developer-friendly shared hosting", "managed shared hosting"],
    jsonLd: null,
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/about",
    name: "About SERVERIZZ",
    title: "About SERVERIZZ",
    description:
      "SERVERIZZ is Austin-based managed hosting, run by one person since 2014 — fast, well-managed hosting and a real human who picks up. Meet the founder and the story behind it.",
    targetKeyword: "about SERVERIZZ",
    cluster: ["Austin web hosting"],
    jsonLd: null,
    changeFrequency: "monthly",
    priority: 0.65,
  },
  {
    path: "/support",
    name: "Support",
    title: "Support",
    description:
      "How can we help? A real account manager on every plan, 24/7 email tickets and a live status page.",
    targetKeyword: "hosting support",
    cluster: [],
    jsonLd: null,
    changeFrequency: "monthly",
    priority: 0.6,
  },
];

const PAGE_SEO_BY_PATH: Record<string, PageSeo> = Object.fromEntries(
  PAGE_SEO.map((p) => [p.path, p]),
);

/** Look up a page's SEO entry. Throws if the path isn't registered. */
export function seoFor(path: string): PageSeo {
  const seo = PAGE_SEO_BY_PATH[path];
  if (!seo) throw new Error(`No PAGE_SEO entry for "${path}"`);
  return seo;
}

/** Every indexable route, used by the sitemap and (for names) breadcrumbs. */
export const ROUTES: {
  path: string;
  name: string;
  changeFrequency: NonNullable<
    import("next").MetadataRoute.Sitemap[number]["changeFrequency"]
  >;
  priority: number;
}[] = [
  ...PAGE_SEO.map(({ path, name, changeFrequency, priority }) => ({
    path,
    name,
    changeFrequency,
    priority,
  })),
  ...LEGAL_DOCS.map((doc) => ({
    path: `/legal/${doc.slug}`,
    name: doc.title,
    changeFrequency: "yearly" as const,
    priority: 0.3,
  })),
];
```

- [ ] **Step 4: Add `pageMetadataFor` and the JSON-LD helpers**

Append to the end of `lib/seo.ts` (after `breadcrumbTrail`):

```ts
/** Build page Metadata from the registry. Home inherits the root default title. */
export function pageMetadataFor(path: string): Metadata {
  const seo = seoFor(path);
  const meta = pageMetadata({ title: seo.title, description: seo.description, path });
  if (seo.inheritTitle) {
    delete meta.title;
    if (meta.openGraph) delete (meta.openGraph as Record<string, unknown>).title;
    if (meta.twitter) delete (meta.twitter as Record<string, unknown>).title;
  }
  return meta;
}

/** Service JSON-LD for a hosting product page (rendered via <JsonLdScript>). */
export function serviceJsonLd(path: string): Record<string, unknown> {
  const seo = seoFor(path);
  if (seo.jsonLd !== "Service" || !seo.serviceType) {
    throw new Error(`serviceJsonLd("${path}") — not a Service page`);
  }
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: seo.title,
    serviceType: seo.serviceType,
    description: seo.description,
    url: `${SITE_URL}${path}`,
    provider: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    areaServed: [...AREA_SERVED],
  };
}

/** LocalBusiness JSON-LD for the Austin HQ (rendered once, sitewide). */
export function localBusinessJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: SITE_NAME,
    legalName: ORG.legalName,
    url: SITE_URL,
    email: ORG.email,
    image: OG_IMAGE_URL,
    address: { "@type": "PostalAddress", ...ORG.address },
    areaServed: [...AREA_SERVED],
  };
}
```

Note: `SITE_TAGLINE` is already exported from this file (used by the home title). Confirm the `import type { Metadata } from "next";` line at the top is present (it is).

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run lib/seo.test.ts`
Expected: PASS (all describe blocks green).

- [ ] **Step 6: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0, no errors.

- [ ] **Step 7: Commit**

```bash
git add lib/seo.ts lib/seo.test.ts
git commit -m "feat(seo): single-source page registry + metadata/JSON-LD helpers"
```

---

### Task 2: Sitewide LocalBusiness JSON-LD (Austin local signal)

**Files:**
- Modify: `app/layout.tsx` (add import + one `<JsonLdScript>` after the WebSite node)

**Interfaces:**
- Consumes: `localBusinessJsonLd()` from Task 1. `JsonLdScript` is already imported in `app/layout.tsx`.

- [ ] **Step 1: Import the helper**

In `app/layout.tsx`, add `localBusinessJsonLd` to the existing `@/lib/seo` import block (which currently imports `ORG, SITE_DESCRIPTION, SITE_LOCALE, SITE_NAME, SITE_TAGLINE, SITE_URL`):

```ts
import {
  ORG,
  SITE_DESCRIPTION,
  SITE_LOCALE,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
  localBusinessJsonLd,
} from "@/lib/seo";
```

- [ ] **Step 2: Render the LocalBusiness node**

In `app/layout.tsx`, immediately after the closing `/>` of the WebSite `<JsonLdScript id="website-jsonld" ... />` block and before `{children}`, insert:

```tsx
        <JsonLdScript
          id="localbusiness-jsonld"
          scriptKey="localbusiness-jsonld"
          data={localBusinessJsonLd()}
        />
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 4: Build and confirm the JSON-LD renders**

Run: `npm run build`
Expected: build succeeds. (Spot-check in Task 8 confirms the script tag is present in the rendered HTML.)

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx
git commit -m "feat(seo): sitewide LocalBusiness JSON-LD for Austin HQ"
```

---

### Task 3: `/hosting` — title, eyebrow, Miami line, Service JSON-LD

**Files:**
- Modify: `app/(site)/hosting/page.tsx`

**Interfaces:**
- Consumes: `pageMetadataFor`, `serviceJsonLd`, `breadcrumbTrail` from `@/lib/seo`; `JsonLdScript`, `BreadcrumbJsonLd` from `next-seo`.

- [ ] **Step 1: Switch imports to the registry helpers**

Change the seo import line from:

```ts
import { breadcrumbTrail, pageMetadata } from "@/lib/seo";
```
to:
```ts
import { breadcrumbTrail, pageMetadataFor, serviceJsonLd } from "@/lib/seo";
```

And change the next-seo import from:
```ts
import { BreadcrumbJsonLd } from "next-seo";
```
to:
```ts
import { BreadcrumbJsonLd, JsonLdScript } from "next-seo";
```

- [ ] **Step 2: Replace the metadata block**

Replace:
```ts
export const metadata: Metadata = pageMetadata({
  title: "Hosting plans",
  description:
    "Two fully-managed hosting plans — Entrepreneur and Engineer. Free migration, SSL, daily backups and a dedicated account manager as standard.",
  path: "/hosting",
});
```
with:
```ts
export const metadata: Metadata = pageMetadataFor("/hosting");
```

- [ ] **Step 3: Add the Service JSON-LD next to the breadcrumb**

Immediately after the line:
```tsx
      <BreadcrumbJsonLd items={breadcrumbTrail("Hosting plans", "/hosting")} />
```
add:
```tsx
      <JsonLdScript
        id="hosting-service-jsonld"
        scriptKey="hosting-service-jsonld"
        data={serviceJsonLd("/hosting")}
      />
```

- [ ] **Step 4: Optimize the eyebrow and add the Miami supporting line**

Change `<SectionEyebrow>Plans</SectionEyebrow>` to:
```tsx
        <SectionEyebrow>Secure cPanel Hosting</SectionEyebrow>
```

Then, immediately after the hero intro paragraph that ends with:
```tsx
          manager included as standard.
        </p>
```
insert this supporting line (before the closing `</section>`):
```tsx
        <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--szz-text-dim)" }}>
          Built on CloudLinux + Imunify360, served from our Miami datacenter for low-latency reach across the US &amp; Latin America.
        </p>
```

- [ ] **Step 5: Typecheck + build**

Run: `npx tsc --noEmit && npm run build`
Expected: exit 0; `/hosting` listed as a prerendered route.

- [ ] **Step 6: Commit**

```bash
git add "app/(site)/hosting/page.tsx"
git commit -m "feat(seo): optimize /hosting (CloudLinux + Imunify360, Service JSON-LD, Miami)"
```

---

### Task 4: `/hosting/reseller` — title, positioning line, Service JSON-LD

**Files:**
- Modify: `app/(site)/hosting/reseller/page.tsx`

**Interfaces:**
- Consumes: `pageMetadataFor`, `serviceJsonLd`, `breadcrumbTrail`; `JsonLdScript`, `BreadcrumbJsonLd`.

- [ ] **Step 1: Switch imports**

Change:
```ts
import { breadcrumbTrail, pageMetadata } from "@/lib/seo";
```
to:
```ts
import { breadcrumbTrail, pageMetadataFor, serviceJsonLd } from "@/lib/seo";
```
And:
```ts
import { BreadcrumbJsonLd } from "next-seo";
```
to:
```ts
import { BreadcrumbJsonLd, JsonLdScript } from "next-seo";
```

- [ ] **Step 2: Replace the metadata block**

Replace:
```ts
export const metadata: Metadata = pageMetadata({
  title: "Reseller hosting",
  description:
    "A boutique, single-node reseller plan for web designers and agencies. Spin up white-label cPanel accounts for your clients in WHM — they never see SERVERIZZ.",
  path: "/hosting/reseller",
});
```
with:
```ts
export const metadata: Metadata = pageMetadataFor("/hosting/reseller");
```

- [ ] **Step 3: Add the Service JSON-LD**

Immediately after:
```tsx
      <BreadcrumbJsonLd items={breadcrumbTrail("Reseller hosting", "/hosting/reseller")} />
```
add:
```tsx
      <JsonLdScript
        id="reseller-service-jsonld"
        scriptKey="reseller-service-jsonld"
        data={serviceJsonLd("/hosting/reseller")}
      />
```

- [ ] **Step 4: Add the positioning line**

Immediately after the hero intro paragraph that ends with:
```tsx
            white-label cPanel accounts for your clients in WHM — they never see SERVERIZZ.
          </p>
```
insert:
```tsx
          <p style={{ margin: 0, maxWidth: 480, fontFamily: mono, fontSize: 13, color: dim }}>
            Managed cPanel reseller hosting on dedicated single-node resources — more headroom per client than crowded budget reseller plans.
          </p>
```
(`mono` and `dim` are already declared as `const` at the top of this file.)

- [ ] **Step 5: Typecheck + build**

Run: `npx tsc --noEmit && npm run build`
Expected: exit 0; `/hosting/reseller` prerendered.

- [ ] **Step 6: Commit**

```bash
git add "app/(site)/hosting/reseller/page.tsx"
git commit -m "feat(seo): optimize /hosting/reseller (managed white-label, Service JSON-LD)"
```

---

### Task 5: `/hosting/wordpress` — title, modest stack line, Service JSON-LD

**Files:**
- Modify: `app/(site)/hosting/wordpress/page.tsx`

**Interfaces:**
- Consumes: `pageMetadataFor`, `serviceJsonLd`, `breadcrumbTrail`; `JsonLdScript`, `BreadcrumbJsonLd`.

- [ ] **Step 1: Switch imports**

Change:
```ts
import { breadcrumbTrail, pageMetadata } from "@/lib/seo";
```
to:
```ts
import { breadcrumbTrail, pageMetadataFor, serviceJsonLd } from "@/lib/seo";
```
And:
```ts
import { BreadcrumbJsonLd } from "next-seo";
```
to:
```ts
import { BreadcrumbJsonLd, JsonLdScript } from "next-seo";
```

- [ ] **Step 2: Replace the metadata block**

Replace:
```ts
export const metadata: Metadata = pageMetadata({
  title: "Managed WordPress hosting",
  description:
    "WordPress that updates, backs up and secures itself. Core and plugin updates, malware scanning, caching and daily backups — all handled for you.",
  path: "/hosting/wordpress",
});
```
with:
```ts
export const metadata: Metadata = pageMetadataFor("/hosting/wordpress");
```

- [ ] **Step 3: Add the Service JSON-LD**

Immediately after:
```tsx
      <BreadcrumbJsonLd items={breadcrumbTrail("Managed WordPress hosting", "/hosting/wordpress")} />
```
add:
```tsx
      <JsonLdScript
        id="wordpress-service-jsonld"
        scriptKey="wordpress-service-jsonld"
        data={serviceJsonLd("/hosting/wordpress")}
      />
```

- [ ] **Step 4: Add the modest stack line**

Immediately after the hero intro paragraph that ends with:
```tsx
            can just write and sell.
          </p>
```
insert:
```tsx
          <p style={{ margin: 0, maxWidth: 480, fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--szz-text-dim)" }}>
            On the same hardened CloudLinux + Imunify360 stack as the rest of SERVERIZZ.
          </p>
```

- [ ] **Step 5: Typecheck + build**

Run: `npx tsc --noEmit && npm run build`
Expected: exit 0; `/hosting/wordpress` prerendered.

- [ ] **Step 6: Commit**

```bash
git add "app/(site)/hosting/wordpress/page.tsx"
git commit -m "feat(seo): optimize /hosting/wordpress (CloudLinux stack, Service JSON-LD)"
```

---

### Task 6: `/why` — registry metadata + low-density / Miami line

**Files:**
- Modify: `app/(site)/why/page.tsx`

**Interfaces:**
- Consumes: `pageMetadataFor`, `breadcrumbTrail`. No Service JSON-LD (registry `jsonLd: null`).

- [ ] **Step 1: Switch the import**

Change:
```ts
import { breadcrumbTrail, pageMetadata } from "@/lib/seo";
```
to:
```ts
import { breadcrumbTrail, pageMetadataFor } from "@/lib/seo";
```

- [ ] **Step 2: Replace the metadata block**

Replace:
```ts
export const metadata: Metadata = pageMetadata({
  title: "Why SERVERIZZ",
  description:
    "“Managed” should mean we actually manage it. Free migration, daily backups, 99.9% uptime and a dedicated account manager on every plan.",
  path: "/why",
});
```
with:
```ts
export const metadata: Metadata = pageMetadataFor("/why");
```

- [ ] **Step 3: Add the low-density / Miami supporting line**

Immediately after the hero intro paragraph that ends with:
```tsx
          on with running your business.
        </p>
```
insert (before the closing `</section>`):
```tsx
        <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--szz-text-dim)" }}>
          Developer-friendly, low-density hosting — fewer accounts per server, served from our Miami datacenter.
        </p>
```

- [ ] **Step 4: Typecheck + build**

Run: `npx tsc --noEmit && npm run build`
Expected: exit 0; `/why` prerendered.

- [ ] **Step 5: Commit**

```bash
git add "app/(site)/why/page.tsx"
git commit -m "feat(seo): optimize /why (low-density, developer-friendly, Miami)"
```

---

### Task 7: Metadata-only pages — home, domains, support, about

These pages get registry-driven metadata only (no visible copy change). The home page additionally gains an explicit `metadata` export it didn't have.

**Files:**
- Modify: `app/(site)/page.tsx` (home — add metadata export)
- Modify: `app/(site)/domains/page.tsx`
- Modify: `app/(site)/support/page.tsx`
- Modify: `app/(site)/about/page.tsx`

**Interfaces:**
- Consumes: `pageMetadataFor` from `@/lib/seo`.

- [ ] **Step 1: Home — add the metadata export**

`app/(site)/page.tsx` has no `metadata` today. Add the import and export. At the top of the file add a `Metadata` type import and pull `pageMetadataFor` from `@/lib/seo`. Concretely, add these two lines near the other imports:
```ts
import type { Metadata } from "next";
import { pageMetadataFor } from "@/lib/seo";
```
Then, above `export default async function HomePage()`, add:
```ts
export const metadata: Metadata = pageMetadataFor("/");
```
(The home title is intentionally inherited from the root layout — `pageMetadataFor("/")` returns metadata with no `title`, only the enriched description + canonical.)

- [ ] **Step 2: Domains — switch to the registry**

In `app/(site)/domains/page.tsx`, change the import:
```ts
import { breadcrumbTrail, pageMetadata } from "@/lib/seo";
```
to:
```ts
import { breadcrumbTrail, pageMetadataFor } from "@/lib/seo";
```
and replace:
```ts
export const metadata: Metadata = pageMetadata({
  title: "Domains",
  description:
    "Search 400+ extensions, register in seconds and point it at your SERVERIZZ site automatically. Free WHOIS privacy on every domain.",
  path: "/domains",
});
```
with:
```ts
export const metadata: Metadata = pageMetadataFor("/domains");
```

- [ ] **Step 3: Support — switch to the registry**

In `app/(site)/support/page.tsx`, change the import:
```ts
import { breadcrumbTrail, pageMetadata } from "@/lib/seo";
```
to:
```ts
import { breadcrumbTrail, pageMetadataFor } from "@/lib/seo";
```
and replace:
```ts
export const metadata: Metadata = pageMetadata({
  title: "Support",
  description:
    "How can we help? A real account manager on every plan, 24/7 email tickets and a live status page.",
  path: "/support",
});
```
with:
```ts
export const metadata: Metadata = pageMetadataFor("/support");
```

- [ ] **Step 4: About — switch to the registry**

In `app/(site)/about/page.tsx`, change the import:
```ts
import { breadcrumbTrail, pageMetadata } from "@/lib/seo";
```
to:
```ts
import { breadcrumbTrail, pageMetadataFor } from "@/lib/seo";
```
and replace:
```ts
export const metadata: Metadata = pageMetadata({
  title: "About SERVERIZZ",
  description:
    "SERVERIZZ has been a one-person promise since 2014 — fast, well-managed hosting and a real human who picks up. Meet the founder and the story behind it.",
  path: "/about",
});
```
with:
```ts
export const metadata: Metadata = pageMetadataFor("/about");
```

- [ ] **Step 5: Typecheck + build**

Run: `npx tsc --noEmit && npm run build`
Expected: exit 0; `/`, `/domains`, `/support`, `/about` all build.

- [ ] **Step 6: Commit**

```bash
git add "app/(site)/page.tsx" "app/(site)/domains/page.tsx" "app/(site)/support/page.tsx" "app/(site)/about/page.tsx"
git commit -m "feat(seo): registry-driven metadata for home, domains, support, about"
```

---

### Task 8: Full verification + roadmap note

**Files:**
- Modify: none (verification), then `docs/superpowers/specs/2026-06-22-seo-retrofit-and-system-design.md` (tick the roadmap as carried forward — optional)

- [ ] **Step 1: Run the whole test suite**

Run: `npx vitest run`
Expected: all test files pass (including the existing `lib/uptime-kuma.test.ts`, route tests, and the new `lib/seo.test.ts`).

- [ ] **Step 2: Typecheck + production build**

Run: `npx tsc --noEmit && npm run build`
Expected: exit 0; build output lists every route (`/`, `/hosting`, `/hosting/wordpress`, `/hosting/reseller`, `/domains`, `/why`, `/about`, `/support`, `/legal/*`, `/sitemap.xml`, `/robots.txt`).

- [ ] **Step 3: Confirm the sitemap includes /about**

Run: `grep -c "/about" .next/server/app/sitemap.xml.body 2>/dev/null || npx next start >/tmp/szz.log 2>&1 & sleep 4 && curl -s localhost:3000/sitemap.xml | grep -c "/about"; kill %1 2>/dev/null`
Expected: at least `1` (the `/about` route now appears in the sitemap; it was missing before).

- [ ] **Step 4: Spot-check rendered JSON-LD and titles**

Start the built app and check three representative routes:
```bash
npx next start >/tmp/szz.log 2>&1 &
sleep 4
echo "--- hosting title + Service ---"; curl -s localhost:3000/hosting | grep -oE "<title>[^<]*</title>|\"@type\":\"Service\""
echo "--- localbusiness sitewide ---"; curl -s localhost:3000/ | grep -oE "\"@type\":\"LocalBusiness\""
echo "--- no meta keywords anywhere ---"; curl -s localhost:3000/hosting | grep -c "name=\"keywords\""
kill %1 2>/dev/null
```
Expected: `/hosting` `<title>` reads "Secure cPanel Hosting on CloudLinux + Imunify360 · SERVERIZZ"; a `"@type":"Service"` appears; `"@type":"LocalBusiness"` appears on home; the keywords-meta count is `0`.

- [ ] **Step 5: Final commit (if any verification tweaks were made)**

```bash
git add -A
git commit -m "chore(seo): verification pass for SEO retrofit"
```

(If Steps 1–4 are all green with no changes, skip this commit.)

---

## Self-Review notes

- **Spec coverage:** registry/system (Task 1) ✓; LocalBusiness + Austin (Task 2) ✓; per-page surgical copy + titles for /hosting, /reseller, /wordpress, /why (Tasks 3–6) ✓; Service JSON-LD on the three product pages (Tasks 3–5) ✓; metadata-only home/domains/support/about + home explicit metadata (Task 7) ✓; Miami datacenter lines on /hosting and /why ✓; no meta keywords / no fabricated schema (Global Constraints + Task 8 Step 4) ✓; Ruby excluded (Global Constraints) ✓. The §5 new-page roadmap is intentionally **not** built (documented in the spec).
- **Bonus fix:** `/about` was missing from the old `ROUTES`/sitemap; the registry adds it (Task 1 test asserts it).
- **Type consistency:** `pageMetadataFor`, `serviceJsonLd`, `localBusinessJsonLd`, `seoFor`, `PAGE_SEO`, `AREA_SERVED` names are used identically across Tasks 1–8.
- **Off-site (manual, owner):** create/verify the Google Business Profile and keep NAP consistent with `ORG` — the dominant local-SEO lever, not code.
