import { describe, it, expect, vi, afterEach } from "vitest";
import { GET } from "@/app/api/maintenance-status/route";

afterEach(() => vi.unstubAllGlobals());

describe("GET /api/maintenance-status", () => {
  it("returns active:true with the title during a maintenance window", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ maintenanceList: [{ title: "DB upgrade", status: "under-maintenance" }] }),
      }),
    );
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ active: true, title: "DB upgrade" });
  });

  it("returns active:false when the upstream fetch fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ active: false, title: null });
  });
});
