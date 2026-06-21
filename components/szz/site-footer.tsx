import * as React from "react";
import Link from "next/link";
import { TerminalLogo } from "@/components/szz/terminal-logo";
import { PaymentMarks } from "@/components/szz/payment-marks";
import { LEGAL_DOCS } from "@/lib/legal";

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "PRODUCTS",
    links: [
      { label: "Web Hosting", href: "/hosting" },
      { label: "WordPress", href: "/wordpress" },
      { label: "Domains", href: "/domains" },
    ],
  },
  {
    heading: "COMPANY",
    links: [
      { label: "Why us", href: "/why" },
      { label: "About", href: "/support" },
      { label: "Blog", href: "/support" },
    ],
  },
  {
    heading: "SUPPORT",
    links: [
      { label: "Help center", href: "/support" },
      { label: "Status", href: "/support" },
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
              {col.links.map((link, i) => (
                <Link key={`${link.label}-${i}`} href={link.href} className="szz-foot-link">
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>

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
