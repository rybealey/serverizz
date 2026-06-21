/**
 * Legal documents shown at `/legal/[slug]`.
 *
 * The *body* of every legal page is rendered by GetTerms (account `YyQ5z`) from
 * the managed templates — see {@link "@/components/szz/getterms-document"}. We
 * keep the routing, titles and SEO copy here so the page, footer and sitemap
 * never drift apart, mirroring the single-source-of-truth pattern in lib/seo.ts.
 */

/** GetTerms account id shared by every embed (`data-getterms`). */
export const GETTERMS_ACCOUNT = "YyQ5z";

export type LegalDoc = {
  /** URL segment — the page lives at `/legal/<slug>`. */
  slug: string;
  /** Pill-tab + footer label. */
  label: string;
  /** `<h1>` heading and document `<title>`. */
  title: string;
  /** GetTerms `data-getterms-document` value. */
  document: string;
  /** Meta description for the page. */
  description: string;
};

/** Order here drives the on-page tab bar and the footer LEGAL column. */
export const LEGAL_DOCS: LegalDoc[] = [
  {
    slug: "privacy",
    label: "Privacy Policy",
    title: "Privacy Policy",
    document: "privacy",
    description:
      "How SERVERIZZ collects, uses and protects your personal data — and the choices you have.",
  },
  {
    slug: "terms",
    label: "Terms of Service",
    title: "Terms of Service",
    document: "terms-of-service",
    description:
      "The terms that govern your use of SERVERIZZ hosting, domains and related services.",
  },
  {
    slug: "acceptable-use",
    label: "Acceptable Use",
    title: "Acceptable Use Policy",
    document: "acceptable-use",
    description:
      "The rules that keep SERVERIZZ fast, reliable and reputable for every customer.",
  },
  {
    slug: "cookies",
    label: "Cookie Policy",
    title: "Cookie Policy",
    document: "cookies",
    description:
      "What cookies SERVERIZZ uses, why we use them, and how to manage your preferences.",
  },
  {
    slug: "refunds",
    label: "Cancellations & Refunds",
    title: "Cancellations & Refunds",
    document: "return",
    description:
      "How cancellations work and how our 30-day money-back guarantee applies.",
  },
];

/** Look up a legal document by its URL slug. */
export function legalDocBySlug(slug: string): LegalDoc | undefined {
  return LEGAL_DOCS.find((doc) => doc.slug === slug);
}
