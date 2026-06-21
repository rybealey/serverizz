import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BreadcrumbJsonLd } from "next-seo";
import { SectionEyebrow } from "@/components/szz/section-eyebrow";
import { Button } from "@/components/ui/button";
import { GetTermsDocument } from "@/components/szz/getterms-document";
import { LEGAL_DOCS, legalDocBySlug } from "@/lib/legal";
import { breadcrumbTrail, pageMetadata } from "@/lib/seo";

type LegalPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return LEGAL_DOCS.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({
  params,
}: LegalPageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = legalDocBySlug(slug);
  if (!doc) return {};
  return pageMetadata({
    title: doc.title,
    description: doc.description,
    path: `/legal/${doc.slug}`,
  });
}

const display = "var(--font-heading)";
const primary = "var(--szz-text-primary)";
const muted = "var(--szz-text-muted)";

export default async function LegalPage({ params }: LegalPageProps) {
  const { slug } = await params;
  const doc = legalDocBySlug(slug);
  if (!doc) notFound();

  return (
    <div>
      <BreadcrumbJsonLd
        items={breadcrumbTrail(doc.title, `/legal/${doc.slug}`)}
      />

      {/* header band: eyebrow + title + document tabs */}
      <section
        className="szz-legal-band"
        style={{
          borderBottom: "1px solid var(--szz-border)",
          background: "var(--szz-bg-card)",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <SectionEyebrow>Legal</SectionEyebrow>
          <h1
            style={{
              margin: 0,
              fontFamily: display,
              fontSize: "clamp(30px, 5vw, 42px)",
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-1.5px",
              color: primary,
            }}
          >
            {doc.title}
          </h1>
          <nav
            aria-label="Legal documents"
            style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
          >
            {LEGAL_DOCS.map((d) => {
              const active = d.slug === doc.slug;
              return (
                <Link
                  key={d.slug}
                  href={`/legal/${d.slug}`}
                  className="szz-legal-tab"
                  aria-current={active ? "page" : undefined}
                  data-active={active ? "true" : undefined}
                >
                  {d.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </section>

      {/* body: the GetTerms managed document */}
      <section className="szz-legal-body">
        <article style={{ maxWidth: 820, margin: "0 auto", minWidth: 0 }}>
          <GetTermsDocument key={doc.slug} document={doc.document} />

          {/* contact strip */}
          <div
            style={{
              marginTop: 44,
              border: "1px solid var(--szz-border)",
              borderRadius: 12,
              background: "var(--szz-bg-card)",
              padding: "22px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <span
                style={{
                  fontFamily: display,
                  fontSize: 16,
                  fontWeight: 700,
                  color: primary,
                }}
              >
                Questions about this policy?
              </span>
              <span style={{ fontSize: 14, color: muted }}>
                Your account manager or our legal team can help.
              </span>
            </div>
            <Button asChild variant="outline" size="md">
              <Link href="/support">Contact us</Link>
            </Button>
          </div>
        </article>
      </section>
    </div>
  );
}
