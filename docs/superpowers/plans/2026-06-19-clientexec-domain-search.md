# ClientExec Live Domain Search — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the home and domains search bars do live availability + price lookups through ClientExec (billing), rendered in SERVERIZZ branding, and make the domains-page pricing grid/pills live from the same source.

**Architecture:** A shared client component (`<DomainSearch />`) posts to a same-origin Next.js route handler (`/api/domain-search`) that fans out `checkdomain` calls to ClientExec server-side and returns normalized results. Server pages call a cached pricing helper so the marketing grid/pills match the real cart price. ClientExec is the single source of truth for availability and price.

**Tech Stack:** Next.js 16.2.9 (App Router), React 19, TypeScript 5, Vitest (added here), the existing `szz-*` design system + `Input`/`Button` components.

## Global Constraints

- **This is a modified Next.js (16.2.9).** Before writing any route handler or async server page, consult `node_modules/next/dist/docs/01-app/`. Route handlers use the standard Web `Request`/`Response` APIs; return data with `Response.json(data, { status })`. (Verified: `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`.)
- **ClientExec endpoint:** `POST {CLIENTEXEC_URL}/index.php?fuse=clients&action=checkdomain`, form-encoded params `name`, `tld`, `group`. Returns `application/json` (HTTP 200 even for in-body errors).
- **Group ID is `2`** (verified — group 7 has no TLDs). Used for the `group` param and `order.php?productGroup=`.
- **Status semantics:** `search_results.status` `0` = available, `1` = taken.
- **Price field:** `search_results.available_options[0].price[]` entry where `period_id === "12"` (1 Year) → `formated_price` (e.g. `"$16.68 USD"`).
- **Config env (server-only, non-secret):** `CLIENTEXEC_URL` (default `https://account.serverizz.com`), `CLIENTEXEC_DOMAIN_GROUP_ID` (default `2`).
- **Branding:** reuse existing `Input` (`components/ui/input.tsx`) and `Button` (`components/ui/button.tsx`) and `--szz-*` CSS variables via inline styles, matching the existing page style (the pages use inline styles heavily). Do not add a CSS framework or restyle existing components.
- **Path alias:** `@/` maps to repo root (see `tsconfig.json`).
- Spec: `docs/superpowers/specs/2026-06-19-clientexec-domain-search-design.md`.

---

## File Structure

- **`vitest.config.ts`** (new) — test runner config with `@/` alias.
- **`lib/domains.ts`** (new) — *pure, isomorphic* logic: `TLDS`, `FEATURED_TLDS`, `SUGGESTED_TLDS`, types (`ParseResult`, `DomainResult`, `TldPrice`), `parseDomain()`, `formatYearlyPrice()`. Safe to import from client or server. No env, no `fetch`.
- **`lib/clientexec.ts`** (new) — *server-side* ClientExec access: config from env, `buildOrderUrl()`, `oneYearPrice()`, `checkDomain()`, `getTldPricing()`. Imports from `lib/domains.ts`.
- **`app/api/domain-search/route.ts`** (new) — POST handler; validates input, fans out `checkDomain`, returns `{ query, results }`.
- **`components/szz/domain-search.tsx`** (new) — `"use client"` shared search UI (idle/loading/results/error).
- **`app/domains/page.tsx`** (modify) — hero search → `<DomainSearch />`; grid + pills → live `getTldPricing`.
- **`app/page.tsx`** (modify) — hero search → `<DomainSearch />`; hero pills → live featured pricing.
- **`.env.example`** (new) — documents the two env vars.
- Tests: `lib/domains.test.ts`, `lib/clientexec.test.ts`, `app/api/domain-search/route.test.ts`.

---

## Task 1: Add Vitest test tooling

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (add `test` script + devDeps)
- Test: `lib/smoke.test.ts` (temporary smoke test, deleted at end of task)

**Interfaces:**
- Produces: a working `npm test` command and `@/` alias resolution in tests.

- [ ] **Step 1: Install Vitest**

```bash
npm install -D vitest@^2
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.ts", "**/*.test.tsx"],
    exclude: ["node_modules", ".next"],
  },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./", import.meta.url)) },
  },
});
```

- [ ] **Step 3: Add the `test` script to `package.json`**

In the `"scripts"` block, add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Write a smoke test**

Create `lib/smoke.test.ts`:

```ts
import { describe, it, expect } from "vitest";

describe("vitest", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Run it**

Run: `npm test`
Expected: PASS, 1 test passed.

- [ ] **Step 6: Delete the smoke test and commit**

```bash
rm lib/smoke.test.ts
git add package.json package-lock.json vitest.config.ts
git commit -m "chore: add vitest test tooling"
```

---

## Task 2: Pure domain logic (`lib/domains.ts`)

**Files:**
- Create: `lib/domains.ts`
- Test: `lib/domains.test.ts`

**Interfaces:**
- Produces:
  - `TLDS: readonly string[]` = `["com","co","io","org","shop","dev","app","studio"]`
  - `FEATURED_TLDS: readonly string[]` = `["com","co","io","org"]`
  - `SUGGESTED_TLDS: readonly string[]` = `TLDS`
  - `type ParseResult = { ok: true; value: { name: string; tld: string } } | { ok: false; error: string }`
  - `type DomainStatus = "available" | "taken" | "error"`
  - `type DomainResult = { name: string; tld: string; domain: string; status: DomainStatus; formatedPrice: string | null; continueUrl: string | null }`
  - `type TldPrice = { tld: string; formatedPrice: string | null }`
  - `parseDomain(raw: string): ParseResult`
  - `formatYearlyPrice(formated: string | null): string`
- Consumes: nothing.

- [ ] **Step 1: Write the failing tests**

Create `lib/domains.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { parseDomain, formatYearlyPrice } from "@/lib/domains";

describe("parseDomain", () => {
  it("splits name and tld", () => {
    expect(parseDomain("yourbakery.com")).toEqual({ ok: true, value: { name: "yourbakery", tld: "com" } });
  });
  it("defaults bare label to .com", () => {
    expect(parseDomain("yourbakery")).toEqual({ ok: true, value: { name: "yourbakery", tld: "com" } });
  });
  it("lowercases and trims", () => {
    expect(parseDomain("  YourBakery.IO ")).toEqual({ ok: true, value: { name: "yourbakery", tld: "io" } });
  });
  it("strips protocol, www and path", () => {
    expect(parseDomain("https://www.yourbakery.com/cart")).toEqual({ ok: true, value: { name: "yourbakery", tld: "com" } });
  });
  it("keeps multi-label tld", () => {
    expect(parseDomain("yourbakery.co.uk")).toEqual({ ok: true, value: { name: "yourbakery", tld: "co.uk" } });
  });
  it("rejects empty input", () => {
    expect(parseDomain("   ").ok).toBe(false);
  });
  it("rejects illegal characters in the name", () => {
    expect(parseDomain("your bakery!.com").ok).toBe(false);
  });
});

describe("formatYearlyPrice", () => {
  it("strips USD and appends /yr", () => {
    expect(formatYearlyPrice("$16.68 USD")).toBe("$16.68/yr");
  });
  it("returns a dash for null", () => {
    expect(formatYearlyPrice(null)).toBe("—");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run lib/domains.test.ts`
Expected: FAIL — cannot resolve `@/lib/domains` (module not created yet).

- [ ] **Step 3: Implement `lib/domains.ts`**

```ts
/** Pure, isomorphic domain helpers. No env access, no network — safe on client or server. */

export const TLDS = ["com", "co", "io", "org", "shop", "dev", "app", "studio"] as const;
export const FEATURED_TLDS = ["com", "co", "io", "org"] as const;
export const SUGGESTED_TLDS = TLDS;

export type ParseResult =
  | { ok: true; value: { name: string; tld: string } }
  | { ok: false; error: string };

export type DomainStatus = "available" | "taken" | "error";

export type DomainResult = {
  name: string;
  tld: string;
  domain: string;
  status: DomainStatus;
  formatedPrice: string | null;
  continueUrl: string | null;
};

export type TldPrice = { tld: string; formatedPrice: string | null };

const NAME_RE = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const TLD_RE = /^[a-z0-9]+(?:\.[a-z0-9]+)*$/;

export function parseDomain(raw: string): ParseResult {
  let s = (raw ?? "").trim().toLowerCase();
  if (!s) return { ok: false, error: "Enter a domain name." };
  s = s.replace(/^https?:\/\//, "").replace(/^www\./, "");
  s = s.split("/")[0].split("?")[0];
  if (!s) return { ok: false, error: "Enter a domain name." };

  const dot = s.indexOf(".");
  const name = dot === -1 ? s : s.slice(0, dot);
  const tld = dot === -1 ? "com" : s.slice(dot + 1);

  if (!NAME_RE.test(name)) {
    return { ok: false, error: "That doesn't look like a valid domain name." };
  }
  if (!TLD_RE.test(tld)) {
    return { ok: false, error: "That doesn't look like a valid extension." };
  }
  return { ok: true, value: { name, tld } };
}

export function formatYearlyPrice(formated: string | null): string {
  if (!formated) return "—";
  return formated.replace(/\s*USD\s*$/i, "") + "/yr";
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run lib/domains.test.ts`
Expected: PASS — all 9 tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/domains.ts lib/domains.test.ts
git commit -m "feat: add pure domain parse/format helpers"
```

---

## Task 3: ClientExec server access (`lib/clientexec.ts`) + env example

**Files:**
- Create: `lib/clientexec.ts`, `.env.example`
- Test: `lib/clientexec.test.ts`

**Interfaces:**
- Consumes from `lib/domains.ts`: `TLDS`, `DomainResult`, `TldPrice`.
- Produces:
  - `buildOrderUrl(d: { name: string; tld: string }): string`
  - `oneYearPrice(json: unknown): string | null`
  - `checkDomain(d: { name: string; tld: string }): Promise<DomainResult>`
  - `getTldPricing(tlds?: readonly string[]): Promise<TldPrice[]>`

- [ ] **Step 1: Write the failing tests**

Create `lib/clientexec.test.ts`:

```ts
import { describe, it, expect, vi, afterEach } from "vitest";
import { buildOrderUrl, oneYearPrice, checkDomain, getTldPricing } from "@/lib/clientexec";

const AVAILABLE = {
  error: false, success: true,
  search_results: {
    status: 0, available_count: 1,
    available_options: [{
      tld: "com",
      price: [
        { period: "1 Year", period_id: "12", price: 16.68, renew: 16.68, formated_price: "$16.68 USD" },
        { period: "2 Years", period_id: "24", price: 33.36, renew: 33.36, formated_price: "$33.36 USD" },
      ],
    }],
  },
};
const TAKEN = { error: false, success: true, search_results: { status: 1, available_count: 0, available_options: [] } };
const NOT_IN_GROUP = { error: true, success: false, message: "TLD (zzz) does not exist in this group (2)." };

function mockFetchOnce(json: unknown, ok = true) {
  return vi.fn().mockResolvedValue({ ok, status: ok ? 200 : 500, json: () => Promise.resolve(json) });
}

afterEach(() => vi.unstubAllGlobals());

describe("buildOrderUrl", () => {
  it("builds an order URL with group, name and tld", () => {
    const url = buildOrderUrl({ name: "foo", tld: "com" });
    expect(url).toContain("/order.php?");
    expect(url).toContain("step=1");
    expect(url).toContain("productGroup=2");
    expect(url).toContain("domainName=foo");
    expect(url).toContain("tld=com");
  });
});

describe("oneYearPrice", () => {
  it("reads the 1-year formated price", () => {
    expect(oneYearPrice(AVAILABLE)).toBe("$16.68 USD");
  });
  it("returns null when no options", () => {
    expect(oneYearPrice(TAKEN)).toBeNull();
  });
});

describe("checkDomain", () => {
  it("maps an available domain", async () => {
    vi.stubGlobal("fetch", mockFetchOnce(AVAILABLE));
    const r = await checkDomain({ name: "foo", tld: "com" });
    expect(r.status).toBe("available");
    expect(r.formatedPrice).toBe("$16.68 USD");
    expect(r.continueUrl).toContain("/order.php?");
    expect(r.domain).toBe("foo.com");
  });
  it("maps a taken domain", async () => {
    vi.stubGlobal("fetch", mockFetchOnce(TAKEN));
    const r = await checkDomain({ name: "google", tld: "com" });
    expect(r.status).toBe("taken");
    expect(r.continueUrl).toBeNull();
  });
  it("maps a TLD-not-in-group error", async () => {
    vi.stubGlobal("fetch", mockFetchOnce(NOT_IN_GROUP));
    const r = await checkDomain({ name: "foo", tld: "zzz" });
    expect(r.status).toBe("error");
  });
  it("maps a network failure to error (does not throw)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("boom")));
    const r = await checkDomain({ name: "foo", tld: "com" });
    expect(r.status).toBe("error");
  });
});

describe("getTldPricing", () => {
  it("returns a price per tld, null on failure", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(AVAILABLE) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(NOT_IN_GROUP) }));
    const prices = await getTldPricing(["com", "zzz"]);
    expect(prices).toEqual([
      { tld: "com", formatedPrice: "$16.68 USD" },
      { tld: "zzz", formatedPrice: null },
    ]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run lib/clientexec.test.ts`
Expected: FAIL — cannot resolve `@/lib/clientexec`.

- [ ] **Step 3: Implement `lib/clientexec.ts`**

```ts
/** Server-side ClientExec (billing) access. Do not import from client components. */
import { TLDS, type DomainResult, type TldPrice } from "@/lib/domains";

const CE_URL = process.env.CLIENTEXEC_URL ?? "https://account.serverizz.com";
const GROUP_ID = process.env.CLIENTEXEC_DOMAIN_GROUP_ID ?? "2";
const ONE_YEAR_PERIOD_ID = "12";
/** Long, unlikely-to-be-registered label used only to read a TLD's list price. */
const PRICE_PROBE_LABEL = "availability-probe-7x9q2z";

export function buildOrderUrl(d: { name: string; tld: string }): string {
  const u = new URL(`${CE_URL}/order.php`);
  u.searchParams.set("step", "1");
  u.searchParams.set("productGroup", GROUP_ID);
  u.searchParams.set("domainName", d.name);
  u.searchParams.set("tld", d.tld);
  return u.toString();
}

export function oneYearPrice(json: unknown): string | null {
  const opt = (json as any)?.search_results?.available_options?.[0];
  const prices = opt?.price as Array<{ period_id?: string; formated_price?: string }> | undefined;
  if (!prices?.length) return null;
  const oneYear = prices.find((p) => String(p.period_id) === ONE_YEAR_PERIOD_ID) ?? prices[0];
  return oneYear?.formated_price ?? null;
}

async function rawCheck(name: string, tld: string, init: RequestInit): Promise<any> {
  const body = new URLSearchParams({ name, tld, group: GROUP_ID });
  const res = await fetch(`${CE_URL}/index.php?fuse=clients&action=checkdomain`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body,
    ...init,
  });
  if (!res.ok) throw new Error(`ClientExec HTTP ${res.status}`);
  return res.json();
}

export async function checkDomain(d: { name: string; tld: string }): Promise<DomainResult> {
  const domain = `${d.name}.${d.tld}`;
  const base = { name: d.name, tld: d.tld, domain } as const;
  try {
    const json = await rawCheck(d.name, d.tld, { cache: "no-store" });
    if (json?.error) return { ...base, status: "error", formatedPrice: null, continueUrl: null };
    const status = json?.search_results?.status;
    if (status === 0) {
      return { ...base, status: "available", formatedPrice: oneYearPrice(json), continueUrl: buildOrderUrl(d) };
    }
    if (status === 1) return { ...base, status: "taken", formatedPrice: null, continueUrl: null };
    return { ...base, status: "error", formatedPrice: null, continueUrl: null };
  } catch {
    return { ...base, status: "error", formatedPrice: null, continueUrl: null };
  }
}

export async function getTldPricing(tlds: readonly string[] = TLDS): Promise<TldPrice[]> {
  return Promise.all(
    tlds.map(async (tld): Promise<TldPrice> => {
      try {
        // Cached daily — pricing changes rarely; the fan-out runs at ISR revalidation, not per visitor.
        const json = await rawCheck(PRICE_PROBE_LABEL, tld, { next: { revalidate: 86400 } } as RequestInit);
        if (json?.error) return { tld, formatedPrice: null };
        return { tld, formatedPrice: oneYearPrice(json) };
      } catch {
        return { tld, formatedPrice: null };
      }
    })
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run lib/clientexec.test.ts`
Expected: PASS — all tests pass.

- [ ] **Step 5: Create `.env.example`**

```bash
# ClientExec (billing) integration for domain search.
# Both values are non-secret (they appear in public order URLs); set per environment.
CLIENTEXEC_URL=https://account.serverizz.com
CLIENTEXEC_DOMAIN_GROUP_ID=2
```

- [ ] **Step 6: Commit**

```bash
git add lib/clientexec.ts lib/clientexec.test.ts .env.example
git commit -m "feat: add ClientExec checkdomain + pricing access"
```

---

## Task 4: Search route handler (`app/api/domain-search/route.ts`)

**Files:**
- Create: `app/api/domain-search/route.ts`
- Test: `app/api/domain-search/route.test.ts`

**Interfaces:**
- Consumes: `parseDomain`, `SUGGESTED_TLDS` from `lib/domains`; `checkDomain` from `lib/clientexec`.
- Produces: `POST(request: Request): Promise<Response>` returning `{ query: { name, tld }, results: DomainResult[] }` on success (200), `{ error: string }` on validation (400) or outage (502). Typed-domain result is first in `results`.

- [ ] **Step 1: Read the Next docs**

Read `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md` (already confirmed: standard `Request`/`Response`, `Response.json()`).

- [ ] **Step 2: Write the failing test**

Create `app/api/domain-search/route.test.ts`:

```ts
import { describe, it, expect, vi, afterEach } from "vitest";
import { POST } from "@/app/api/domain-search/route";

const AVAILABLE = {
  error: false, success: true,
  search_results: { status: 0, available_options: [{ tld: "com", price: [{ period_id: "12", formated_price: "$16.68 USD" }] }] },
};

function req(body: unknown) {
  return new Request("http://localhost/api/domain-search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

afterEach(() => vi.unstubAllGlobals());

describe("POST /api/domain-search", () => {
  it("400s on invalid input", async () => {
    const res = await POST(req({ domain: "   " }));
    expect(res.status).toBe(400);
  });

  it("returns results with the typed domain first", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve(AVAILABLE) }));
    const res = await POST(req({ domain: "yourbakery.io" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.query).toEqual({ name: "yourbakery", tld: "io" });
    expect(json.results[0].tld).toBe("io"); // typed tld first
    expect(json.results.length).toBeGreaterThan(1); // plus suggestions
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx vitest run app/api/domain-search/route.test.ts`
Expected: FAIL — cannot resolve `@/app/api/domain-search/route`.

- [ ] **Step 4: Implement the route handler**

```ts
import { parseDomain, SUGGESTED_TLDS } from "@/lib/domains";
import { checkDomain } from "@/lib/clientexec";

export async function POST(request: Request): Promise<Response> {
  let domain = "";
  try {
    const body = await request.json();
    domain = typeof body?.domain === "string" ? body.domain : "";
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = parseDomain(domain);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  const { name, tld } = parsed.value;
  const tlds = [tld, ...SUGGESTED_TLDS.filter((t) => t !== tld)];

  try {
    const results = await Promise.all(tlds.map((t) => checkDomain({ name, tld: t })));
    return Response.json({ query: { name, tld }, results });
  } catch {
    return Response.json(
      { error: "Domain search is temporarily unavailable. Please try again." },
      { status: 502 }
    );
  }
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run app/api/domain-search/route.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/api/domain-search/route.ts app/api/domain-search/route.test.ts
git commit -m "feat: add /api/domain-search route handler"
```

---

## Task 5: Shared search component (`components/szz/domain-search.tsx`)

**Files:**
- Create: `components/szz/domain-search.tsx`

**Interfaces:**
- Consumes: `parseDomain`, `DomainResult` from `lib/domains`; `Input`, `Button` components.
- Produces: `export function DomainSearch({ placeholder }: { placeholder?: string })` — a `"use client"` component rendering the search bar + result states.

- [ ] **Step 1: Implement the component**

```tsx
"use client";

import * as React from "react";
import { Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { parseDomain, type DomainResult } from "@/lib/domains";

type State =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "results"; results: DomainResult[] }
  | { phase: "error"; message: string };

export function DomainSearch({ placeholder = "find yourbakery.com" }: { placeholder?: string }) {
  const [value, setValue] = React.useState("");
  const [state, setState] = React.useState<State>({ phase: "idle" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseDomain(value);
    if (!parsed.ok) {
      setState({ phase: "error", message: parsed.error });
      return;
    }
    setState({ phase: "loading" });
    try {
      const res = await fetch("/api/domain-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: value }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState({ phase: "error", message: json.error ?? "Search failed. Please try again." });
        return;
      }
      setState({ phase: "results", results: json.results ?? [] });
    } catch {
      setState({ phase: "error", message: "Search failed. Check your connection and try again." });
    }
  }

  return (
    <div style={{ width: "100%", maxWidth: 600, display: "flex", flexDirection: "column", gap: 16 }}>
      <form className="szz-inline-search" style={{ display: "flex", gap: 10, width: "100%" }} onSubmit={handleSubmit}>
        <div style={{ flex: 1 }}>
          <Input
            mono
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            aria-label="Search for a domain"
          />
        </div>
        <Button type="submit" variant="primary" size="lg" disabled={state.phase === "loading"}>
          {state.phase === "loading" ? "Searching…" : "Search"}
        </Button>
      </form>

      {state.phase === "error" && (
        <p role="alert" style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--szz-red)" }}>
          {state.message}
        </p>
      )}

      {state.phase === "loading" && (
        <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--szz-text-muted)" }}>
          Checking availability…
        </p>
      )}

      {state.phase === "results" && (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8, textAlign: "left" }}>
          {state.results.map((r) => (
            <li
              key={r.domain}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                border: "1px solid var(--szz-border)", borderRadius: 10,
                background: "var(--szz-bg-deep)", padding: "12px 16px",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                {r.status === "available" ? (
                  <Check size={18} style={{ color: "var(--szz-green)", flex: "none" }} />
                ) : (
                  <X size={18} style={{ color: "var(--szz-text-dim)", flex: "none" }} />
                )}
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 15, color: "var(--szz-text-primary)", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {r.domain}
                </span>
              </span>

              {r.status === "available" ? (
                <span style={{ display: "flex", alignItems: "center", gap: 14, flex: "none" }}>
                  {r.formatedPrice && (
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--szz-accent-blue)", whiteSpace: "nowrap" }}>
                      {r.formatedPrice}
                    </span>
                  )}
                  <Button asChild variant="primary" size="sm">
                    <a href={r.continueUrl ?? "#"}>Continue →</a>
                  </Button>
                </span>
              ) : (
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--szz-text-dim)", flex: "none" }}>
                  {r.status === "taken" ? "taken" : "unavailable"}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/szz/domain-search.tsx
git commit -m "feat: add shared DomainSearch client component"
```

---

## Task 6: Wire the domains page (search + live grid/pills)

**Files:**
- Modify: `app/domains/page.tsx`

**Interfaces:**
- Consumes: `DomainSearch`, `getTldPricing`, `TLDS`, `formatYearlyPrice`.

- [ ] **Step 1: Read the current file**

Read `app/domains/page.tsx`. Note: the component is a server component; the hero search (lines ~56-63) currently routes to `/support`; `tlds` (lines ~24-33) and `heroPills` (line ~22) are hardcoded.

- [ ] **Step 2: Update imports**

Replace the `Input` import and remove the hardcoded `tlds`/`heroPills` arrays. Add:

```ts
import { getTldPricing } from "@/lib/clientexec";
import { TLDS, formatYearlyPrice } from "@/lib/domains";
import { DomainSearch } from "@/components/szz/domain-search";
```

Remove `import { Input } from "@/components/ui/input";` (no longer used), and delete the `const heroPills = [...]` and `const tlds = [...]` declarations.

- [ ] **Step 3: Make the page async and fetch pricing**

Change the signature to:

```tsx
export default async function DomainsPage() {
  const pricing = await getTldPricing(TLDS);
```

- [ ] **Step 4: Replace the hero search markup**

Replace the existing search `<div className="szz-inline-search">…</div>` block with:

```tsx
<DomainSearch placeholder="search yourbusiness.com" />
```

- [ ] **Step 5: Replace the hero pills**

Replace the hero pills block (the `{heroPills.map(...)}` `<div>`) with a live version using the first 5 priced TLDs:

```tsx
<div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
  {pricing.slice(0, 5).map(({ tld, formatedPrice }) => (
    <span key={tld} style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--szz-text-dim)", border: "1px solid var(--szz-border)", borderRadius: 999, padding: "5px 12px" }}>
      .{tld} {formatedPrice ? formatedPrice.replace(/\s*USD\s*$/i, "") : "—"}
    </span>
  ))}
</div>
```

- [ ] **Step 6: Replace the pricing grid**

Replace the `{tlds.map(([tld, price]) => (...))}` block with:

```tsx
{pricing.map(({ tld, formatedPrice }) => (
  <div key={tld} style={{ border: "1px solid var(--szz-border)", borderRadius: 10, background: "var(--szz-bg-deep)", padding: 20, display: "flex", flexDirection: "column", gap: 6 }}>
    <span style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700, color: "var(--szz-text-primary)" }}>.{tld}</span>
    <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--szz-accent-blue)" }}>{formatYearlyPrice(formatedPrice)}</span>
  </div>
))}
```

- [ ] **Step 7: Type-check and build**

Run: `npx tsc --noEmit && npm run lint`
Expected: no type errors, no lint errors.

- [ ] **Step 8: Commit**

```bash
git add app/domains/page.tsx
git commit -m "feat: wire domains page to live search and pricing"
```

---

## Task 7: Wire the home page (search + live featured pills)

**Files:**
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `DomainSearch`, `getTldPricing`, `FEATURED_TLDS`.

- [ ] **Step 1: Read the current file**

Read `app/page.tsx`. Note: server component; hero search (lines ~79-86) routes to `/domains`; hero pills (lines ~87-99) are hardcoded `.com $11 · .co $24 · .io $39 · .org $13` with an "already own one?" link.

- [ ] **Step 2: Update imports**

Add:

```ts
import { getTldPricing } from "@/lib/clientexec";
import { FEATURED_TLDS } from "@/lib/domains";
import { DomainSearch } from "@/components/szz/domain-search";
```

Remove `import { Input } from "@/components/ui/input";` (no longer used).

- [ ] **Step 3: Make the page async and fetch featured pricing**

```tsx
export default async function HomePage() {
  const pricing = await getTldPricing(FEATURED_TLDS);
```

- [ ] **Step 4: Replace the hero search markup**

Replace the `<div className="szz-inline-search">…</div>` block with:

```tsx
<DomainSearch placeholder="find yourbakery.com" />
```

- [ ] **Step 5: Replace the hero pills (keep the "bring it free" link)**

Replace the pills `<div>` (the `.com $11 · …` block) with:

```tsx
<div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--szz-text-dim)" }}>
  {pricing.map(({ tld, formatedPrice }, i) => (
    <span key={tld}>
      {i > 0 ? " · " : ""}.{tld}{" "}
      <span style={{ color: "var(--szz-accent-blue)" }}>
        {formatedPrice ? formatedPrice.replace(/\s*USD\s*$/i, "") : "—"}
      </span>
    </span>
  ))}
  {" — "}
  <Link href="/domains" className="szz-link-accent" style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--szz-text-light)" }}>
    already own one? bring it free →
  </Link>
</div>
```

- [ ] **Step 6: Type-check and build**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add app/page.tsx
git commit -m "feat: wire home page to live search and pricing"
```

---

## Task 8: Full verification

**Files:** none (verification only).

- [ ] **Step 1: Run the whole test suite**

Run: `npm test`
Expected: all tests pass.

- [ ] **Step 2: Type-check + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean.

- [ ] **Step 3: Production build**

Run: `npm run build`
Expected: build succeeds. The home and domains pages will hit ClientExec for pricing during build/prerender — confirm no build-time fetch errors (network access to account.serverizz.com required).

- [ ] **Step 4: Manual smoke test**

Run: `npm run dev`, then in the browser:
1. Home hero: search `yourbakery` → results list shows `.com` first (available + price) plus suggestions; a taken domain (e.g. `google`) shows "taken".
2. Click **Continue →** on an available row → lands on `account.serverizz.com/order.php?step=1&productGroup=2&domainName=…&tld=…`.
3. Invalid input (e.g. `your bakery!`) → inline red validation message, no network call.
4. Domains page: hero pills + pricing grid show live prices (e.g. `.com $16.68/yr`), matching what search returns.
5. Toggle the light/dark theme → result rows and pills remain on-brand in both.

- [ ] **Step 5: Final commit (if any verification fixes were needed)**

```bash
git add -A
git commit -m "chore: verification fixes for domain search" || echo "nothing to commit"
```

---

## Self-Review (completed by plan author)

- **Spec coverage:** inline branded results (Task 5); typed + suggested TLDs (Tasks 2/4); both entry points via shared component (Tasks 5/6/7); same-origin proxy (Task 4); group 2 + live pricing everywhere (Tasks 3/6/7); status 0/1 semantics + price extraction (Task 3); caching: no-store search / daily pricing (Tasks 3/4); error handling incl. per-TLD failure and probe-label fallback (Tasks 3/5); env config + `.env.example` (Task 3); tests (Tasks 2/3/4). All spec sections map to tasks.
- **Placeholder scan:** none — every code step contains full code.
- **Type consistency:** `DomainResult`/`TldPrice`/`ParseResult` defined in Task 2 and consumed unchanged in Tasks 3/4/5; `checkDomain`, `getTldPricing`, `buildOrderUrl`, `oneYearPrice`, `parseDomain`, `formatYearlyPrice`, `SUGGESTED_TLDS`, `FEATURED_TLDS`, `TLDS` names are consistent across tasks.
