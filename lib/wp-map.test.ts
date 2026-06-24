import { describe, it, expect } from "vitest";
import {
  readingMinutes,
  formatDate,
  categoryColorVar,
  decodeEntities,
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

describe("decodeEntities", () => {
  it("decodes named entities", () => {
    expect(decodeEntities("News &amp; Updates")).toBe("News & Updates");
    expect(decodeEntities("&ldquo;quoted&rdquo; &mdash; done")).toBe("“quoted” — done");
    expect(decodeEntities("it&#039;s &amp; that&rsquo;s")).toBe("it's & that’s");
  });
  it("decodes numeric (decimal and hex) entities, including WP's &#038; ampersand", () => {
    expect(decodeEntities("Domains &#038; Email")).toBe("Domains & Email");
    expect(decodeEntities("caf&#233;")).toBe("café");
    expect(decodeEntities("&#x27;hex&#x27;")).toBe("'hex'");
  });
  it("leaves unknown or malformed entities untouched", () => {
    expect(decodeEntities("AT&T plain")).toBe("AT&T plain");
    expect(decodeEntities("&notarealentity;")).toBe("&notarealentity;");
  });
});

describe("readingMinutes", () => {
  it("computes ceil(words/200), min 1", () => {
    expect(readingMinutes("<p>" + "w ".repeat(400) + "</p>")).toBe(2);
    expect(readingMinutes("<p>short</p>")).toBe(1);
    expect(readingMinutes("")).toBe(1);
  });

  it("covers 200-word boundary: exactly 200 → 1, 201 → 2", () => {
    expect(readingMinutes("w ".repeat(200))).toBe(1);
    expect(readingMinutes("w ".repeat(201))).toBe(2);
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
  it("covers hosting-101 and domains-email slugs", () => {
    expect(categoryColorVar("hosting-101")).toBe("var(--szz-accent-blue)");
    expect(categoryColorVar("domains-email")).toBe("var(--szz-green)");
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
  it("decodes HTML entities in the category name", () => {
    const withEntity: RawWpPost = {
      ...RAW_POST,
      _embedded: {
        ...RAW_POST._embedded,
        "wp:term": [[{ id: 9, slug: "news-and-updates", name: "News &amp; Updates", taxonomy: "category" }]],
      },
    };
    expect(mapPostSummary(withEntity).category?.name).toBe("News & Updates");
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

  it("decodes HTML entities in the author name", () => {
    const withEntity: RawWpPost = {
      ...RAW_POST,
      _embedded: { ...RAW_POST._embedded, author: [{ name: "Ben &amp; Co.", slug: "ben", description: "", avatar_urls: {} }] },
    };
    expect(mapPost(withEntity).author?.name).toBe("Ben & Co.");
  });

  it("handles null author when _embedded has no author key", () => {
    const noAuthor: RawWpPost = {
      ...RAW_POST,
      _embedded: {
        "wp:featuredmedia": RAW_POST._embedded!["wp:featuredmedia"],
        "wp:term": RAW_POST._embedded!["wp:term"],
      },
    };
    const p = mapPost(noAuthor);
    expect(p.author).toBeNull();
    expect(p.contentHtml).toBeTruthy();
    expect(p.toc).toBeTruthy();
  });
});

describe("mapCategory", () => {
  it("maps a category and assigns a color", () => {
    expect(mapCategory(RAW_CATEGORY)).toEqual({
      id: 3, slug: "small-business", name: "Small Business", count: 4, description: "Biz", colorVar: "var(--szz-green)",
    });
  });

  it("strips HTML and decodes entities in description", () => {
    const catWithHtml: RawWpCategory = { id: 1, slug: "test", name: "Test", count: 2, description: "<p>Biz &amp; stuff</p>" };
    const mapped = mapCategory(catWithHtml);
    expect(mapped.description).toBe("Biz & stuff");
  });

  it("decodes HTML entities in the category name", () => {
    const catWithEntity: RawWpCategory = { id: 1, slug: "news-and-updates", name: "News &amp; Updates", count: 2, description: "" };
    expect(mapCategory(catWithEntity).name).toBe("News & Updates");
  });
});
