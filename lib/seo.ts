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

/** Every indexable route, used by the sitemap and (for names) breadcrumbs. */
export const ROUTES: {
  path: string;
  name: string;
  changeFrequency: NonNullable<
    import("next").MetadataRoute.Sitemap[number]["changeFrequency"]
  >;
  priority: number;
}[] = [
  { path: "/", name: "Home", changeFrequency: "weekly", priority: 1 },
  { path: "/hosting", name: "Hosting plans", changeFrequency: "monthly", priority: 0.9 },
  { path: "/wordpress", name: "Managed WordPress hosting", changeFrequency: "monthly", priority: 0.9 },
  { path: "/domains", name: "Domains", changeFrequency: "monthly", priority: 0.8 },
  { path: "/why", name: "Why SERVERIZZ", changeFrequency: "monthly", priority: 0.7 },
  { path: "/support", name: "Support", changeFrequency: "monthly", priority: 0.6 },
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
