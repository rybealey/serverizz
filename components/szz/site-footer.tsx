import * as React from "react";
import Link from "next/link";
import { Sprout, BadgeCheck, Cloud, Trees, Briefcase, type LucideIcon } from "lucide-react";
import { TerminalLogo } from "@/components/szz/terminal-logo";
import { PaymentMarks } from "@/components/szz/payment-marks";
import { LEGAL_DOCS } from "@/lib/legal";
import {
  getImpactSummary,
  formatCount,
  formatTonnes,
  formatSqMeters,
  type ImpactSummary,
} from "@/lib/treeapp";

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

// "Our impact" footer badges, sourced from The Tree App summary. Each maps an icon
// and label to a formatted value from the normalized ImpactSummary.
const IMPACT_BADGES: { icon: LucideIcon; label: string; value: (i: ImpactSummary) => string }[] = [
  { icon: Sprout, label: "trees planted", value: (i) => formatCount(i.trees) },
  { icon: BadgeCheck, label: "carbon credits", value: (i) => formatCount(i.carbonCredits) },
  { icon: Cloud, label: "CO₂ absorbed", value: (i) => formatTonnes(i.co2Tonnes) },
  { icon: Trees, label: "land restored", value: (i) => formatSqMeters(i.landSqMeters) },
  { icon: Briefcase, label: "workdays created", value: (i) => formatCount(i.workdays) },
];

export async function SiteFooter() {
  const impact = await getImpactSummary();
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

      <div style={{ maxWidth: 1180, margin: "44px auto 0", display: "flex", flexDirection: "column", gap: 12 }}>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 2,
            color: "var(--szz-green)",
          }}
        >
          {"// OUR_IMPACT"}
        </span>
        <div style={{ maxWidth: 560, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {IMPACT_BADGES.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              title={`${value(impact)} ${label} through The Tree App`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                whiteSpace: "nowrap",
                border: "1px solid color-mix(in srgb, var(--szz-green) 35%, transparent)",
                borderRadius: 999,
                background: "color-mix(in srgb, var(--szz-green) 9%, transparent)",
                padding: "5px 12px 5px 10px",
              }}
            >
              <Icon size={14} aria-hidden style={{ flexShrink: 0, color: "var(--szz-green)" }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "var(--szz-green)" }}>
                {value(impact)}
              </span>
              <span style={{ fontSize: 12, color: "var(--szz-text-muted)" }}>{label}</span>
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
