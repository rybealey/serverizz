import { describe, it, expect, vi, afterEach } from "vitest";
import { buildOrderUrl, oneYearPrice, checkDomain, getTldPricing, parseKbTopics, KB_FALLBACK_TOPICS, getPopularKbTopics, parseTicketTypes, getSupportTicketTypes, SUPPORT_TICKET_TYPES_FALLBACK, isTicketSuccess, createSupportTicket } from "@/lib/clientexec";

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
    expect(isLoginSuccess(302, "https://go.serverizz.com/index.php?fuse=clients")).toBe(true);
  });
  it("treats a 200 (login form re-rendered) as failure", () => {
    expect(isLoginSuccess(200, null)).toBe(false);
  });
  it("treats a redirect back to the login screen as failure", () => {
    expect(isLoginSuccess(302, "https://go.serverizz.com/index.php?fuse=admin&action=Login")).toBe(false);
  });
  it("treats a redirect with no location as failure", () => {
    expect(isLoginSuccess(302, null)).toBe(false);
  });
});

describe("verifyCredentials", () => {
  it("returns true when CE redirects to the dashboard", async () => {
    vi.stubGlobal("fetch", mockFetchResponse({ status: 302, location: "https://go.serverizz.com/index.php?fuse=clients" }));
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
  it("reads the sessionHash from a JS variable (ticket form)", () => {
    const html = `<script>var sessionHash = "deafb7a2";</script>`;
    expect(parseSessionHash(html)).toBe("deafb7a2");
  });
  it("returns null when absent", () => {
    expect(parseSessionHash(`<form></form>`)).toBeNull();
  });
});

describe("isRegisterSuccess", () => {
  it("treats a redirect away from the register form as success", () => {
    expect(isRegisterSuccess(302, "https://go.serverizz.com/index.php?fuse=clients", "")).toBe(true);
  });
  it("treats a redirect back to the register form as failure", () => {
    expect(isRegisterSuccess(302, "https://go.serverizz.com/index.php?fuse=home&action=register", "")).toBe(false);
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
        headers: { get: (k: string) => (k.toLowerCase() === "location" ? "https://go.serverizz.com/index.php?fuse=clients" : null) },
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

const KB_HTML = `
<div class="col"><div class="knowledge-base-box">
  <h4><a href="index.php?fuse=knowledgebase&controller=articles&view=main&categoryId=9">Managing Domains in cPanel (10)</a></h4>
  <ul class="knowledge-box-ul cm-height">
    <li><a href="https://go.serverizz.com/index.php?fuse=knowledgebase&controller=articles&view=article&articleId=22">Types of Domain Names</a></li>
    <li><a href="https://go.serverizz.com/index.php?fuse=knowledgebase&controller=articles&view=article&articleId=23">Connecting to SERVERIZZ</a></li>
  </ul>
</div></div>
<div class="col"><div class="knowledge-base-box">
  <h4><a href="index.php?fuse=knowledgebase&controller=articles&view=main&categoryId=8">Managing Email in cPanel (12)</a></h4>
  <ul class="knowledge-box-ul cm-height">
    <li><a href="https://go.serverizz.com/index.php?fuse=knowledgebase&controller=articles&view=article&articleId=10">Where to Find Email Tools</a></li>
    <li><a href="https://go.serverizz.com/index.php?fuse=knowledgebase&controller=articles&view=article&articleId=11">Creating an Email Account</a></li>
  </ul>
</div></div>
<div class="col"><div class="knowledge-base-box">
  <h4><a href="index.php?fuse=knowledgebase&controller=articles&view=main&categoryId=12">WordPress (19)</a></h4>
  <ul class="knowledge-box-ul cm-height">
    <li><a href="https://go.serverizz.com/index.php?fuse=knowledgebase&controller=articles&view=article&articleId=42">Opening WP Toolkit</a></li>
    <li><a href="https://go.serverizz.com/index.php?fuse=knowledgebase&controller=articles&view=article&articleId=43">Installing WordPress</a></li>
  </ul>
</div></div>
<div class="col"><div class="knowledge-base-box">
  <h4><a href="index.php?fuse=knowledgebase&controller=articles&view=main&categoryId=7">Files &amp; Websites (54)</a></h4>
  <ul class="knowledge-box-ul cm-height">
    <li><a href="https://go.serverizz.com/index.php?fuse=knowledgebase&controller=articles&view=article&articleId=1">Understanding the File Structure</a></li>
    <li><a href="https://go.serverizz.com/index.php?fuse=knowledgebase&controller=articles&view=article&articleId=2">File Manager</a></li>
  </ul>
</div></div>`;

describe("parseKbTopics", () => {
  it("extracts the lead article of each category, in order", () => {
    const topics = parseKbTopics(KB_HTML);
    expect(topics).toEqual([
      { title: "Types of Domain Names", href: "https://go.serverizz.com/index.php?fuse=knowledgebase&controller=articles&view=article&articleId=22" },
      { title: "Where to Find Email Tools", href: "https://go.serverizz.com/index.php?fuse=knowledgebase&controller=articles&view=article&articleId=10" },
      { title: "Opening WP Toolkit", href: "https://go.serverizz.com/index.php?fuse=knowledgebase&controller=articles&view=article&articleId=42" },
      { title: "Understanding the File Structure", href: "https://go.serverizz.com/index.php?fuse=knowledgebase&controller=articles&view=article&articleId=1" },
    ]);
  });

  it("returns an empty array for garbage or empty HTML", () => {
    expect(parseKbTopics("")).toEqual([]);
    expect(parseKbTopics("<html><body>no kb here</body></html>")).toEqual([]);
  });

  it("decodes HTML entities in titles", () => {
    const html = `<div class="knowledge-base-box"><ul><li><a href="https://go.serverizz.com/index.php?fuse=knowledgebase&controller=articles&view=article&articleId=99">Backups &amp; Restores</a></li></ul></div>`;
    expect(parseKbTopics(html)).toEqual([
      { title: "Backups & Restores", href: "https://go.serverizz.com/index.php?fuse=knowledgebase&controller=articles&view=article&articleId=99" },
    ]);
  });
});

describe("KB_FALLBACK_TOPICS", () => {
  it("lists the four category leads as absolute article URLs", () => {
    expect(KB_FALLBACK_TOPICS).toHaveLength(4);
    for (const t of KB_FALLBACK_TOPICS) {
      expect(t.title.length).toBeGreaterThan(0);
      expect(t.href).toMatch(/^https:\/\/go\.serverizz\.com\/index\.php\?fuse=knowledgebase.*view=article&articleId=\d+$/);
    }
    expect(KB_FALLBACK_TOPICS[2]).toEqual({
      title: "Opening WP Toolkit",
      href: "https://go.serverizz.com/index.php?fuse=knowledgebase&controller=articles&view=article&articleId=42",
    });
  });
});

function mockFetchHtml(html: string, ok = true) {
  return vi.fn().mockResolvedValue({ ok, status: ok ? 200 : 500, text: () => Promise.resolve(html) });
}

describe("getPopularKbTopics", () => {
  it("returns parsed topics when the KB responds", async () => {
    vi.stubGlobal("fetch", mockFetchHtml(KB_HTML));
    const topics = await getPopularKbTopics();
    expect(topics).toHaveLength(4);
    expect(topics[0]).toEqual({
      title: "Types of Domain Names",
      href: "https://go.serverizz.com/index.php?fuse=knowledgebase&controller=articles&view=article&articleId=22",
    });
  });

  it("falls back when the response has no parseable topics", async () => {
    vi.stubGlobal("fetch", mockFetchHtml("<html>nothing here</html>"));
    expect(await getPopularKbTopics()).toEqual(KB_FALLBACK_TOPICS);
  });

  it("falls back on a non-ok response", async () => {
    vi.stubGlobal("fetch", mockFetchHtml("", false));
    expect(await getPopularKbTopics()).toEqual(KB_FALLBACK_TOPICS);
  });

  it("falls back when fetch rejects", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    expect(await getPopularKbTopics()).toEqual(KB_FALLBACK_TOPICS);
  });
});

const TICKET_FORM_HTML = `
<form id="support-ticket-form">
  <select name="ticket-type" class="drop-ticket-type form-control searchSelect2">
    <option value="0" >Select below ...</option>
    <option value="3" >Plan &amp; Pricing Questions</option>
    <option value="4" >Pre-sales Technical Question</option>
    <option value="13" >Network Abuse</option>
  </select>
</form>`;

describe("parseTicketTypes", () => {
  it("parses options, excludes the placeholder, decodes entities", () => {
    const types = parseTicketTypes(TICKET_FORM_HTML);
    expect(types).toEqual([
      { value: "3", label: "Plan & Pricing Questions" },
      { value: "4", label: "Pre-sales Technical Question" },
      { value: "13", label: "Network Abuse" },
    ]);
  });

  it("returns [] when the select is absent", () => {
    expect(parseTicketTypes("<form>no select here</form>")).toEqual([]);
  });
});

describe("getSupportTicketTypes", () => {
  it("returns parsed types on success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 200, text: () => Promise.resolve(TICKET_FORM_HTML) }));
    const types = await getSupportTicketTypes();
    expect(types.map((t) => t.value)).toEqual(["3", "4", "13"]);
  });

  it("falls back when the response is not ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500, text: () => Promise.resolve("") }));
    expect(await getSupportTicketTypes()).toEqual(SUPPORT_TICKET_TYPES_FALLBACK);
  });

  it("falls back when parsing yields nothing", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 200, text: () => Promise.resolve("<p>nope</p>") }));
    expect(await getSupportTicketTypes()).toEqual(SUPPORT_TICKET_TYPES_FALLBACK);
  });

  it("falls back when fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    expect(await getSupportTicketTypes()).toEqual(SUPPORT_TICKET_TYPES_FALLBACK);
  });
});

describe("isTicketSuccess", () => {
  it("treats a redirect away from the ticket view as success", () => {
    expect(isTicketSuccess(302, "index.php?fuse=support&view=ticketsubmitted")).toBe(true);
  });
  it("treats the bare index.php redirect (live success) as success", () => {
    expect(isTicketSuccess(302, "index.php")).toBe(true);
  });
  it("treats a bounce back to the submit-ticket view as failure", () => {
    expect(isTicketSuccess(302, "index.php?fuse=support&controller=ticket&view=submitticket")).toBe(false);
  });
  it("treats a logout/login bounce as failure", () => {
    expect(isTicketSuccess(302, "index.php?fuse=admin&action=Logout")).toBe(false);
  });
  it("treats a 200 with an error marker as failure", () => {
    expect(isTicketSuccess(200, null)).toBe(false);
  });
});

describe("createSupportTicket", () => {
  it("GETs for a cookie then POSTs multipart, and maps success", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, status: 200, headers: { get: () => "CESESSION=abc; path=/" }, text: () => Promise.resolve(`<script>var sessionHash = "h-77";</script>`) })
      .mockResolvedValueOnce({ ok: false, status: 302, headers: { get: (h: string) => (h.toLowerCase() === "location" ? "index.php" : null) }, text: () => Promise.resolve("") });
    vi.stubGlobal("fetch", fetchMock);

    const ok = await createSupportTicket({ name: "Jane Baker", email: "jane@x.com", subject: "Hi", message: "Help", ticketType: "4" });

    expect(ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [url, init] = fetchMock.mock.calls[1];
    expect(String(url)).toContain("action=saveticket");
    expect(init.method).toBe("POST");
    expect(init.body).toBeInstanceOf(FormData);
    expect((init.body as FormData).get("userid")).toBe("0");
    expect((init.body as FormData).get("guestName")).toBe("Jane Baker");
    expect((init.body as FormData).get("guestEmail")).toBe("jane@x.com");
    expect((init.body as FormData).get("subject")).toBe("Hi");
    expect((init.body as FormData).get("message")).toBe("Help");
    expect((init.body as FormData).get("ticket-type")).toBe("4");
    expect((init.body as FormData).get("sessionHash")).toBe("h-77");
    expect(init.headers.Cookie).toBe("CESESSION=abc");
  });

  it("returns false when CE bounces the POST to logout", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, status: 200, headers: { get: () => "" }, text: () => Promise.resolve("<form></form>") })
      .mockResolvedValueOnce({ ok: false, status: 302, headers: { get: (h: string) => (h.toLowerCase() === "location" ? "index.php?fuse=admin&action=Logout" : null) }, text: () => Promise.resolve("") });
    vi.stubGlobal("fetch", fetchMock);
    expect(await createSupportTicket({ name: "A", email: "a@x.com", subject: "S", message: "M", ticketType: "3" })).toBe(false);
  });

  it("rejects when the GET resolves with a non-ok status", async () => {
    // The GET returns a non-ok response; the function must throw before attempting the POST.
    // The second mock return would succeed if the guard were absent, ensuring this test
    // specifically validates the guard and not a downstream failure.
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 500, headers: { get: () => null }, text: () => Promise.resolve("") })
      .mockResolvedValueOnce({ ok: false, status: 302, headers: { get: (h: string) => (h.toLowerCase() === "location" ? "index.php?fuse=support&view=ticketsubmitted" : null) }, text: () => Promise.resolve("") });
    vi.stubGlobal("fetch", fetchMock);
    await expect(createSupportTicket({ name: "A", email: "a@x.com", subject: "S", message: "M", ticketType: "3" })).rejects.toThrow();
  });

  it("rejects when the GET fetch itself rejects (network error)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    await expect(createSupportTicket({ name: "A", email: "a@x.com", subject: "S", message: "M", ticketType: "3" })).rejects.toThrow();
  });
});
