import { describe, it, expect, vi, afterEach } from "vitest";
import { POST } from "@/app/api/login/route";

function req(body: unknown) {
  return new Request("http://localhost/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function mockFetch(opts: { status: number; location?: string | null }) {
  return vi.fn().mockResolvedValue({
    status: opts.status,
    headers: { get: (k: string) => (k.toLowerCase() === "location" ? opts.location ?? null : null) },
  });
}

afterEach(() => vi.unstubAllGlobals());

describe("POST /api/login", () => {
  it("400s when email or password is missing", async () => {
    const res = await POST(req({ email: "a@b.com" }));
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

  it("returns ok:true on valid credentials", async () => {
    vi.stubGlobal("fetch", mockFetch({ status: 302, location: "https://account.serverizz.com/index.php?fuse=clients" }));
    const res = await POST(req({ email: "a@b.com", password: "pw" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("returns ok:false on invalid credentials", async () => {
    vi.stubGlobal("fetch", mockFetch({ status: 200 }));
    const res = await POST(req({ email: "a@b.com", password: "bad" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(typeof json.error).toBe("string");
  });

  it("502s when ClientExec is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    const res = await POST(req({ email: "a@b.com", password: "pw" }));
    expect(res.status).toBe(502);
  });
});
