import type { Metadata } from "next";
import { LEGAL_DOCS } from "./legal";

/**
 * Central SEO configuration for SERVERIZZ.
 *
 * Two complementary layers power the site's SEO:
 *  1. Next.js native Metadata API (titles, descriptions, canonical, Open Graph,
 *     Twitter cards, robots) — configured here and in each `page.tsx`.
 *  2. next-seo's JSON-LD components (Organization, WebSite, BreadcrumbList) —
 *     next-seo v7 in the App Router is *structured-data only*; meta tags come
 *     from the Metadata API per the library's own guidance.
 *
 * Keep all hard-coded site facts in this file so sitemap, JSON-LD and metadata
 * never drift apart.
 */

export const SITE_URL = "https://www.serverizz.com";
export const SITE_NAME = "SERVERIZZ";
export const SITE_TAGLINE = "Managed hosting for small business";
export const SITE_LOCALE = "en_US";

export const SITE_DESCRIPTION =
  "Claim your domain, then launch a fast, fully-managed website on it — email, SSL and daily backups included. Free migration on every plan.";

/** Absolute URL for the site's social-share / Open Graph image. */
export const OG_IMAGE_URL = `${SITE_URL}/opengraph-image`;

/** Real-world organization facts (sourced from the site footer / support page). */
export const ORG = {
  legalName: "Rizz Enterprises, LLC",
  email: "howdy@serverizz.com",
  supportEmail: "help@serverizz.com",
  address: {
    streetAddress: "1606 Headway Circle, Suite 9317",
    addressLocality: "Austin",
    addressRegion: "TX",
    postalCode: "78754",
    addressCountry: "US",
  },
} as const;

/** Geographic areas served — reused by Service and LocalBusiness JSON-LD. */
export const AREA_SERVED = ["Austin", "Texas", "United States", "Latin America"] as const;

export type JsonLdKind = "Service" | null;

export interface PageSeo {
  path: string;
  /** Breadcrumb + sitemap name. */
  name: string;
  /** <title> text. Templated with "· SERVERIZZ" unless inheritTitle is set. */
  title: string;
  /** Home only: omit the page title so the root layout's default brand title stands. */
  inheritTitle?: boolean;
  description: string;
  /** Documentation that drives copy/titles — NOT emitted as a meta tag. */
  targetKeyword: string;
  /** Supporting keywords — documentation only. */
  cluster: string[];
  jsonLd: JsonLdKind;
  /** Required when jsonLd === "Service". */
  serviceType?: string;
  changeFrequency: NonNullable<
    import("next").MetadataRoute.Sitemap[number]["changeFrequency"]
  >;
  priority: number;
}

/**
 * Single source of truth for per-page SEO. Adding a page = add an entry here and
 * call `pageMetadataFor(path)` (plus `serviceJsonLd(path)` for product pages).
 * Order is the sitemap order.
 */
export const PAGE_SEO: PageSeo[] = [
  {
    path: "/",
    name: "Home",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    inheritTitle: true,
    description:
      "Managed cPanel hosting from a real human. Claim your domain, then launch a fast, secure website — email, SSL and daily backups included. Austin-based, free migration on every plan.",
    targetKeyword: "managed cPanel hosting",
    cluster: ["small business hosting", "managed hosting Austin"],
    jsonLd: null,
    changeFrequency: "weekly",
    priority: 1,
  },
  {
    path: "/hosting",
    name: "Hosting plans",
    title: "Secure cPanel Hosting on CloudLinux + Imunify360",
    description:
      "Fully-managed cPanel hosting hardened with CloudLinux and Imunify360 — PHP Selector, CageFS isolation, Node.js and Python apps, daily backups and a dedicated account manager. Free migration.",
    targetKeyword: "secure cPanel hosting",
    cluster: [
      "CloudLinux shared hosting",
      "Imunify360 hosting",
      "PHP Selector hosting",
      "Node.js Python cPanel hosting",
      "low-density shared hosting",
    ],
    jsonLd: "Service",
    serviceType: "Web hosting",
    changeFrequency: "monthly",
    priority: 0.9,
  },
  {
    path: "/hosting/wordpress",
    name: "Managed WordPress hosting",
    title: "Managed WordPress Hosting on CloudLinux",
    description:
      "Managed WordPress hosting on a hardened CloudLinux and Imunify360 stack — automatic core and plugin updates, malware scanning, caching and daily backups, all handled for you.",
    targetKeyword: "managed WordPress hosting",
    cluster: ["WordPress hosting CloudLinux", "secure WordPress hosting"],
    jsonLd: "Service",
    serviceType: "WordPress hosting",
    changeFrequency: "monthly",
    priority: 0.9,
  },
  {
    path: "/hosting/reseller",
    name: "Reseller hosting",
    title: "cPanel Reseller Hosting — Managed & White-Label",
    description:
      "Managed, white-label cPanel reseller hosting on dedicated single-node resources. Spin up WHM accounts for your clients with free migration and $0 setup — they never see SERVERIZZ.",
    targetKeyword: "cPanel reseller hosting",
    cluster: ["managed reseller hosting", "white-label cPanel hosting", "reseller VPS cPanel"],
    jsonLd: "Service",
    serviceType: "Reseller web hosting",
    changeFrequency: "monthly",
    priority: 0.85,
  },
  {
    path: "/domains",
    name: "Domains",
    title: "Domains",
    description:
      "Search 400+ extensions, register in seconds and point it at your SERVERIZZ site automatically. Free WHOIS privacy on every domain.",
    targetKeyword: "domain registration",
    cluster: [],
    jsonLd: null,
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/ai-employees",
    name: "AI Employees",
    title: "AI Employees — Hire an AI Team for Your Business",
    description:
      "Hire a full team of AI Employees through SERVERIZZ × Marblism — running your inbox, social, SEO, lead-gen and calls 24/7. SERVERIZZ clients save 10% for life.",
    targetKeyword: "AI employees for small business",
    cluster: ["AI virtual assistant", "AI team for business", "Marblism AI employees"],
    jsonLd: null,
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/why",
    name: "Why SERVERIZZ",
    title: "Why SERVERIZZ",
    description:
      "Developer-friendly, low-density shared hosting: fewer accounts per server, free migration, daily backups, 99.9% uptime and a dedicated account manager on every plan.",
    targetKeyword: "low-density shared hosting",
    cluster: ["developer-friendly shared hosting", "managed shared hosting"],
    jsonLd: null,
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/about",
    name: "About SERVERIZZ",
    title: "About SERVERIZZ",
    description:
      "SERVERIZZ is Austin-based managed hosting, run by one person since 2014 — fast, well-managed hosting and a real human who picks up. Meet the founder and the story behind it.",
    targetKeyword: "about SERVERIZZ",
    cluster: ["Austin web hosting"],
    jsonLd: null,
    changeFrequency: "monthly",
    priority: 0.65,
  },
  {
    path: "/support",
    name: "Support",
    title: "Support",
    description:
      "How can we help? A real account manager on every plan, 24/7 email tickets and a live status page.",
    targetKeyword: "hosting support",
    cluster: [],
    jsonLd: null,
    changeFrequency: "monthly",
    priority: 0.6,
  },
];

const PAGE_SEO_BY_PATH: Record<string, PageSeo> = Object.fromEntries(
  PAGE_SEO.map((p) => [p.path, p]),
);

/** Look up a page's SEO entry. Throws if the path isn't registered. */
export function seoFor(path: string): PageSeo {
  const seo = PAGE_SEO_BY_PATH[path];
  if (!seo) throw new Error(`No PAGE_SEO entry for "${path}"`);
  return seo;
}

/** Every indexable route, used by the sitemap and (for names) breadcrumbs. */
export const ROUTES: {
  path: string;
  name: string;
  changeFrequency: NonNullable<
    import("next").MetadataRoute.Sitemap[number]["changeFrequency"]
  >;
  priority: number;
}[] = [
  ...PAGE_SEO.map(({ path, name, changeFrequency, priority }) => ({
    path,
    name,
    changeFrequency,
    priority,
  })),
  ...LEGAL_DOCS.map((doc) => ({
    path: `/legal/${doc.slug}`,
    name: doc.title,
    changeFrequency: "yearly" as const,
    priority: 0.3,
  })),
];

/**
 * Build a page-level Metadata object with a self-referencing canonical URL plus
 * matching Open Graph and Twitter entries. The og/twitter images are inherited
 * from the root `opengraph-image`/`twitter-image` file conventions, so they are
 * not repeated here.
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const ogTitle = `${title} · ${SITE_NAME}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: ogTitle,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      type: "website",
    },
    twitter: {
      title: ogTitle,
      description,
    },
  };
}

/** Breadcrumb trail (Home → page) as absolute-URL items for BreadcrumbJsonLd. */
export function breadcrumbTrail(name: string, path: string) {
  return [
    { position: 1, name: "Home", item: `${SITE_URL}/` },
    { position: 2, name, item: `${SITE_URL}${path}` },
  ];
}

/** Build page Metadata from the registry. Home inherits the root default title. */
export function pageMetadataFor(path: string): Metadata {
  const seo = seoFor(path);
  const meta = pageMetadata({ title: seo.title, description: seo.description, path });
  if (seo.inheritTitle) {
    delete meta.title;
    if (meta.openGraph) (meta.openGraph as Record<string, unknown>).title = seo.title;
    if (meta.twitter) (meta.twitter as Record<string, unknown>).title = seo.title;
  }
  return meta;
}

/** Service JSON-LD for a hosting product page (rendered via <JsonLdScript>). */
export function serviceJsonLd(path: string): Record<string, unknown> {
  const seo = seoFor(path);
  if (seo.jsonLd !== "Service" || !seo.serviceType) {
    throw new Error(`serviceJsonLd("${path}") — not a Service page`);
  }
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: seo.title,
    serviceType: seo.serviceType,
    description: seo.description,
    url: `${SITE_URL}${path}`,
    provider: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    areaServed: [...AREA_SERVED],
  };
}

/** LocalBusiness JSON-LD for the Austin HQ (rendered once, sitewide). */
export function localBusinessJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: SITE_NAME,
    legalName: ORG.legalName,
    url: SITE_URL,
    email: ORG.email,
    image: OG_IMAGE_URL,
    address: { "@type": "PostalAddress", ...ORG.address },
    areaServed: [...AREA_SERVED],
  };
}
