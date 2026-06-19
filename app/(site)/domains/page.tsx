import type { Metadata } from "next";
import Link from "next/link";
import { EyeOff, Forward, Settings2, RefreshCcw } from "lucide-react";
import { BreadcrumbJsonLd } from "next-seo";
import { SectionEyebrow } from "@/components/szz/section-eyebrow";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { breadcrumbTrail, pageMetadata } from "@/lib/seo";
import { getTldPricing } from "@/lib/clientexec";
import { TLDS, formatYearlyPrice } from "@/lib/domains";
import { DomainSearch } from "@/components/szz/domain-search";

export const metadata: Metadata = pageMetadata({
  title: "Domains",
  description:
    "Search 400+ extensions, register in seconds and point it at your SERVERIZZ site automatically. Free WHOIS privacy on every domain.",
  path: "/domains",
});

const display = "var(--font-heading)";
const muted = "var(--szz-text-muted)";
const primary = "var(--szz-text-primary)";

const includes = [
  { Icon: EyeOff, color: "var(--szz-accent-blue)", title: "WHOIS privacy", body: "Your details stay private — free, forever." },
  { Icon: Forward, color: "var(--szz-accent-blue)", title: "Email forwarding", body: "Forward you@name.com anywhere." },
  { Icon: Settings2, color: "var(--szz-accent-blue)", title: "DNS management", body: "Simple records, or let us auto-configure." },
  { Icon: RefreshCcw, color: "var(--szz-green)", title: "Auto-renew", body: "Never lose your name to an expiry." },
];

export default async function DomainsPage() {
  const pricing = await getTldPricing(TLDS);
  return (
    <div>
      <BreadcrumbJsonLd items={breadcrumbTrail("Domains", "/domains")} />
      {/* hero */}
      <section style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, padding: "80px 24px 60px", maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
        <SectionEyebrow>Domains</SectionEyebrow>
        <h1 style={{ margin: 0, fontFamily: display, fontSize: "clamp(33px, 7vw, 56px)", fontWeight: 700, lineHeight: 1.05, letterSpacing: "-2px", color: primary }}>
          Find the perfect name.
        </h1>
        <p style={{ margin: 0, maxWidth: 520, fontSize: 17, lineHeight: 1.6, color: muted }}>
          Search 400+ extensions, register in seconds, and point it at your SERVERIZZ site
          automatically. Free WHOIS privacy on every domain.
        </p>
        <DomainSearch placeholder="search yourbusiness.com" />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          {pricing.slice(0, 5).map(({ tld, formatedPrice }) => (
            <span key={tld} style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--szz-text-dim)", border: "1px solid var(--szz-border)", borderRadius: 999, padding: "5px 12px" }}>
              .{tld} {formatedPrice ? formatedPrice.replace(/\s*USD\s*$/i, "") : "—"}
            </span>
          ))}
        </div>
      </section>

      {/* TLD pricing grid */}
      <section className="szz-section" style={{ background: "var(--szz-bg-card)", padding: "80px 48px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 36 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" }}>
            <h2 style={{ margin: 0, fontFamily: display, fontSize: "clamp(26px, 5vw, 32px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-.5px", color: primary }}>
              Honest, flat pricing
            </h2>
            <p style={{ margin: 0, fontSize: 15, color: muted }}>
              The renewal price is the same as the registration price. No first-year tricks.
            </p>
          </div>
          <div className="szz-grid-4">
            {pricing.map(({ tld, formatedPrice }) => (
              <div key={tld} style={{ border: "1px solid var(--szz-border)", borderRadius: 10, background: "var(--szz-bg-deep)", padding: 20, display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700, color: "var(--szz-text-primary)" }}>.{tld}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--szz-accent-blue)" }}>{formatYearlyPrice(formatedPrice)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* what's included */}
      <section className="szz-section" style={{ padding: "80px 48px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 36 }}>
          <h2 style={{ margin: 0, textAlign: "center", fontFamily: display, fontSize: "clamp(26px, 5vw, 32px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-.5px", color: primary }}>
            Every domain includes
          </h2>
          <div className="szz-grid-4" style={{ gap: 18 }}>
            {includes.map(({ Icon, color, title, body }) => (
              <Card key={title}>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <Icon size={22} style={{ color }} />
                  <span style={{ fontFamily: display, fontSize: 16, fontWeight: 700, color: primary }}>{title}</span>
                  <span style={{ fontSize: 13, lineHeight: 1.5, color: muted }}>{body}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* transfer band */}
      <section style={{ padding: "0 24px 90px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Card surface="deep">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap", padding: 10 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <h3 style={{ margin: 0, fontFamily: display, fontSize: 24, fontWeight: 700, letterSpacing: "-.5px", color: primary }}>
                  Already own a domain?
                </h3>
                <p style={{ margin: 0, fontSize: 15, color: muted }}>
                  Transfer it in free, or just point it at your site — your account manager handles
                  the DNS.
                </p>
              </div>
              <Button asChild variant="primary" size="lg">
                <Link href="/support">Transfer a domain</Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
