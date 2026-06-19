/** Server-side ClientExec (billing) access. Do not import from client components. */
import { TLDS, type DomainResult, type TldPrice } from "@/lib/domains";

const CE_URL = process.env.CLIENTEXEC_URL ?? "https://account.serverizz.com";
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
