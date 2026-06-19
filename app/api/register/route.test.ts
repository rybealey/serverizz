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
