/** Server-side Tree App impact-summary access. Do not import from client components. */

/** Normalized impact figures used by the footer badges. */
export type ImpactSummary = {
  /** trees + unbilled.trees */
  trees: number;
  carbonCredits: number;
  /** carbon_dioxide_absorbed, in tonnes */
  co2Tonnes: number;
  /** land_restored, in square metres */
  landSqMeters: number;
  workdays: number;
};

type SummaryResponse = {
  trees?: number;
  carbon_credits?: number;
  carbon_dioxide_absorbed?: number;
  land_restored?: number;
  workdays_created?: number;
  unbilled?: { trees?: number; carbon_credits?: number };
};

/**
 * Shown when the upstream summary is unavailable (missing key, network error, bad
 * payload) so the footer badges always render. Mirrors the design canvas placeholders;
 * bump these to the latest known totals if the integration is offline for a while.
 */
export const FALLBACK_IMPACT: ImpactSummary = {
  trees: 116,
  carbonCredits: 48,
  co2Tonnes: 12.4,
  landSqMeters: 9000,
  workdays: 73,
};

const SUMMARY_URL = "https://api.thetreeapp.org/v1.1/impacts/summary";
const TIMEOUT_MS = 3000;

/** Coerce an unknown JSON value to a non-negative finite number, defaulting to 0. */
function num(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : 0;
}

/** Normalize a summary payload, or null if it is not a usable object. */
export function parseImpact(data: SummaryResponse | null | undefined): ImpactSummary | null {
  if (!data || typeof data !== "object") return null;
  return {
    trees: num(data.trees) + num(data.unbilled?.trees),
    carbonCredits: num(data.carbon_credits),
    // The API reports CO2 in kilograms; the badge displays tonnes.
    co2Tonnes: num(data.carbon_dioxide_absorbed) / 1000,
    landSqMeters: num(data.land_restored),
    workdays: num(data.workdays_created),
  };
}

/** Whole-number count with thousands separators, e.g. 9000 -> "9,000". */
export function formatCount(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

/** Tonnes with up to one decimal and a "t" suffix, e.g. 12.4 -> "12.4t". */
export function formatTonnes(n: number): string {
  return `${n.toLocaleString("en-US", { maximumFractionDigits: 1 })}t`;
}

/** Square metres with thousands separators, e.g. 9000 -> "9,000 m²". */
export function formatSqMeters(n: number): string {
  return `${formatCount(n)} m²`;
}

/**
 * The Tree App impact summary, falling back to {@link FALLBACK_IMPACT} whenever the
 * upstream call is unreachable so the badges never show blanks.
 */
export async function getImpactSummary(): Promise<ImpactSummary> {
  const key = process.env.TREEAPP_API_KEY;
  if (!key) return FALLBACK_IMPACT;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(SUMMARY_URL, {
      signal: controller.signal,
      headers: { Accept: "application/json", "X-Treeapp-Api-Key": key },
      // Share one upstream call across visitors for ~1h; the figures change slowly.
      next: { revalidate: 3600 },
    });
    if (!res.ok) return FALLBACK_IMPACT;
    const data = (await res.json()) as SummaryResponse;
    return parseImpact(data) ?? FALLBACK_IMPACT;
  } catch {
    return FALLBACK_IMPACT;
  } finally {
    clearTimeout(timer);
  }
}
