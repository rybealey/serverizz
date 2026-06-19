# Register Page + Login Emblem Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an on-brand `/register` page that creates a ClientExec account from name + email behind a Cloudflare Turnstile gate, and fix the login brand panel so the terminal emblem stays dark in light theme.

**Architecture:** The `/register` page mirrors the existing login page: a server component renders a dark brand aside plus a client `RegisterForm`. The form gates submission on a real Cloudflare Turnstile widget, then POSTs to a server-side `/api/register` route. The route verifies the Turnstile token with Cloudflare and creates the account in ClientExec server-side (Turnstile secret never reaches the client). Success shows an on-site confirmation; no cross-domain handoff.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind v4 + `.szz-*` design-system classes, Vitest (node environment), Cloudflare Turnstile.

## Global Constraints

- Next.js 16 / React 19. Per `AGENTS.md`: this is NOT the Next.js in training data — read the relevant guide in `node_modules/next/dist/docs/` before writing routing/page code.
- Import alias: `@/` maps to repo root.
- Tests use Vitest with `environment: "node"` — no DOM. Test pure functions and route handlers only; mock `fetch` via `vi.stubGlobal`. UI components are verified manually with `npm run dev`.
- Pages/components use inline `style={{…}}` with `var(--szz-*)` tokens (match `app/login/page.tsx`).
- Server-only ClientExec/Turnstile code lives in `lib/` and is never imported from client components.
- Run all tests with `npm test` (`vitest run`); lint with `npm run lint`.
- Copy verbatim from the design: register eyebrow `Get_started`, headline "Online this afternoon." / "Migration included.", subcopy "Create your account in under a minute. Pick a plan next — your dedicated account manager handles the setup and the move.", feature rows "Free, hands-off migration" (rocket), "30-day money-back guarantee" (badge-check), "A real account manager from day one" (user-round). Form heading "Create your account", subcopy "Start with your details — no card required yet.", button "Create account", fine print "By creating an account you agree to our Terms of Service and Privacy Policy."

---

### Task 1: Login emblem fix (keep emblem dark in light theme)

**Files:**
- Modify: `app/globals.css:400-405` (the `.szz-login-aside` rule)

**Interfaces:**
- Consumes: nothing.
- Produces: nothing (CSS-only). Benefits both `/login` and the `/register` page built later, which reuse `.szz-login-aside`.

CSS-only change — no automated test (Vitest is node-only). Verified manually by toggling the theme.

- [ ] **Step 1: Add dark surface tokens to the login aside**

In `app/globals.css`, change the `.szz-login-aside` rule (currently lines 400-405) to add two surface-token overrides alongside the existing text overrides:

```css
.szz-login-aside {
  --szz-bg-card: #111827;   /* keep terminal emblem chip dark in light theme */
  --szz-border: #1e3a5f;    /* keep emblem chip hairline dark in light theme */
  --szz-text-light: #cbd5e1;
  --szz-text-muted: #94a3b8;
  --szz-text-faint: #64748b;
  --szz-accent-blue: #60a5fa;
}
```

- [ ] **Step 2: Verify in the browser**

Run: `npm run dev`, open `/login`, toggle the site theme to light (the emblem chip in the top-left brand panel must stay dark navy with the red/yellow/green lights, not turn white). Then dark theme — unchanged.
Expected: emblem chip dark in both themes; the right-hand form panel still turns light in light theme.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "fix: keep login emblem dark in light theme"
```

---

### Task 2: Turnstile verification helper

**Files:**
- Create: `lib/turnstile.ts`
- Test: `lib/turnstile.test.ts`

**Interfaces:**
- Consumes: `process.env.TURNSTILE_SECRET_KEY`.
- Produces: `verifyTurnstile(token: string, ip?: string): Promise<boolean>` — resolves `true` when Cloudflare reports `success: true`, `false` otherwise; throws when siteverify is unreachable or non-2xx.

- [ ] **Step 1: Write the failing test**

Create `lib/turnstile.test.ts`:

```ts
import { describe, it, expect, vi, afterEach } from "vitest";
import { verifyTurnstile } from "@/lib/turnstile";

function mockSiteverify(json: unknown, ok = true) {
  return vi.fn().mockResolvedValue({ ok, status: ok ? 200 : 500, json: () => Promise.resolve(json) });
}

afterEach(() => vi.unstubAllGlobals());

describe("verifyTurnstile", () => {
  it("returns true when Cloudflare reports success", async () => {
    vi.stubGlobal("fetch", mockSiteverify({ success: true }));
    expect(await verifyTurnstile("token")).toBe(true);
  });
  it("returns false when Cloudflare reports failure", async () => {
    vi.stubGlobal("fetch", mockSiteverify({ success: false, "error-codes": ["invalid-input-response"] }));
    expect(await verifyTurnstile("bad")).toBe(false);
  });
  it("passes remoteip when provided", async () => {
    const fetchMock = mockSiteverify({ success: true });
    vi.stubGlobal("fetch", fetchMock);
    await verifyTurnstile("token", "203.0.113.7");
    const body = fetchMock.mock.calls[0][1].body as URLSearchParams;
    expect(body.get("remoteip")).toBe("203.0.113.7");
  });
  it("throws when siteverify is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    await expect(verifyTurnstile("token")).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- lib/turnstile.test.ts`
Expected: FAIL — cannot resolve `@/lib/turnstile`.

- [ ] **Step 3: Write minimal implementation**

Create `lib/turnstile.ts`:

```ts
/** Server-side Cloudflare Turnstile verification. Do not import from client components. */
const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const SECRET = process.env.TURNSTILE_SECRET_KEY ?? "";

/** Verify a Turnstile token with Cloudflare. Throws if siteverify is unreachable. */
export async function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
  const body = new URLSearchParams({ secret: SECRET, response: token });
  if (ip) body.set("remoteip", ip);
  const res = await fetch(SITEVERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Turnstile HTTP ${res.status}`);
  const json = (await res.json()) as { success?: boolean };
  return json.success === true;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- lib/turnstile.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/turnstile.ts lib/turnstile.test.ts
git commit -m "feat: add Cloudflare Turnstile server verification helper"
```

---

### Task 3: ClientExec account-creation helpers

**Files:**
- Modify: `lib/clientexec.ts` (append new exports near `buildSignupUrl` / `isLoginSuccess`)
- Test: `lib/clientexec.test.ts` (append new `describe` blocks)

**Interfaces:**
- Consumes: existing `CE_URL` const in `lib/clientexec.ts`.
- Produces:
  - `buildRegisterFormUrl(): string` — CE page that renders the external registration form.
  - `buildCreateAccountUrl(): string` — CE `createaccount` action endpoint.
  - `parseSessionHash(html: string): string | null` — extract the `sessionHash` hidden-field value.
  - `isRegisterSuccess(status: number, location: string | null, body: string): boolean` — success heuristic.
  - `createAccount(input: { firstName: string; lastName: string; email: string }): Promise<boolean>` — GETs a session + hash, POSTs the guest fields; throws if CE is unreachable.

- [ ] **Step 1: Write the failing tests**

Append to `lib/clientexec.test.ts`:

```ts
import {
  buildRegisterFormUrl,
  buildCreateAccountUrl,
  parseSessionHash,
  isRegisterSuccess,
  createAccount,
} from "@/lib/clientexec";

describe("buildRegisterFormUrl / buildCreateAccountUrl", () => {
  it("are absolute CE URLs targeting the home fuse", () => {
    expect(buildRegisterFormUrl()).toMatch(/^https?:\/\/.+/);
    expect(buildCreateAccountUrl()).toContain("fuse=home&action=createaccount");
  });
});

describe("parseSessionHash", () => {
  it("reads the sessionHash hidden field (value after name)", () => {
    const html = `<input type="hidden" name="sessionHash" value="abc123">`;
    expect(parseSessionHash(html)).toBe("abc123");
  });
  it("reads the sessionHash hidden field (value before name)", () => {
    const html = `<input value="zzz999" name="sessionHash" type="hidden">`;
    expect(parseSessionHash(html)).toBe("zzz999");
  });
  it("returns null when absent", () => {
    expect(parseSessionHash(`<form></form>`)).toBeNull();
  });
});

describe("isRegisterSuccess", () => {
  it("treats a redirect away from the register form as success", () => {
    expect(isRegisterSuccess(302, "https://account.serverizz.com/index.php?fuse=clients", "")).toBe(true);
  });
  it("treats a redirect back to the register form as failure", () => {
    expect(isRegisterSuccess(302, "https://account.serverizz.com/index.php?fuse=home&action=register", "")).toBe(false);
  });
  it("treats a 200 with a success marker as success", () => {
    expect(isRegisterSuccess(200, null, "Thanks! Please verify your email to continue.")).toBe(true);
  });
  it("treats a 200 with an error marker as failure", () => {
    expect(isRegisterSuccess(200, null, "That email is already registered.")).toBe(false);
  });
});

describe("createAccount", () => {
  it("GETs a session+hash then POSTs guest fields and returns true on success", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        headers: { get: (k: string) => (k.toLowerCase() === "set-cookie" ? "CESESSID=sess1; path=/" : null) },
        text: () => Promise.resolve(`<input type="hidden" name="sessionHash" value="h-42">`),
      })
      .mockResolvedValueOnce({
        status: 302,
        headers: { get: (k: string) => (k.toLowerCase() === "location" ? "https://account.serverizz.com/index.php?fuse=clients" : null) },
        text: () => Promise.resolve(""),
      });
    vi.stubGlobal("fetch", fetchMock);

    const ok = await createAccount({ firstName: "Jane", lastName: "Baker", email: "jane@b.com" });
    expect(ok).toBe(true);

    const postBody = fetchMock.mock.calls[1][1].body as URLSearchParams;
    expect(postBody.get("guestFirstName")).toBe("Jane");
    expect(postBody.get("guestLastName")).toBe("Baker");
    expect(postBody.get("guestEmail")).toBe("jane@b.com");
    expect(postBody.get("sessionHash")).toBe("h-42");
    expect(fetchMock.mock.calls[1][1].headers.Cookie).toBe("CESESSID=sess1");
  });

  it("rejects when CE is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    await expect(createAccount({ firstName: "A", lastName: "B", email: "a@b.com" })).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- lib/clientexec.test.ts`
Expected: FAIL — the new exports are not defined.

- [ ] **Step 3: Write the implementation**

Append to `lib/clientexec.ts` (after `buildSignupUrl`):

```ts
// ---- Account creation (external registration form) ----
// CE's external registration posts guestFirstName/guestLastName/guestEmail plus a
// hidden sessionHash (a CSRF token tied to a CE PHP session). We GET the form page
// for a session cookie + hash, then POST createaccount with that cookie.
// verify-against-live-instance: confirm the form page URL, the cookie name, the
// success signal, and the sessionHash field on account.serverizz.com.

export function buildRegisterFormUrl(): string {
  return `${CE_URL}/index.php?fuse=home&controller=order&action=register`;
}

export function buildCreateAccountUrl(): string {
  return `${CE_URL}/index.php?fuse=home&action=createaccount`;
}

/** Extract the sessionHash hidden-field value from CE's registration form HTML. */
export function parseSessionHash(html: string): string | null {
  const m =
    html.match(/name=["']sessionHash["'][^>]*\bvalue=["']([^"']*)["']/i) ??
    html.match(/\bvalue=["']([^"']*)["'][^>]*name=["']sessionHash["']/i);
  return m ? m[1] : null;
}

/**
 * Decide whether a createaccount POST succeeded, from the (redirect:"manual")
 * response. Heuristic — isolated for easy tuning against the live instance:
 *   - a 3xx redirect that does NOT go back to the register form → success
 *   - a 200 whose body shows a success marker (and no error marker) → success
 *   - everything else → failure
 */
export function isRegisterSuccess(status: number, location: string | null, body: string): boolean {
  const isRedirect = status >= 300 && status < 400;
  if (isRedirect) {
    const loc = (location ?? "").toLowerCase();
    return !!loc && !loc.includes("action=register");
  }
  if (/error|already (registered|exists)|invalid/i.test(body)) return false;
  return /success|verify your email|check your email|thank/i.test(body);
}

/** Create a ClientExec guest account from name + email. Throws if CE is unreachable. */
export async function createAccount(input: {
  firstName: string;
  lastName: string;
  email: string;
}): Promise<boolean> {
  const formRes = await fetch(buildRegisterFormUrl(), { cache: "no-store" });
  const setCookie = formRes.headers.get("set-cookie") ?? "";
  const cookie = setCookie.split(";")[0];
  const sessionHash = parseSessionHash(await formRes.text()) ?? "";

  const body = new URLSearchParams({
    guestFirstName: input.firstName,
    guestLastName: input.lastName,
    guestEmail: input.email,
    sessionHash,
  });
  const res = await fetch(buildCreateAccountUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body,
    redirect: "manual",
    cache: "no-store",
  });
  return isRegisterSuccess(res.status, res.headers.get("location"), await res.text());
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- lib/clientexec.test.ts`
Expected: PASS (existing tests plus the new `describe` blocks).

- [ ] **Step 5: Commit**

```bash
git add lib/clientexec.ts lib/clientexec.test.ts
git commit -m "feat: add ClientExec account-creation helpers"
```

---

### Task 4: `/api/register` route

**Files:**
- Create: `app/api/register/route.ts`
- Test: `app/api/register/route.test.ts`

**Interfaces:**
- Consumes: `createAccount` (Task 3), `verifyTurnstile` (Task 2).
- Produces: `POST(request: Request): Promise<Response>`. Request JSON: `{ firstName, lastName, email, turnstileToken }`. Responses: `400` invalid input / failed token, `502` Turnstile or CE unreachable, `200 { ok: true }` on success, `200 { ok: false, error }` when CE declines.

- [ ] **Step 1: Write the failing test**

Create `app/api/register/route.test.ts`:

```ts
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { POST } from "@/app/api/register/route";
import * as turnstile from "@/lib/turnstile";
import * as ce from "@/lib/clientexec";

function req(body: unknown) {
  return new Request("http://localhost/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const valid = { firstName: "Jane", lastName: "Baker", email: "jane@b.com", turnstileToken: "t" };

beforeEach(() => {
  vi.spyOn(turnstile, "verifyTurnstile").mockResolvedValue(true);
  vi.spyOn(ce, "createAccount").mockResolvedValue(true);
});
afterEach(() => vi.restoreAllMocks());

describe("POST /api/register", () => {
  it("400s when a name or email is missing", async () => {
    expect((await POST(req({ ...valid, firstName: "" }))).status).toBe(400);
  });
  it("400s on a malformed email", async () => {
    expect((await POST(req({ ...valid, email: "nope" }))).status).toBe(400);
  });
  it("400s when the Turnstile token is missing", async () => {
    expect((await POST(req({ ...valid, turnstileToken: "" }))).status).toBe(400);
  });
  it("400s when Turnstile verification fails", async () => {
    vi.spyOn(turnstile, "verifyTurnstile").mockResolvedValue(false);
    expect((await POST(req(valid))).status).toBe(400);
  });
  it("502s when Turnstile is unreachable", async () => {
    vi.spyOn(turnstile, "verifyTurnstile").mockRejectedValue(new Error("net"));
    expect((await POST(req(valid))).status).toBe(502);
  });
  it("502s when ClientExec is unreachable", async () => {
    vi.spyOn(ce, "createAccount").mockRejectedValue(new Error("net"));
    expect((await POST(req(valid))).status).toBe(502);
  });
  it("returns ok:false when CE declines", async () => {
    vi.spyOn(ce, "createAccount").mockResolvedValue(false);
    const json = await (await POST(req(valid))).json();
    expect(json.ok).toBe(false);
    expect(typeof json.error).toBe("string");
  });
  it("returns ok:true on success", async () => {
    const res = await POST(req(valid));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- app/api/register/route.test.ts`
Expected: FAIL — cannot resolve `@/app/api/register/route`.

- [ ] **Step 3: Write the implementation**

Create `app/api/register/route.ts`:

```ts
import { createAccount } from "@/lib/clientexec";
import { verifyTurnstile } from "@/lib/turnstile";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request): Promise<Response> {
  let firstName = "", lastName = "", email = "", turnstileToken = "";
  try {
    const body = await request.json();
    firstName = typeof body?.firstName === "string" ? body.firstName.trim() : "";
    lastName = typeof body?.lastName === "string" ? body.lastName.trim() : "";
    email = typeof body?.email === "string" ? body.email.trim() : "";
    turnstileToken = typeof body?.turnstileToken === "string" ? body.turnstileToken : "";
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!firstName || !lastName || !email) {
    return Response.json({ error: "First name, last name and email are required." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (!turnstileToken) {
    return Response.json({ error: "Please complete the verification." }, { status: 400 });
  }

  const ip = request.headers.get("CF-Connecting-IP") ?? undefined;
  try {
    const human = await verifyTurnstile(turnstileToken, ip);
    if (!human) {
      return Response.json({ error: "Verification failed. Please try again." }, { status: 400 });
    }
  } catch {
    return Response.json(
      { error: "Verification is temporarily unavailable. Please try again." },
      { status: 502 }
    );
  }

  try {
    const created = await createAccount({ firstName, lastName, email });
    if (created) return Response.json({ ok: true });
    return Response.json({ ok: false, error: "We couldn't create your account. It may already exist." });
  } catch {
    return Response.json(
      { error: "Sign-up is temporarily unavailable. Please try again." },
      { status: 502 }
    );
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- app/api/register/route.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add app/api/register/route.ts app/api/register/route.test.ts
git commit -m "feat: add /api/register route (Turnstile + ClientExec)"
```

---

### Task 5: Turnstile widget client component

**Files:**
- Create: `components/szz/turnstile-widget.tsx`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `TurnstileWidget({ siteKey, onVerify, onExpire })` — `siteKey: string`, `onVerify: (token: string) => void`, `onExpire: () => void`. Renders Cloudflare's managed widget and reports the token.

No automated test (requires a browser + external script; Vitest is node-only). Verified manually in Task 7.

- [ ] **Step 1: Write the component**

Create `components/szz/turnstile-widget.tsx`:

```tsx
"use client";

import * as React from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      remove: (id: string) => void;
    };
    onloadTurnstileCallback?: () => void;
  }
}

const SCRIPT_BASE = "https://challenges.cloudflare.com/turnstile/v0/api.js";
const SCRIPT_SRC = `${SCRIPT_BASE}?onload=onloadTurnstileCallback&render=explicit`;

/**
 * Renders the real Cloudflare Turnstile managed widget and reports the token via
 * onVerify. Loads the Turnstile script once; cleans up its widget on unmount.
 */
export function TurnstileWidget({
  siteKey,
  onVerify,
  onExpire,
}: {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpire: () => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const widgetId = React.useRef<string | null>(null);
  // Keep the latest callbacks without re-rendering the widget.
  const onVerifyRef = React.useRef(onVerify);
  const onExpireRef = React.useRef(onExpire);
  React.useEffect(() => {
    onVerifyRef.current = onVerify;
    onExpireRef.current = onExpire;
  });

  React.useEffect(() => {
    function render() {
      if (!ref.current || !window.turnstile || widgetId.current) return;
      widgetId.current = window.turnstile.render(ref.current, {
        sitekey: siteKey,
        theme: "dark",
        callback: (token: string) => onVerifyRef.current(token),
        "expired-callback": () => onExpireRef.current(),
        "error-callback": () => onExpireRef.current(),
      });
    }

    if (window.turnstile) {
      render();
    } else {
      window.onloadTurnstileCallback = render;
      if (!document.querySelector(`script[src^="${SCRIPT_BASE}"]`)) {
        const s = document.createElement("script");
        s.src = SCRIPT_SRC;
        s.async = true;
        s.defer = true;
        document.head.appendChild(s);
      }
    }

    return () => {
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, [siteKey]);

  return <div ref={ref} style={{ minHeight: 65 }} />;
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/szz/turnstile-widget.tsx
git commit -m "feat: add Cloudflare Turnstile widget component"
```

---

### Task 6: RegisterForm client component

**Files:**
- Create: `components/szz/register-form.tsx`

**Interfaces:**
- Consumes: `TurnstileWidget` (Task 5); `Input`, `Button` UI primitives; `POST /api/register` (Task 4).
- Produces: `RegisterForm({ turnstileSiteKey, loginHref })` — `turnstileSiteKey: string`, `loginHref: string`.

No automated test (node-only Vitest). Verified manually in Task 7.

- [ ] **Step 1: Write the component**

Create `components/szz/register-form.tsx`:

```tsx
"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TurnstileWidget } from "@/components/szz/turnstile-widget";

type Status = "idle" | "submitting" | "error" | "done";

export function RegisterForm({
  turnstileSiteKey,
  loginHref,
}: {
  turnstileSiteKey: string;
  loginHref: string;
}) {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [token, setToken] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<Status>("idle");
  const [error, setError] = React.useState<string | null>(null);

  const onVerify = React.useCallback((t: string) => setToken(t), []);
  const onExpire = React.useCallback(() => setToken(null), []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fn = firstName.trim();
    const ln = lastName.trim();
    const em = email.trim();
    if (!fn || !ln || !em) {
      setStatus("error");
      setError("Enter your first name, last name and email.");
      return;
    }
    if (!token) {
      setStatus("error");
      setError("Please complete the verification.");
      return;
    }
    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: fn, lastName: ln, email: em, turnstileToken: token }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.ok) {
        setStatus("done");
        return;
      }
      setStatus("error");
      setError(typeof data?.error === "string" ? data.error : "We couldn't create your account.");
    } catch {
      setStatus("error");
      setError("Something went wrong. Please try again.");
    }
  }

  const submitting = status === "submitting";

  if (status === "done") {
    return (
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <span style={{ width: 44, height: 44, borderRadius: 999, background: "var(--szz-green)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 22, color: "#06240f" }}>✓</span>
          </span>
          <h2 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: 28, fontWeight: 700, letterSpacing: "-.5px", color: "var(--szz-text-primary)" }}>
            Account created
          </h2>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "var(--szz-text-muted)" }}>
            Check your email to confirm your address and finish setting up your account.
          </p>
          <p style={{ marginTop: 8, fontSize: 13, color: "var(--szz-text-muted)" }}>
            Ready to continue?{" "}
            <a href={loginHref} style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: "var(--szz-accent-blue)" }}>
              Sign in
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", maxWidth: 400 }}>
      <div style={{ marginBottom: 30, display: "flex", flexDirection: "column", gap: 8 }}>
        <h2 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: 28, fontWeight: 700, letterSpacing: "-.5px", color: "var(--szz-text-primary)" }}>
          Create your account
        </h2>
        <p style={{ margin: 0, fontSize: 14, color: "var(--szz-text-muted)" }}>
          Start with your details — no card required yet.
        </p>
      </div>

      {submitting && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, border: "1px solid var(--szz-border)", borderRadius: 8, background: "var(--szz-bg-deep)", padding: "11px 14px" }}>
          <span style={{ width: 7, height: 7, borderRadius: 999, background: "var(--szz-green)" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--szz-text-light)" }}>
            Creating your account…
          </span>
        </div>
      )}

      {status === "error" && error && (
        <div role="alert" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, border: "1px solid var(--szz-red)", borderRadius: 8, background: "var(--szz-bg-deep)", padding: "11px 14px" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--szz-red)" }}>{error}</span>
        </div>
      )}

      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Input label="First name" name="firstName" autoComplete="given-name" placeholder="Jane" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          <Input label="Last name" name="lastName" autoComplete="family-name" placeholder="Baker" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </div>
        <Input label="Email" type="email" name="email" autoComplete="email" placeholder="you@yourbusiness.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <TurnstileWidget siteKey={turnstileSiteKey} onVerify={onVerify} onExpire={onExpire} />
        <Button type="submit" variant="primary" size="lg" disabled={submitting || !token}>
          {submitting ? "Creating account…" : "Create account"}
        </Button>
        <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: "var(--szz-text-faint)" }}>
          By creating an account you agree to our Terms of Service and Privacy Policy.
        </p>
      </form>

      <p style={{ marginTop: 24, textAlign: "center", fontSize: 13, color: "var(--szz-text-muted)" }}>
        Already have an account?{" "}
        <a href={loginHref} style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: "var(--szz-accent-blue)" }}>
          Sign in
        </a>
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/szz/register-form.tsx
git commit -m "feat: add RegisterForm component"
```

---

### Task 7: `/register` page + env example

**Files:**
- Create: `app/register/page.tsx`
- Modify: `.env.example`

**Interfaces:**
- Consumes: `RegisterForm` (Task 6), `TerminalLogo`, `SectionEyebrow`; `process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY`.
- Produces: the public `/register` route (indexable).

- [ ] **Step 1: Add Turnstile env vars to `.env.example`**

Append to `.env.example`:

```
# Cloudflare Turnstile (registration form bot protection).
# Dev uses Cloudflare's documented always-pass test keys; set real keys per environment.
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

- [ ] **Step 2: Write the page**

Create `app/register/page.tsx` (mirrors `app/login/page.tsx`; brand-aside copy from the design):

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Rocket, BadgeCheck, UserRound, type LucideIcon } from "lucide-react";
import { TerminalLogo } from "@/components/szz/terminal-logo";
import { SectionEyebrow } from "@/components/szz/section-eyebrow";
import { RegisterForm } from "@/components/szz/register-form";

export const metadata: Metadata = {
  title: "Get started",
  description: "Create your SERVERIZZ account — migration included.",
  alternates: { canonical: "/register" },
};

// Cloudflare's always-pass test site key — overridden by env in real environments.
const TEST_SITE_KEY = "1x00000000000000000000AA";

const features: { Icon: LucideIcon; color: string; text: string }[] = [
  { Icon: Rocket, color: "var(--szz-accent-blue)", text: "Free, hands-off migration" },
  { Icon: BadgeCheck, color: "var(--szz-accent-blue)", text: "30-day money-back guarantee" },
  { Icon: UserRound, color: "var(--szz-green)", text: "A real account manager from day one" },
];

export default function RegisterPage() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? TEST_SITE_KEY;
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
          <SectionEyebrow>Get_started</SectionEyebrow>
          <h1 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: 40, fontWeight: 700, lineHeight: 1.1, letterSpacing: "-1.5px", color: "#fff" }}>
            Online this afternoon. <br />Migration included.
          </h1>
          <p style={{ margin: 0, maxWidth: 420, fontSize: 16, lineHeight: 1.6, color: "var(--szz-text-muted)" }}>
            Create your account in under a minute. Pick a plan next — your dedicated account manager handles the setup and the move.
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
        <RegisterForm turnstileSiteKey={siteKey} loginHref="/login" />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify the lucide icon names exist**

Run: `node -e "const L=require('lucide-react'); console.log(['Rocket','BadgeCheck','UserRound'].map(n=>n+':'+(n in L)))"`
Expected: `[ 'Rocket:true', 'BadgeCheck:true', 'UserRound:true' ]`. If any is `false`, pick the nearest valid Lucide name and update both the import and the `features` array.

- [ ] **Step 4: Verify the page in the browser**

Run: `npm run dev`, open `/register`.
Expected: brand panel on the left (dark, with the emblem, `Get_started` eyebrow, headline and three feature rows), the form on the right with First/Last/Email, a live Turnstile widget (the test key auto-passes and shows "Success!"), and an enabled "Create account" button only after the widget passes. Submitting shows "Creating your account…" then the "Account created" confirmation.

- [ ] **Step 5: Run the full test suite + lint**

Run: `npm test && npm run lint`
Expected: all tests pass, no lint errors.

- [ ] **Step 6: Commit**

```bash
git add app/register/page.tsx .env.example
git commit -m "feat: add /register page with Turnstile-gated account creation"
```

---

### Task 8: Wire the public entry points to `/register`

**Files:**
- Modify: `components/szz/site-nav.tsx` (the "Get Started" button, around line 150)
- Modify: `app/login/page.tsx:66` (the `ceSignupUrl` prop)

**Interfaces:**
- Consumes: the `/register` route (Task 7).
- Produces: nothing new.

This is the "when live" link swap. Do it last, once `/register` works end to end.

- [ ] **Step 1: Point the nav Get Started button at `/register`**

In `components/szz/site-nav.tsx`, replace the external order-page anchor inside the primary Button with an internal `Link` (`Link` is already imported):

```tsx
          <Button asChild variant="primary" size="sm">
            <Link href="/register">Get Started</Link>
          </Button>
```

- [ ] **Step 2: Point the login page's "Create an account" link at `/register`**

In `app/login/page.tsx`, change the `ceSignupUrl` prop passed to `LoginForm` (line 66) from `buildSignupUrl()` to the internal route:

```tsx
          ceSignupUrl="/register"
```

Then remove the now-unused `buildSignupUrl` from the import on line 7 (keep `buildLoginUrl` and `buildForgotPasswordUrl`):

```tsx
import { buildLoginUrl, buildForgotPasswordUrl } from "@/lib/clientexec";
```

- [ ] **Step 3: Verify links + type-check**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors (confirms `buildSignupUrl` has no other consumers). Then `npm run dev`: the nav "Get Started" button and the login "Create an account" link both navigate to `/register`.

- [ ] **Step 4: Commit**

```bash
git add components/szz/site-nav.tsx app/login/page.tsx
git commit -m "feat: point Get Started + Create account links at /register"
```

---

## Notes for the implementer

- **`verify-against-live-instance`:** Task 3's `createAccount`, `parseSessionHash`, and `isRegisterSuccess` encode best-guess ClientExec behavior. Before/while testing against `account.serverizz.com`, confirm: the registration form page URL (`buildRegisterFormUrl`), the session cookie name, the `sessionHash` field, and the success signal. Adjust only those three isolated functions — their unit tests pin the contract, not the live specifics.
- **`buildSignupUrl`** becomes unused after Task 8. Its export and test can stay (harmless) or be removed in Task 8; the plan keeps them to avoid touching unrelated tests. If you remove it, also drop its case from `lib/clientexec.test.ts`.
- The `_redirects`/deploy config is unchanged; `/register` is a standard App Router page.
- **Task 4 test mocking:** the route test spies on the `@/lib/turnstile` and `@/lib/clientexec` module exports with `vi.spyOn`. Vitest supports spying on ESM named exports. If a "cannot redefine property" error appears, fall back to `vi.mock("@/lib/turnstile", () => ({ verifyTurnstile: vi.fn() }))` and `vi.mock("@/lib/clientexec", () => ({ createAccount: vi.fn() }))` at the top of the test, then set return values per case with `vi.mocked(...)`.
```
