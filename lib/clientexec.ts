/** Server-side ClientExec (billing) access. Do not import from client components. */
import { TLDS, type DomainResult, type TldPrice } from "@/lib/domains";

const CE_URL = process.env.CLIENTEXEC_URL ?? "https://go.serverizz.com";
const GROUP_ID = process.env.CLIENTEXEC_DOMAIN_GROUP_ID ?? "2";
const ONE_YEAR_PERIOD_ID = "12";
/** Long, unlikely-to-be-registered label used only to read a TLD's list price. */
const PRICE_PROBE_LABEL = "availability-probe-7x9q2z";

type CePrice = { period_id?: string; formated_price?: string };
type CeResponse = {
  error?: unknown;
  search_results?: {
    status?: number;
    available_options?: Array<{ price?: CePrice[] }>;
  };
};

export function buildOrderUrl(d: { name: string; tld: string }): string {
  const u = new URL(`${CE_URL}/order.php`);
  u.searchParams.set("step", "1");
  u.searchParams.set("productGroup", GROUP_ID);
  u.searchParams.set("domainName", d.name);
  u.searchParams.set("tld", d.tld);
  return u.toString();
}

export function oneYearPrice(json: CeResponse): string | null {
  const prices = json.search_results?.available_options?.[0]?.price;
  if (!prices?.length) return null;
  const oneYear = prices.find((p) => String(p.period_id) === ONE_YEAR_PERIOD_ID) ?? prices[0];
  return oneYear?.formated_price ?? null;
}

async function rawCheck(name: string, tld: string, init: RequestInit): Promise<CeResponse> {
  const body = new URLSearchParams({ name, tld, group: GROUP_ID });
  const res = await fetch(`${CE_URL}/index.php?fuse=clients&action=checkdomain`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body,
    ...init,
  });
  if (!res.ok) throw new Error(`ClientExec HTTP ${res.status}`);
  return res.json() as Promise<CeResponse>;
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

export function buildLoginUrl(): string {
  return `${CE_URL}/index.php?fuse=admin&action=Login`;
}

// NOTE: verify-against-live-instance — confirm these paths on go.serverizz.com.
export function buildForgotPasswordUrl(): string {
  return `${CE_URL}/index.php?fuse=clients&action=forgotpassword`;
}

export function buildSignupUrl(): string {
  return `${CE_URL}/order.php`;
}

export type KbTopic = { title: string; href: string };

const KB_MAIN_URL = `${CE_URL}/index.php?fuse=knowledgebase&controller=articles&view=main`;

/** Real KB category-lead links, used when the live KB fetch/parse fails. */
export const KB_FALLBACK_TOPICS: KbTopic[] = [
  { title: "Types of Domain Names", href: `${CE_URL}/index.php?fuse=knowledgebase&controller=articles&view=article&articleId=22` },
  { title: "Where to Find Email Tools", href: `${CE_URL}/index.php?fuse=knowledgebase&controller=articles&view=article&articleId=10` },
  { title: "Opening WP Toolkit", href: `${CE_URL}/index.php?fuse=knowledgebase&controller=articles&view=article&articleId=42` },
  { title: "Understanding the File Structure", href: `${CE_URL}/index.php?fuse=knowledgebase&controller=articles&view=article&articleId=1` },
];

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'");
}

const ARTICLE_ANCHOR = /<a\s+href="([^"]*view=article&(?:amp;)?articleId=\d+[^"]*)"[^>]*>\s*([^<]+?)\s*<\/a>/i;

/** First article link inside each `knowledge-base-box`, in document order. */
export function parseKbTopics(html: string): KbTopic[] {
  const boxes = html.split("knowledge-base-box").slice(1);
  const topics: KbTopic[] = [];
  for (const box of boxes) {
    const m = box.match(ARTICLE_ANCHOR);
    if (!m) continue;
    const href = decodeEntities(m[1]);
    const title = decodeEntities(m[2]).trim();
    if (title && href) topics.push({ title, href });
  }
  return topics;
}

/** Live KB category-lead topics for the support page; falls back on any failure. */
export async function getPopularKbTopics(): Promise<KbTopic[]> {
  try {
    const res = await fetch(KB_MAIN_URL, { next: { revalidate: 86400 } } as RequestInit);
    if (!res.ok) return KB_FALLBACK_TOPICS;
    const topics = parseKbTopics(await res.text());
    return topics.length ? topics : KB_FALLBACK_TOPICS;
  } catch {
    return KB_FALLBACK_TOPICS;
  }
}

// ---- Support ticket types + guest ticket submission ----
// CE's guest ticket form posts userid=0 + guestName/guestEmail/subject/message/
// ticket-type as multipart/form-data. We live-fetch the type list (with a fallback)
// and submit via a two-step GET (session cookie) → POST, like createAccount.
// verify-against-live-instance: confirm the success signal on go.serverizz.com,
// and that Turnstile is disabled on saveticket (else POSTs bounce to logout).

export type TicketType = { value: string; label: string };

const SUBMIT_TICKET_URL = `${CE_URL}/index.php?fuse=support&controller=ticket&view=submitticket`;
const SAVE_TICKET_URL = `${CE_URL}/index.php?fuse=support&controller=ticket&action=saveticket`;
const TICKET_VALID_EXTNS = "png,jpg,jpeg,gif,zip,txt,log";

export function buildSubmitTicketUrl(): string {
  return SUBMIT_TICKET_URL;
}

/** Public ticket types, used when the live fetch/parse fails. */
export const SUPPORT_TICKET_TYPES_FALLBACK: TicketType[] = [
  { value: "3", label: "Plan & Pricing Questions" },
  { value: "4", label: "Pre-sales Technical Question" },
  { value: "5", label: "Migration Inquiry" },
  { value: "6", label: "Partners & Bulk Purchases" },
  { value: "7", label: "Custom / Enterprise Requests" },
  { value: "8", label: "Spam / Outbound Mail" },
  { value: "9", label: "Malware / Compromised Account" },
  { value: "10", label: "Phishing Report" },
  { value: "11", label: "DMCA / Copyright Complaint" },
  { value: "12", label: "Terms of Service Violation" },
  { value: "13", label: "Network Abuse" },
];

const TICKET_SELECT = /<select[^>]*name=["']ticket-type["'][^>]*>([\s\S]*?)<\/select>/i;
const TICKET_OPTION = /<option\s+value=["'](\d+)["'][^>]*>([\s\S]*?)<\/option>/gi;

/** Parse CE's `ticket-type` <select>, excluding the value="0" placeholder. */
export function parseTicketTypes(html: string): TicketType[] {
  const block = html.match(TICKET_SELECT);
  if (!block) return [];
  const types: TicketType[] = [];
  for (const m of block[1].matchAll(TICKET_OPTION)) {
    const value = m[1];
    if (value === "0") continue;
    const label = decodeEntities(m[2]).trim();
    if (label) types.push({ value, label });
  }
  return types;
}

/** Live public ticket types for the support form; falls back on any failure. */
export async function getSupportTicketTypes(): Promise<TicketType[]> {
  try {
    const res = await fetch(SUBMIT_TICKET_URL, { next: { revalidate: 86400 } } as RequestInit);
    if (!res.ok) return SUPPORT_TICKET_TYPES_FALLBACK;
    const types = parseTicketTypes(await res.text());
    return types.length ? types : SUPPORT_TICKET_TYPES_FALLBACK;
  } catch {
    return SUPPORT_TICKET_TYPES_FALLBACK;
  }
}

/**
 * Decide whether a saveticket POST succeeded, from the (redirect:"manual")
 * response. Heuristic — isolated for tuning against the live instance:
 *   - a 3xx redirect that does NOT go back to the submit-ticket view and is
 *     NOT the logout/login bounce → success
 *   - a non-3xx response (200/4xx/5xx) → failure
 */
export function isTicketSuccess(status: number, location: string | null): boolean {
  const isRedirect = status >= 300 && status < 400;
  if (isRedirect) {
    const loc = (location ?? "").toLowerCase();
    if (!loc) return false;
    if (loc.includes("view=submitticket")) return false;
    if (loc.includes("action=logout") || loc.includes("action=login") || loc.includes("/login")) return false;
    return true;
  }
  return false;
}

/** Submit a ClientExec guest support ticket. Throws if CE is unreachable. */
export async function createSupportTicket(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
  ticketType: string;
}): Promise<boolean> {
  const formRes = await fetch(SUBMIT_TICKET_URL, { cache: "no-store" });
  if (!formRes.ok) throw new Error(`ClientExec HTTP ${formRes.status}`);
  const setCookie = formRes.headers.get("set-cookie") ?? "";
  const cookie = setCookie.split(";")[0];
  // saveticket validates a per-session sessionHash CSRF token; without it CE
  // bounces the POST to logout. On the ticket page it lives only in a JS var.
  const sessionHash = parseSessionHash(await formRes.text()) ?? "";

  const body = new FormData();
  body.set("userid", "0");
  body.set("guestName", input.name);
  body.set("guestEmail", input.email);
  body.set("subject", input.subject);
  body.set("message", input.message);
  body.set("ticket-type", input.ticketType);
  body.set("validExtns", TICKET_VALID_EXTNS);
  body.set("sessionHash", sessionHash);

  const res = await fetch(SAVE_TICKET_URL, {
    method: "POST",
    // No Content-Type: fetch sets the multipart boundary for FormData.
    headers: { ...(cookie ? { Cookie: cookie } : {}) },
    body,
    redirect: "manual",
    cache: "no-store",
  });
  return isTicketSuccess(res.status, res.headers.get("location"));
}

// ---- Account creation (external registration form) ----
// CE's external registration posts guestFirstName/guestLastName/guestEmail plus a
// hidden sessionHash (a CSRF token tied to a CE PHP session). We GET the form page
// for a session cookie + hash, then POST createaccount with that cookie.
// verify-against-live-instance: confirm the form page URL, the cookie name, the
// success signal, and the sessionHash field on go.serverizz.com.

export function buildRegisterFormUrl(): string {
  return `${CE_URL}/index.php?fuse=home&controller=order&action=register`;
}

export function buildCreateAccountUrl(): string {
  return `${CE_URL}/index.php?fuse=home&action=createaccount`;
}

/**
 * Extract the sessionHash CSRF token from a CE page. The registration form
 * carries it as a hidden input; the guest ticket form carries it only as a JS
 * variable (`sessionHash = "..."`). Try the hidden-field forms first, then the
 * JS-variable form.
 */
export function parseSessionHash(html: string): string | null {
  const m =
    html.match(/name=["']sessionHash["'][^>]*\bvalue=["']([^"']*)["']/i) ??
    html.match(/\bvalue=["']([^"']*)["'][^>]*name=["']sessionHash["']/i) ??
    html.match(/sessionHash\s*=\s*["']([^"']+)["']/i);
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
