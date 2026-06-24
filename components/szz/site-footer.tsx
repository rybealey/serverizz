import * as React from "react";
import Link from "next/link";
import { TerminalLogo } from "@/components/szz/terminal-logo";
import { PaymentMarks } from "@/components/szz/payment-marks";
import { ImpactBadges } from "@/components/szz/impact-badges";
import { LEGAL_DOCS } from "@/lib/legal";

const COLUMNS: {
  heading: string;
  links: { label: string; href?: string; external?: boolean; indent?: boolean; header?: boolean }[];
}[] = [
  {
    heading: "PRODUCTS",
    links: [
      { label: "Hosting", header: true },
      { label: "Shared", href: "/hosting", indent: true },
      { label: "WordPress", href: "/hosting/wordpress", indent: true },
      { label: "Reseller", href: "/hosting/reseller", indent: true },
      { label: "Domains", href: "/domains" },
    ],
  },
  {
    heading: "BUSINESS TOOLS",
    links: [
      { label: "AI Employees", href: "/ai-employees" },
    ],
  },
  {
    heading: "COMPANY",
    links: [
      { label: "Why Us", href: "/why" },
      { label: "About", href: "/about" },
      { label: "Data Centers", href: "/data-centers" },
      { label: "Newsroom", href: "/blog" },
    ],
  },
  {
    heading: "SUPPORT",
    links: [
      { label: "Help Center", href: "/support" },
      { label: "Status", href: "https://status.serverizz.com", external: true },
      { label: "Contact", href: "/support" },
    ],
  },
  {
    heading: "LEGAL",
    links: LEGAL_DOCS.map((doc) => ({
      label: doc.label,
      href: `/legal/${doc.slug}`,
    })),
  },
];

export function SiteFooter() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--szz-border)",
        background: "var(--szz-bg-deep)",
        padding: "60px 48px 40px",
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          gap: 48,
          flexWrap: "wrap",
        }}
      >
        <div style={{ width: 300, display: "flex", flexDirection: "column", gap: 16 }}>
          <TerminalLogo size={24} />
          <span style={{ fontSize: 13, fontStyle: "italic", color: "var(--szz-text-dim)" }}>
            ship infrastructure. ship software. ship brands.
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 13, color: "var(--szz-text-muted)" }}>
              howdy@serverizz.com
            </span>
            <span style={{ fontSize: 13, color: "var(--szz-text-muted)" }}>
              +1 (512) 859-7520
            </span>
            <span style={{ fontSize: 13, lineHeight: 1.6, color: "var(--szz-text-dim)" }}>
              1606 Headway Circle, Suite 9317
              <br />
              Austin, TX 78754
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 56, flexWrap: "wrap" }}>
          {COLUMNS.map((col) => (
            <div
              key={col.heading}
              style={{ display: "flex", flexDirection: "column", gap: 10 }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 2,
                  color: "var(--szz-accent-blue)",
                }}
              >
                {col.heading}
              </span>
              {col.links.map((link, i) =>
                link.header || !link.href ? (
                  <span
                    key={`${link.label}-${i}`}
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: 13,
                      color: "var(--szz-text-dim)",
                      cursor: "default",
                    }}
                  >
                    {link.label}
                  </span>
                ) : (
                  <Link
                    key={`${link.label}-${i}`}
                    href={link.href}
                    className="szz-foot-link"
                    style={link.indent ? { paddingLeft: 12 } : undefined}
                    {...(link.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </div>
          ))}
        </div>
      </div>

      <ImpactBadges />

      <div style={{ maxWidth: 1180, margin: "40px auto 0", height: 1, background: "var(--szz-border)" }} />
      <div
        style={{
          maxWidth: 1180,
          margin: "20px auto 0",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 12, color: "var(--szz-text-dim)" }}>
          © 2026 Rizz Enterprises, LLC.
        </span>
        <PaymentMarks />
      </div>
    </footer>
  );
}
