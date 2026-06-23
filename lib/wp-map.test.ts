import { describe, it, expect } from "vitest";
import {
  readingMinutes,
  formatDate,
  categoryColorVar,
  mapPostSummary,
  mapPost,
  mapCategory,
  type RawWpPost,
  type RawWpCategory,
} from "@/lib/wp-map";

const RAW_POST: RawWpPost = {
  id: 7,
  slug: "managed-hosting-saves-time",
  date: "2026-06-18T09:00:00",
  modified: "2026-06-19T10:00:00",
  title: { rendered: "How Managed Hosting Saves Time" },
  excerpt: { rendered: "<p>Updates, backups &amp; patches.</p>" },
  content: { rendered: "<h2>Cost</h2><p>" + "word ".repeat(399) + "</p>" }, // 399 + "Cost" = 400 words → 2 min
  categories: [3],
  _embedded: {
    author: [{ name: "Ada", slug: "ada", description: "Founder", avatar_urls: { "96": "https://x/a.png" } }],
    "wp:featuredmedia": [{ source_url: "https://newsroom.serverizz.com/f.jpg", alt_text: "cover", media_details: { width: 1200, height: 630 } }],
    "wp:term": [[{ id: 3, slug: "small-business", name: "Small Business", taxonomy: "category" }]],
  },
};

const RAW_CATEGORY: RawWpCategory = { id: 3, slug: "small-business", name: "Small Business", count: 4, description: "Biz" };

describe("readingMinutes", () => {
  it("computes ceil(words/200), min 1", () => {
    expect(readingMinutes("<p>" + "w ".repeat(400) + "</p>")).toBe(2);
    expect(readingMinutes("<p>short</p>")).toBe(1);
    expect(readingMinutes("")).toBe(1);
  });
});

describe("formatDate", () => {
  it("formats ISO as 'Mon D, YYYY'", () => {
    expect(formatDate("2026-06-18T09:00:00")).toBe("Jun 18, 2026");
  });
});

describe("categoryColorVar", () => {
  it("maps known slugs to brand tokens", () => {
    expect(categoryColorVar("small-business")).toBe("var(--szz-green)");
    expect(categoryColorVar("security-speed")).toBe("var(--szz-yellow)");
    expect(categoryColorVar("wordpress")).toBe("var(--szz-accent-blue)");
  });
  it("falls back to accent blue for unknown slugs", () => {
    expect(categoryColorVar("nope")).toBe("var(--szz-accent-blue)");
  });
});

describe("mapPostSummary", () => {
  it("maps core fields, category, featured image, derived fields", () => {
    const p = mapPostSummary(RAW_POST);
    expect(p).toMatchObject({
      id: 7,
      slug: "managed-hosting-saves-time",
      title: "How Managed Hosting Saves Time",
      excerpt: "Updates, backups & patches.",
      dateLabel: "Jun 18, 2026",
      readingMinutes: 2,
      category: { id: 3, slug: "small-business", name: "Small Business", colorVar: "var(--szz-green)" },
      featuredImage: { url: "https://newsroom.serverizz.com/f.jpg", alt: "cover", width: 1200, height: 630 },
    });
  });
  it("tolerates missing featured media and category", () => {
    const bare: RawWpPost = { ...RAW_POST, categories: [], _embedded: { author: RAW_POST._embedded!.author } };
    const p = mapPostSummary(bare);
    expect(p.featuredImage).toBeNull();
    expect(p.category).toBeNull();
  });
});

describe("mapPost", () => {
  it("adds rendered content, toc, and author", () => {
    const p = mapPost(RAW_POST);
    expect(p.author).toEqual({ name: "Ada", slug: "ada", description: "Founder", avatarUrl: "https://x/a.png" });
    expect(p.contentHtml).toContain('id="cost"');
    expect(p.toc).toEqual([{ id: "cost", label: "Cost", level: 2 }]);
  });
});

describe("mapCategory", () => {
  it("maps a category and assigns a color", () => {
    expect(mapCategory(RAW_CATEGORY)).toEqual({
      id: 3, slug: "small-business", name: "Small Business", count: 4, description: "Biz", colorVar: "var(--szz-green)",
    });
  });
});
