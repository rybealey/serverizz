import { describe, it, expect, vi, afterEach } from "vitest";
import {
  parseImpact,
  getImpactSummary,
  formatCount,
  formatTonnes,
  formatSqMeters,
  FALLBACK_IMPACT,
} from "@/lib/treeapp";

const FULL = {
  trees: 100,
  carbon_credits: 48,
  carbon_dioxide_absorbed: 12400, // kilograms -> 12.4 tonnes
  land_restored: 9000,
  workdays_created: 73,
  unbilled: { trees: 16, carbon_credits: 2 },
};

describe("parseImpact", () => {
  it("sums trees and unbilled.trees", () => {
    expect(parseImpact(FULL)?.trees).toBe(116);
    expect(parseImpact({ trees: 5 })?.trees).toBe(5);
  });

  it("maps the remaining fields directly", () => {
    expect(parseImpact(FULL)).toEqual({
      trees: 116,
      carbonCredits: 48,
      co2Tonnes: 12.4,
      landSqMeters: 9000,
      workdays: 73,
    });
  });

  it("coerces missing, negative, or non-numeric fields to 0", () => {
    expect(parseImpact({})).toEqual({
      trees: 0,
      carbonCredits: 0,
      co2Tonnes: 0,
      landSqMeters: 0,
      workdays: 0,
    });
    expect(parseImpact({ trees: -3, land_restored: NaN })?.trees).toBe(0);
    expect(parseImpact({ land_restored: "9000" as unknown as number })?.landSqMeters).toBe(0);
  });

  it("returns null for a non-object payload", () => {
    expect(parseImpact(null)).toBeNull();
    expect(parseImpact(undefined)).toBeNull();
  });
});

describe("formatters", () => {
  it("formats counts with thousands separators", () => {
    expect(formatCount(9000)).toBe("9,000");
    expect(formatCount(73)).toBe("73");
    expect(formatCount(12.6)).toBe("13");
  });

  it("formats tonnes with up to one decimal and a t suffix", () => {
    expect(formatTonnes(12.4)).toBe("12.4t");
    expect(formatTonnes(12)).toBe("12t");
    expect(formatTonnes(1234.56)).toBe("1,234.6t");
  });

  it("formats square metres with a unit suffix", () => {
    expect(formatSqMeters(9000)).toBe("9,000 m²");
    expect(formatSqMeters(0)).toBe("0 m²");
  });
});

describe("getImpactSummary", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("falls back when no API key is configured, without calling fetch", async () => {
    vi.stubEnv("TREEAPP_API_KEY", "");
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    expect(await getImpactSummary()).toEqual(FALLBACK_IMPACT);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("sends the API key header and returns the normalized summary", async () => {
    vi.stubEnv("TREEAPP_API_KEY", "secret-key");
    const fetchSpy = vi.fn(async () => new Response(JSON.stringify(FULL), { status: 200 }));
    vi.stubGlobal("fetch", fetchSpy);

    expect(await getImpactSummary()).toEqual({
      trees: 116,
      carbonCredits: 48,
      co2Tonnes: 12.4,
      landSqMeters: 9000,
      workdays: 73,
    });
    const calls = fetchSpy.mock.calls as unknown as Array<[string, RequestInit]>;
    const headers = calls[0][1].headers as Record<string, string>;
    expect(headers["X-Treeapp-Api-Key"]).toBe("secret-key");
  });

  it("falls back on a non-ok response", async () => {
    vi.stubEnv("TREEAPP_API_KEY", "secret-key");
    vi.stubGlobal("fetch", vi.fn(async () => new Response("nope", { status: 500 })));
    expect(await getImpactSummary()).toEqual(FALLBACK_IMPACT);
  });

  it("falls back when fetch throws", async () => {
    vi.stubEnv("TREEAPP_API_KEY", "secret-key");
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("network"); }));
    expect(await getImpactSummary()).toEqual(FALLBACK_IMPACT);
  });
});
