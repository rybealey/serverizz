import { describe, it, expect } from "vitest";
import {
  PAGE_SEO,
  ROUTES,
  seoFor,
  pageMetadataFor,
  serviceJsonLd,
  localBusinessJsonLd,
  AREA_SERVED,
} from "@/lib/seo";

describe("PAGE_SEO registry", () => {
  it("every entry has the required non-empty fields", () => {
    for (const p of PAGE_SEO) {
      expect(p.path).toMatch(/^\//);
      expect(p.name.length).toBeGreaterThan(0);
      expect(p.title.length).toBeGreaterThan(0);
      expect(p.description.length).toBeGreaterThan(0);
      expect(p.targetKeyword.length).toBeGreaterThan(0);
      expect(Array.isArray(p.cluster)).toBe(true);
      if (p.jsonLd === "Service") {
        expect(p.serviceType && p.serviceType.length).toBeTruthy();
      }
    }
  });

  it("commercial titles carry their target keyword signal", () => {
    expect(seoFor("/hosting").title).toMatch(/CloudLinux/i);
    expect(seoFor("/hosting").title).toMatch(/Imunify360/i);
    expect(seoFor("/hosting/reseller").title).toMatch(/Reseller/i);
    expect(seoFor("/hosting/wordpress").title).toMatch(/WordPress/i);
  });

  it("home description mentions managed cPanel hosting and Austin", () => {
    expect(seoFor("/").description).toMatch(/cPanel/i);
    expect(seoFor("/").description).toMatch(/Austin/i);
  });
});

describe("seoFor", () => {
  it("returns the entry for a known path", () => {
    expect(seoFor("/why").path).toBe("/why");
  });
  it("throws for an unknown path", () => {
    expect(() => seoFor("/nope")).toThrow();
  });
});

describe("ROUTES", () => {
  it("includes every PAGE_SEO path plus the legal docs", () => {
    const paths = ROUTES.map((r) => r.path);
    for (const p of PAGE_SEO) expect(paths).toContain(p.path);
    expect(paths).toContain("/about"); // regression: /about was missing from the old sitemap
    expect(paths.some((p) => p.startsWith("/legal/"))).toBe(true);
  });
});

describe("pageMetadataFor", () => {
  it("sets a self-referencing canonical and the registry title", () => {
    const meta = pageMetadataFor("/hosting");
    expect(meta.alternates?.canonical).toBe("/hosting");
    expect(meta.title).toBe("Secure cPanel Hosting on CloudLinux + Imunify360");
  });
  it("omits the title on the home page so the root default applies", () => {
    const meta = pageMetadataFor("/");
    expect(meta.title).toBeUndefined();
    expect(meta.description).toMatch(/cPanel/i);
  });
  it("keeps a non-empty OG/Twitter title on the home page (no empty og:title)", () => {
    const meta = pageMetadataFor("/");
    const brand = seoFor("/").title;
    expect((meta.openGraph as Record<string, unknown>).title).toBe(brand);
    expect((meta.twitter as Record<string, unknown>).title).toBe(brand);
  });
});

describe("serviceJsonLd", () => {
  it("builds a Service node for a hosting product page", () => {
    const data = serviceJsonLd("/hosting");
    expect(data["@type"]).toBe("Service");
    expect(data.serviceType).toBe("Web hosting");
    expect((data.provider as Record<string, unknown>).name).toBeDefined();
    expect(data.areaServed).toEqual(expect.arrayContaining(["Latin America"]));
  });
  it("builds a Service node for the data centers page", () => {
    expect(seoFor("/data-centers").jsonLd).toBe("Service");
    const data = serviceJsonLd("/data-centers");
    expect(data["@type"]).toBe("Service");
    expect(data.serviceType).toBe("Global infrastructure");
  });
  it("throws for a non-Service page", () => {
    expect(() => serviceJsonLd("/why")).toThrow();
  });
});

describe("localBusinessJsonLd", () => {
  it("uses the real Austin NAP and serves Austin", () => {
    const data = localBusinessJsonLd();
    expect(data["@type"]).toBe("LocalBusiness");
    expect((data.address as Record<string, unknown>).addressLocality).toBe("Austin");
    expect(data.areaServed).toEqual(expect.arrayContaining(["Austin"]));
  });
});

describe("AREA_SERVED", () => {
  it("covers Austin, Texas, US and Latin America", () => {
    expect([...AREA_SERVED]).toEqual(
      expect.arrayContaining(["Austin", "Texas", "United States", "Latin America"]),
    );
  });
});
