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
