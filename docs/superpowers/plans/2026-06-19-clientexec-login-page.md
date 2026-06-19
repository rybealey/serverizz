# ClientExec Login Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the SERVERIZZ login page — a full-bleed two-panel sign-in screen that authenticates against ClientExec via a pre-validate proxy plus a native session hand-off.

**Architecture:** A route-group refactor moves all marketing pages under `app/(site)/` (with the nav/footer chrome) so `app/login/` can render bare. The login form POSTs to our own `/api/login` to validate credentials (inline error UI on failure); on success the browser submits a hidden native form directly to ClientExec so it receives ClientExec's cross-domain session cookie and lands on the dashboard.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, vitest (node env), the existing `szz-*` design system components.

## Global Constraints

- **AGENTS.md:** This Next.js version has breaking changes — read the relevant guide in `node_modules/next/dist/docs/` before writing routing/layout code.
- **ClientExec endpoint (from docs):** `POST ${CLIENTEXEC_URL}/index.php?fuse=admin&action=Login`, fields `email`, `passed_password`, `btnSubmit`.
- **`CLIENTEXEC_URL`** is read **server-side only** (default `https://account.serverizz.com`); never expose it via `NEXT_PUBLIC_`. Only the resulting public CE URLs are passed to client code.
- **The password is NEVER logged** in any server code.
- **`/login` is `noindex`** and stays out of `sitemap.ts` (not added to `ROUTES`).
- **Tests run in the `node` environment** (see `vitest.config.ts`) — no jsdom. Do not write React-render unit tests; verify UI via `next build` + typecheck + manual.
- **Verify-against-live-instance** (use the defaults below, confirm during manual testing): the CE success/failure heuristic, the forgot-password URL, the signup/order URL.
- Follow existing conventions: route handlers mirror `app/api/domain-search/route.ts`; tests mirror `lib/clientexec.test.ts` / `app/api/domain-search/route.test.ts`.

---

### Task 1: ClientExec login helpers (`lib/clientexec.ts`)

**Files:**
- Modify: `lib/clientexec.ts` (append new exports; reuse existing `CE_URL` constant)
- Test: `lib/clientexec.test.ts` (append a new describe block)

**Interfaces:**
- Consumes: the module-level `CE_URL` constant already defined at the top of `lib/clientexec.ts`.
- Produces:
  - `buildLoginUrl(): string`
  - `buildForgotPasswordUrl(): string`
  - `buildSignupUrl(): string`
  - `isLoginSuccess(status: number, location: string | null): boolean`
  - `verifyCredentials(creds: { email: string; password: string }): Promise<boolean>` — resolves `true`/`false` for valid/invalid credentials; **rejects** (throws) if ClientExec is unreachable.

- [ ] **Step 1: Write the failing tests**

Append to `lib/clientexec.test.ts`:

```ts
import {
  buildLoginUrl,
  buildForgotPasswordUrl,
  buildSignupUrl,
  isLoginSuccess,
  verifyCredentials,
} from "@/lib/clientexec";

function mockFetchResponse(opts: { status: number; location?: string | null }) {
  return vi.fn().mockResolvedValue({
    status: opts.status,
    headers: { get: (k: string) => (k.toLowerCase() === "location" ? opts.location ?? null : null) },
  });
}

describe("buildLoginUrl", () => {
  it("targets the CE admin login action", () => {
    expect(buildLoginUrl()).toContain("/index.php?fuse=admin&action=Login");
  });
});

describe("buildForgotPasswordUrl / buildSignupUrl", () => {
  it("are absolute CE URLs", () => {
    expect(buildForgotPasswordUrl()).toMatch(/^https?:\/\/.+/);
    expect(buildSignupUrl()).toMatch(/^https?:\/\/.+/);
  });
});

describe("isLoginSuccess", () => {
  it("treats a redirect away from the login screen as success", () => {
    expect(isLoginSuccess(302, "https://account.serverizz.com/index.php?fuse=clients")).toBe(true);
  });
  it("treats a 200 (login form re-rendered) as failure", () => {
    expect(isLoginSuccess(200, null)).toBe(false);
  });
  it("treats a redirect back to the login screen as failure", () => {
    expect(isLoginSuccess(302, "https://account.serverizz.com/index.php?fuse=admin&action=Login")).toBe(false);
  });
  it("treats a redirect with no location as failure", () => {
    expect(isLoginSuccess(302, null)).toBe(false);
  });
});

describe("verifyCredentials", () => {
  it("returns true when CE redirects to the dashboard", async () => {
    vi.stubGlobal("fetch", mockFetchResponse({ status: 302, location: "https://account.serverizz.com/index.php?fuse=clients" }));
    expect(await verifyCredentials({ email: "a@b.com", password: "pw" })).toBe(true);
  });
  it("returns false when CE re-renders the login form (200)", async () => {
    vi.stubGlobal("fetch", mockFetchResponse({ status: 200 }));
    expect(await verifyCredentials({ email: "a@b.com", password: "bad" })).toBe(false);
  });
  it("rejects when CE is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    await expect(verifyCredentials({ email: "a@b.com", password: "pw" })).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- lib/clientexec.test.ts`
Expected: FAIL — the new exports are not defined.

- [ ] **Step 3: Implement the helpers**

Append to `lib/clientexec.ts` (after the existing exports; `CE_URL` is already defined at the top of the file):

```ts
export function buildLoginUrl(): string {
  return `${CE_URL}/index.php?fuse=admin&action=Login`;
}

// NOTE: verify-against-live-instance — confirm these paths on account.serverizz.com.
export function buildForgotPasswordUrl(): string {
  return `${CE_URL}/index.php?fuse=clients&action=forgotpassword`;
}

export function buildSignupUrl(): string {
  return `${CE_URL}/order.php`;
}

/**
 * Decide whether a ClientExec login POST succeeded, from the (redirect:"manual")
 * response. Heuristic — isolated here so it's trivial to adjust after testing
 * against the live instance:
 *   - a 3xx redirect that does NOT go back to the login screen → success
 *   - a 200 (login form re-rendered) or a redirect back to ?action=Login → failure
 */
export function isLoginSuccess(status: number, location: string | null): boolean {
  const isRedirect = status >= 300 && status < 400;
  if (!isRedirect) return false;
  const loc = (location ?? "").toLowerCase();
  if (!loc || loc.includes("action=login")) return false;
  return true;
}

/** Validate credentials against ClientExec. Throws if CE is unreachable. */
export async function verifyCredentials(creds: { email: string; password: string }): Promise<boolean> {
  const body = new URLSearchParams({
    email: creds.email,
    passed_password: creds.password,
    btnSubmit: "Login",
  });
  const res = await fetch(buildLoginUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    redirect: "manual",
    cache: "no-store",
  });
  return isLoginSuccess(res.status, res.headers.get("location"));
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- lib/clientexec.test.ts`
Expected: PASS (all describe blocks, old and new).

- [ ] **Step 5: Commit**

```bash
git add lib/clientexec.ts lib/clientexec.test.ts
git commit -m "feat: add ClientExec login URL builders + verifyCredentials"
```

---

### Task 2: `/api/login` route handler

**Files:**
- Create: `app/api/login/route.ts`
- Test: `app/api/login/route.test.ts`

**Interfaces:**
- Consumes: `verifyCredentials` from `@/lib/clientexec` (Task 1).
- Produces: `POST(request: Request): Promise<Response>` — JSON `{ ok: true }` (200) on valid creds; `{ ok: false, error }` (200) on invalid creds; `{ error }` 400 on a malformed body; `{ error }` 502 when CE is unreachable.

- [ ] **Step 1: Write the failing tests**

Create `app/api/login/route.test.ts`:

```ts
import { describe, it, expect, vi, afterEach } from "vitest";
import { POST } from "@/app/api/login/route";

function req(body: unknown) {
  return new Request("http://localhost/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function mockFetch(opts: { status: number; location?: string | null }) {
  return vi.fn().mockResolvedValue({
    status: opts.status,
    headers: { get: (k: string) => (k.toLowerCase() === "location" ? opts.location ?? null : null) },
  });
}

afterEach(() => vi.unstubAllGlobals());

describe("POST /api/login", () => {
  it("400s when email or password is missing", async () => {
    const res = await POST(req({ email: "a@b.com" }));
    expect(res.status).toBe(400);
  });

  it("returns ok:true on valid credentials", async () => {
    vi.stubGlobal("fetch", mockFetch({ status: 302, location: "https://account.serverizz.com/index.php?fuse=clients" }));
    const res = await POST(req({ email: "a@b.com", password: "pw" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("returns ok:false on invalid credentials", async () => {
    vi.stubGlobal("fetch", mockFetch({ status: 200 }));
    const res = await POST(req({ email: "a@b.com", password: "bad" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(typeof json.error).toBe("string");
  });

  it("502s when ClientExec is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    const res = await POST(req({ email: "a@b.com", password: "pw" }));
    expect(res.status).toBe(502);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- app/api/login/route.test.ts`
Expected: FAIL — `app/api/login/route` does not exist.

- [ ] **Step 3: Implement the route**

Create `app/api/login/route.ts`:

```ts
import { verifyCredentials } from "@/lib/clientexec";

export async function POST(request: Request): Promise<Response> {
  let email = "";
  let password = "";
  try {
    const body = await request.json();
    email = typeof body?.email === "string" ? body.email.trim() : "";
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!email || !password) {
    return Response.json({ error: "Email and password are required." }, { status: 400 });
  }

  try {
    const ok = await verifyCredentials({ email, password });
    if (ok) return Response.json({ ok: true });
    return Response.json({ ok: false, error: "Incorrect email or password." });
  } catch {
    return Response.json(
      { error: "Sign-in is temporarily unavailable. Please try again." },
      { status: 502 }
    );
  }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- app/api/login/route.test.ts`
Expected: PASS (all four cases).

- [ ] **Step 5: Commit**

```bash
git add app/api/login/route.ts app/api/login/route.test.ts
git commit -m "feat: add /api/login proxy that validates against ClientExec"
```

---

### Task 3: Route-group refactor (chrome moves to `app/(site)/`)

**Files:**
- Modify: `app/layout.tsx` (trim to root shell)
- Create: `app/(site)/layout.tsx` (the nav/footer chrome)
- Move (git mv): `app/page.tsx`, `app/hosting/`, `app/domains/`, `app/why/`, `app/wordpress/`, `app/support/` → under `app/(site)/`

**Interfaces:**
- Produces: a single top-level root layout (`app/layout.tsx`) and a nested `(site)` layout that renders `SiteNav` + `<main>` + `SiteFooter`. URLs are unchanged.

- [ ] **Step 1: Read the Next.js routing docs**

Read `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route-groups.md` and `…/layout.md`. Confirm: a `(group)` folder does not affect the URL, and that keeping one top-level `app/layout.tsx` avoids the multiple-root-layout full-reload caveat.

- [ ] **Step 2: Move the marketing pages into the group**

```bash
mkdir -p "app/(site)"
git mv app/page.tsx "app/(site)/page.tsx"
git mv app/hosting "app/(site)/hosting"
git mv app/domains "app/(site)/domains"
git mv app/why "app/(site)/why"
git mv app/wordpress "app/(site)/wordpress"
git mv app/support "app/(site)/support"
```

Leave at `app/` root (these are metadata routes / globals, not pages): `layout.tsx`, `globals.css`, `sitemap.ts`, `robots.ts`, `opengraph-image.tsx`, `twitter-image.tsx`, `icon.svg`, `favicon.ico`, `apple-icon.png`, and the `api/` directory.

- [ ] **Step 3: Create the `(site)` chrome layout**

Create `app/(site)/layout.tsx`:

```tsx
import type { ReactNode } from "react";
import { SiteNav } from "@/components/szz/site-nav";
import { SiteFooter } from "@/components/szz/site-footer";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--szz-bg-deep)" }}>
      <SiteNav />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
```

- [ ] **Step 4: Trim the root layout**

In `app/layout.tsx`, remove the chrome and its imports. Delete these two import lines:

```tsx
import { SiteNav } from "@/components/szz/site-nav";
import { SiteFooter } from "@/components/szz/site-footer";
```

Replace the body's wrapping `<div>…</div>` (the `SiteNav`/`<main>`/`SiteFooter` block) so the JSON-LD and `AffiliateTracker` stay global but the chrome is gone. The body becomes:

```tsx
      <body>
        <OrganizationJsonLd
          type="Organization"
          name={SITE_NAME}
          legalName={ORG.legalName}
          url={SITE_URL}
          logo={`${SITE_URL}/opengraph-image`}
          description={SITE_DESCRIPTION}
          email={ORG.email}
          address={{ "@type": "PostalAddress", ...ORG.address }}
          contactPoint={{
            "@type": "ContactPoint",
            contactType: "customer support",
            email: ORG.supportEmail,
          }}
        />
        <JsonLdScript
          id="website-jsonld"
          scriptKey="website-jsonld"
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: SITE_NAME,
            url: SITE_URL,
            description: SITE_DESCRIPTION,
            inLanguage: "en-US",
            publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
          }}
        />
        {children}
        <AffiliateTracker />
      </body>
```

- [ ] **Step 5: Verify the build and existing URLs**

Run: `npm run build`
Expected: build succeeds; the route list still shows `/`, `/hosting`, `/domains`, `/why`, `/wordpress`, `/support` (route group adds no URL segment).

- [ ] **Step 6: Run the full test suite (no regressions)**

Run: `npm test`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "refactor: move marketing pages into (site) route group with chrome layout"
```

---

### Task 4: Login brand-aside styles (`app/globals.css`)

**Files:**
- Modify: `app/globals.css` (append login rules at the end)

**Interfaces:**
- Produces: a `.szz-login-aside` class that forces a dark palette inside the always-dark brand panel and hides the panel below 640px.

- [ ] **Step 1: Append the styles**

Add to the end of `app/globals.css` (ported verbatim from the design's `<style>` block):

```css
/* ---------- Login brand aside (always dark, regardless of theme) ---------- */
.szz-login-aside {
  --szz-text-light: #cbd5e1;
  --szz-text-muted: #94a3b8;
  --szz-text-faint: #64748b;
  --szz-accent-blue: #60a5fa;
}
.szz-login-aside .szz-logo__word {
  color: #fff;
}
@media (max-width: 640px) {
  /* On mobile the brand panel collapses; the form panel goes full-width. */
  .szz-login-aside {
    display: none !important;
  }
}
```

- [ ] **Step 2: Verify the build**

Run: `npm run build`
Expected: build succeeds (CSS compiles).

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: add login brand-aside styles"
```

---

### Task 5: `LoginForm` client component

**Files:**
- Create: `components/szz/login-form.tsx`

**Interfaces:**
- Consumes: `@/components/ui/input` (`Input`), `@/components/ui/button` (`Button`), and `POST /api/login` (Task 2).
- Produces: `LoginForm({ ceLoginUrl, ceForgotUrl, ceSignupUrl }: { ceLoginUrl: string; ceForgotUrl: string; ceSignupUrl: string })` — the right-panel form with verifying/error states and a hidden native hand-off form.

- [ ] **Step 1: Implement the component**

Create `components/szz/login-form.tsx`:

```tsx
"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Status = "idle" | "verifying" | "error";

export function LoginForm({
  ceLoginUrl,
  ceForgotUrl,
  ceSignupUrl,
}: {
  ceLoginUrl: string;
  ceForgotUrl: string;
  ceSignupUrl: string;
}) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [status, setStatus] = React.useState<Status>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const handoffRef = React.useRef<HTMLFormElement>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setStatus("error");
      setError("Enter your email and password.");
      return;
    }
    setStatus("verifying");
    setError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.ok) {
        // Credentials are valid — hand off to ClientExec so the browser
        // receives CE's (cross-domain) session cookie. Stay in "verifying"
        // while the navigation happens.
        handoffRef.current?.submit();
        return;
      }
      setStatus("error");
      setError(typeof data?.error === "string" ? data.error : "Incorrect email or password.");
    } catch {
      setStatus("error");
      setError("Something went wrong. Please try again.");
    }
  }

  const verifying = status === "verifying";

  return (
    <div style={{ width: "100%", maxWidth: 400 }}>
      <div style={{ marginBottom: 30, display: "flex", flexDirection: "column", gap: 8 }}>
        <h2 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: 28, fontWeight: 700, letterSpacing: "-.5px", color: "var(--szz-text-primary)" }}>
          Sign in
        </h2>
        <p style={{ margin: 0, fontSize: 14, color: "var(--szz-text-muted)" }}>
          Access your SERVERIZZ account.
        </p>
      </div>

      {verifying && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, border: "1px solid var(--szz-border)", borderRadius: 8, background: "var(--szz-bg-deep)", padding: "11px 14px" }}>
          <span style={{ width: 7, height: 7, borderRadius: 999, background: "var(--szz-green)" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--szz-text-light)" }}>
            Verifying credentials…
          </span>
        </div>
      )}

      {status === "error" && error && (
        <div role="alert" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, border: "1px solid var(--szz-red)", borderRadius: 8, background: "var(--szz-bg-deep)", padding: "11px 14px" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--szz-red)" }}>{error}</span>
        </div>
      )}

      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Input
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@yourbusiness.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500, color: "var(--szz-text-light)" }}>
              Password
            </span>
            <a href={ceForgotUrl} style={{ fontSize: 12, color: "var(--szz-accent-blue)" }}>
              Forgot password?
            </a>
          </div>
          <Input
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" variant="primary" size="lg" disabled={verifying}>
          {verifying ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p style={{ marginTop: 28, textAlign: "center", fontSize: 13, color: "var(--szz-text-muted)" }}>
        New to SERVERIZZ?{" "}
        <a href={ceSignupUrl} style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: "var(--szz-accent-blue)" }}>
          Create an account
        </a>
      </p>

      {/* Hidden native form: the actual session-establishing POST to ClientExec. */}
      <form ref={handoffRef} method="post" action={ceLoginUrl} style={{ display: "none" }} aria-hidden="true">
        <input type="hidden" name="email" value={email} readOnly />
        <input type="hidden" name="passed_password" value={password} readOnly />
        <input type="hidden" name="btnSubmit" value="Login" readOnly />
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no type errors.

- [ ] **Step 3: Commit**

```bash
git add components/szz/login-form.tsx
git commit -m "feat: add LoginForm client component"
```

---

### Task 6: Login page + nav link

**Files:**
- Create: `app/login/page.tsx`
- Modify: `components/szz/site-nav.tsx` (repoint the "Log In" link)

**Interfaces:**
- Consumes: `LoginForm` (Task 5); `buildLoginUrl`, `buildForgotPasswordUrl`, `buildSignupUrl` (Task 1); `TerminalLogo`, `SectionEyebrow`; lucide icons `Gauge`, `DatabaseBackup`, `ShieldCheck`.
- Produces: the `/login` route (full-bleed, `noindex`) and a nav "Log In" link that points to `/login`.

- [ ] **Step 1: Create the login page**

Create `app/login/page.tsx`:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Gauge, DatabaseBackup, ShieldCheck, type LucideIcon } from "lucide-react";
import { TerminalLogo } from "@/components/szz/terminal-logo";
import { SectionEyebrow } from "@/components/szz/section-eyebrow";
import { LoginForm } from "@/components/szz/login-form";
import { buildLoginUrl, buildForgotPasswordUrl, buildSignupUrl } from "@/lib/clientexec";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your SERVERIZZ account.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/login" },
};

const features: { Icon: LucideIcon; color: string; text: string }[] = [
  { Icon: Gauge, color: "var(--szz-accent-blue)", text: "Real-time site health & uptime" },
  { Icon: DatabaseBackup, color: "var(--szz-accent-blue)", text: "One-click backups & restores" },
  { Icon: ShieldCheck, color: "var(--szz-green)", text: "Free SSL, security & 2FA built in" },
];

export default function LoginPage() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--szz-bg-deep)" }}>
      {/* left brand panel */}
      <div
        className="szz-login-aside"
        style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 40, padding: "56px 64px", background: "linear-gradient(135deg,#0B0E18 0%,#111827 50%,#0F172A 100%)", borderRight: "1px solid var(--szz-border)" }}
      >
        <Link href="/" aria-label="SERVERIZZ home" style={{ alignSelf: "flex-start" }}>
          <TerminalLogo size={28} />
        </Link>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <SectionEyebrow>Welcome_back</SectionEyebrow>
          <h1 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: 40, fontWeight: 700, lineHeight: 1.1, letterSpacing: "-1.5px", color: "#fff" }}>
            Your sites, email &amp; <br />billing — one login.
          </h1>
          <p style={{ margin: 0, maxWidth: 420, fontSize: 16, lineHeight: 1.6, color: "var(--szz-text-muted)" }}>
            Manage hosting, domains and mailboxes from a single dashboard — with your account manager a click away.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 4 }}>
            {features.map(({ Icon, color, text }) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Icon size={18} style={{ color }} />
                <span style={{ fontSize: 14, color: "var(--szz-text-light)" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
        <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--szz-text-faint)" }}>
          © 2026 Rizz Enterprises, LLC
        </span>
      </div>

      {/* right form panel */}
      <div style={{ width: 560, maxWidth: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "56px 64px", background: "var(--szz-bg-card)" }}>
        <LoginForm
          ceLoginUrl={buildLoginUrl()}
          ceForgotUrl={buildForgotPasswordUrl()}
          ceSignupUrl={buildSignupUrl()}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Repoint the nav "Log In" link**

In `components/szz/site-nav.tsx`, change the "Log In" link's `href` from `/support` to `/login`:

```tsx
          <Link
            href="/login"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 14,
              fontWeight: 500,
              color: "var(--szz-text-primary)",
            }}
          >
            Log In
          </Link>
```

- [ ] **Step 3: Verify the build**

Run: `npm run build`
Expected: build succeeds; route list now includes `/login`. Confirm `/login` is not listed in `app/sitemap.ts` output (it is not in `ROUTES`).

- [ ] **Step 4: Commit**

```bash
git add app/login/page.tsx components/szz/site-nav.tsx
git commit -m "feat: add /login page and point nav Log In link at it"
```

---

### Task 7: Full verification + live-instance checklist

**Files:** none (verification only)

- [ ] **Step 1: Lint, typecheck, test, build**

Run: `npm run lint && npx tsc --noEmit && npm test && npm run build`
Expected: all pass.

- [ ] **Step 2: Manual smoke test (dev server)**

Run: `npm run dev`, open `/login`.
Confirm: two-panel layout matches the design; nav/footer are absent; below 640px the brand aside hides and the form panel is full-width; the nav "Log In" link routes here from other pages.

- [ ] **Step 3: Live-instance verification (record results)**

Against the live `account.serverizz.com`, confirm and adjust the defaults if needed:
- **Success/failure heuristic** in `isLoginSuccess` — submit valid creds (should hand off to the dashboard) and invalid creds (should show the inline error). If CE's real responses differ from the redirect/200 assumption, adjust `isLoginSuccess` / `verifyCredentials`.
- **`buildForgotPasswordUrl()`** — confirm `index.php?fuse=clients&action=forgotpassword` resolves to the reset page; correct it otherwise.
- **`buildSignupUrl()`** — confirm `order.php` is the right signup/order entry; correct it otherwise.

- [ ] **Step 4: Commit any live-instance corrections**

```bash
git add -A
git commit -m "fix: align ClientExec login URLs/heuristic with live instance"
```
(Skip if no changes were needed.)
