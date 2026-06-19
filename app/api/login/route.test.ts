import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { POST } from "@/app/api/login/route";
import * as turnstile from "@/lib/turnstile";
import * as ce from "@/lib/clientexec";

function req(body: unknown) {
  return new Request("http://localhost/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const valid = { email: "a@b.com", password: "pw", turnstileToken: "t" };

beforeEach(() => {
  vi.spyOn(turnstile, "verifyTurnstile").mockResolvedValue(true);
  vi.spyOn(ce, "verifyCredentials").mockResolvedValue(true);
});
afterEach(() => vi.restoreAllMocks());

describe("POST /api/login", () => {
  it("400s when email or password is missing", async () => {
    const res = await POST(req({ email: "a@b.com", turnstileToken: "t" }));
    expect(res.status).toBe(400);
  });

  it("400s on a malformed JSON body", async () => {
    const res = await POST(
      new Request("http://localhost/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "not-json",
      })
    );
    expect(res.status).toBe(400);
  });

  it("400s when the Turnstile token is missing", async () => {
    const res = await POST(req({ email: "a@b.com", password: "pw" }));
    expect(res.status).toBe(400);
  });

  it("400s when Turnstile verification fails", async () => {
    vi.spyOn(turnstile, "verifyTurnstile").mockResolvedValue(false);
    const res = await POST(req(valid));
    expect(res.status).toBe(400);
  });

  it("502s when Turnstile verification is unreachable", async () => {
    vi.spyOn(turnstile, "verifyTurnstile").mockRejectedValue(new Error("net"));
    const res = await POST(req(valid));
    expect(res.status).toBe(502);
  });

  it("returns ok:true on valid credentials", async () => {
    const res = await POST(req(valid));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("returns ok:false on invalid credentials", async () => {
    vi.spyOn(ce, "verifyCredentials").mockResolvedValue(false);
    const res = await POST(req(valid));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(typeof json.error).toBe("string");
  });

  it("does not check credentials until Turnstile passes", async () => {
    vi.spyOn(turnstile, "verifyTurnstile").mockResolvedValue(false);
    const credSpy = vi.spyOn(ce, "verifyCredentials").mockResolvedValue(true);
    await POST(req(valid));
    expect(credSpy).not.toHaveBeenCalled();
  });

  it("502s when ClientExec is unreachable", async () => {
    vi.spyOn(ce, "verifyCredentials").mockRejectedValue(new Error("network"));
    const res = await POST(req(valid));
    expect(res.status).toBe(502);
  });
});
