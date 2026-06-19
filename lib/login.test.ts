import { describe, it, expect } from "vitest";
import { isLoggedOut } from "@/lib/login";

describe("isLoggedOut", () => {
  it("is true when lo=true", () => {
    expect(isLoggedOut({ lo: "true" })).toBe(true);
  });

  it("is false when lo is missing", () => {
    expect(isLoggedOut({})).toBe(false);
  });

  it("is false for any other lo value", () => {
    expect(isLoggedOut({ lo: "false" })).toBe(false);
    expect(isLoggedOut({ lo: "1" })).toBe(false);
    expect(isLoggedOut({ lo: "" })).toBe(false);
  });

  it("handles a repeated param (string[]) by matching the first 'true'", () => {
    expect(isLoggedOut({ lo: ["true", "false"] })).toBe(true);
    expect(isLoggedOut({ lo: ["false", "true"] })).toBe(false);
  });
});
