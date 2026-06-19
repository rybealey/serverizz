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
