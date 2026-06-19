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
