import { describe, it, expect, vi, afterEach } from "vitest";
import { getPosts, getPost, getCategories, getCategory } from "@/lib/wordpress";

const POST = {
  id: 7, slug: "p1", date: "2026-06-18T09:00:00", modified: "2026-06-18T09:00:00",
  title: { rendered: "P1" }, excerpt: { rendered: "<p>x</p>" }, content: { rendered: "<p>hi</p>" },
  categories: [3],
  _embedded: { author: [{ name: "Ada", slug: "ada" }], "wp:term": [[{ id: 3, slug: "wordpress", name: "WordPress", taxonomy: "category" }]] },
};
const CATEGORY = { id: 3, slug: "wordpress", name: "WordPress", count: 2, description: "" };

function mockJson(json: unknown, headers: Record<string, string> = {}, ok = true) {
  return vi.fn().mockResolvedValue({
    ok, status: ok ? 200 : 500,
    headers: { get: (k: string) => headers[k.toLowerCase()] ?? null },
    json: () => Promise.resolve(json),
  });
}

afterEach(() => vi.unstubAllGlobals());

describe("getPosts", () => {
  it("requests _embed and per_page/page and parses pagination headers", async () => {
    const f = mockJson([POST], { "x-wp-total": "12", "x-wp-totalpages": "2" });
    vi.stubGlobal("fetch", f);
    const page = await getPosts({ page: 2, perPage: 6 });
    const url = String(f.mock.calls[0][0]);
    expect(url).toContain("/posts");
    expect(url).toContain("_embed=1");
    expect(url).toContain("per_page=6");
    expect(url).toContain("page=2");
    expect(page.total).toBe(12);
    expect(page.totalPages).toBe(2);
    expect(page.posts[0].slug).toBe("p1");
  });

  it("adds a categories filter when categoryId given", async () => {
    const f = mockJson([POST], { "x-wp-totalpages": "1" });
    vi.stubGlobal("fetch", f);
    await getPosts({ categoryId: 3 });
    expect(String(f.mock.calls[0][0])).toContain("categories=3");
  });

  it("throws when WordPress is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    await expect(getPosts()).rejects.toThrow();
  });

  it("throws on HTTP error status (e.g. 500)", async () => {
    vi.stubGlobal("fetch", mockJson([POST], {}, false));
    await expect(getPosts()).rejects.toThrow();
  });

  it("omits the categories param when no categoryId is given", async () => {
    const f = mockJson([POST], { "x-wp-totalpages": "1" });
    vi.stubGlobal("fetch", f);
    await getPosts({ perPage: 6 });
    expect(String(f.mock.calls[0][0])).not.toContain("categories");
  });
});

describe("getPost", () => {
  it("queries by slug with _embed and returns the first match", async () => {
    const f = mockJson([POST]);
    vi.stubGlobal("fetch", f);
    const post = await getPost("p1");
    expect(String(f.mock.calls[0][0])).toContain("slug=p1");
    expect(post?.slug).toBe("p1");
    expect(post?.contentHtml).toContain("hi");
  });
  it("returns null when no post matches", async () => {
    vi.stubGlobal("fetch", mockJson([]));
    expect(await getPost("missing")).toBeNull();
  });
});

describe("getCategories / getCategory", () => {
  it("getCategories maps all", async () => {
    vi.stubGlobal("fetch", mockJson([CATEGORY]));
    const cats = await getCategories();
    expect(cats[0]).toMatchObject({ slug: "wordpress", colorVar: "var(--szz-accent-blue)" });
  });
  it("getCategory returns first match or null", async () => {
    const f = mockJson([CATEGORY]);
    vi.stubGlobal("fetch", f);
    const c = await getCategory("wordpress");
    expect(String(f.mock.calls[0][0])).toContain("slug=wordpress");
    expect(c?.id).toBe(3);
  });
});
