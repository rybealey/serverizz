import type { Metadata } from "next";
import Link from "next/link";
import {
  RefreshCw,
  ShieldCheck,
  Zap,
  DatabaseBackup,
  GitBranch,
  Headset,
} from "lucide-react";
import { BreadcrumbJsonLd } from "next-seo";
import { SectionEyebrow } from "@/components/szz/section-eyebrow";
import { Terminal } from "@/components/szz/terminal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { wpLines } from "@/lib/szz-data";
import { breadcrumbTrail, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Managed WordPress hosting",
  description:
    "WordPress that updates, backs up and secures itself. Core and plugin updates, malware scanning, caching and daily backups — all handled for you.",
  path: "/wordpress",
});

const display = "var(--font-heading)";
const muted = "var(--szz-text-muted)";
const primary = "var(--szz-text-primary)";
const light = "var(--szz-text-light)";

const pills = ["1-click install", "Free migration", "Staging site", "Free SSL + CDN"];

const included = [
  { Icon: RefreshCw, color: "var(--szz-accent-blue)", title: "Auto updates", body: "Core + plugins, tested before they go live." },
  { Icon: ShieldCheck, color: "var(--szz-accent-blue)", title: "Security", body: "Malware scanning, WAF and free fixes." },
  { Icon: Zap, color: "var(--szz-accent-blue)", title: "Speed", body: "Server-side caching + global CDN built in." },
  { Icon: DatabaseBackup, color: "var(--szz-accent-blue)", title: "Daily backups", body: "Restore your whole site in one click." },
  { Icon: GitBranch, color: "var(--szz-accent-blue)", title: "Staging", body: "Test changes safely, then push live." },
  { Icon: Headset, color: "var(--szz-green)", title: "Human support", body: "WordPress experts, plus your account manager." },
];

const specs = [
  ["Storage", "25 GB SSD"],
  ["Bandwidth", "Unmetered"],
  ["Monthly visitors", "~250k"],
  ["Mailboxes", "included free"],
  ["PHP / MySQL", "latest"],
];

export default function WordPressPage() {
  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", padding: "48px 24px 0" }}>
      <BreadcrumbJsonLd items={breadcrumbTrail("Managed WordPress hosting", "/wordpress")} />
      {/* breadcrumb */}
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--szz-text-dim)", marginBottom: 24 }}>
        <Link href="/hosting" className="szz-link-accent" style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--szz-text-dim)" }}>
          Plans
        </Link>{" "}
        / <span style={{ color: "var(--szz-accent-blue)" }}>WordPress Hosting</span>
      </div>

      {/* hero */}
      <section className="szz-hero-grid" style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr", gap: 40, alignItems: "start", paddingBottom: 70 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <SectionEyebrow>Managed WordPress</SectionEyebrow>
          <h1 style={{ margin: 0, fontFamily: display, fontSize: "clamp(32px, 6vw, 48px)", fontWeight: 700, lineHeight: 1.08, letterSpacing: "-1.5px", color: primary }}>
            WordPress that updates, backs up &amp; secures itself.
          </h1>
          <p style={{ margin: 0, maxWidth: 480, fontSize: 17, lineHeight: 1.6, color: muted }}>
            We handle core and plugin updates, malware scanning, caching and daily backups — so you
            can just write and sell.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {pills.map((p) => (
              <span key={p} style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "1px solid var(--szz-border)", borderRadius: 999, padding: "6px 14px", fontSize: 13, color: light }}>
                <span style={{ color: "var(--szz-green)" }}>✓</span> {p}
              </span>
            ))}
          </div>
        </div>

        <Card glow>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, height: "100%" }}>
            <span style={{ fontSize: 13, color: muted }}>Starts at</span>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ fontFamily: display, fontSize: 44, fontWeight: 700, color: primary }}>$15</span>
              <span style={{ fontSize: 15, color: "var(--szz-text-dim)" }}>/mo</span>
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--szz-text-dim)", marginTop: -6 }}>
              billed annually · 30-day refund
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, margin: "6px 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14, color: muted }}>
                <span>Plan</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "1px solid var(--szz-border)", borderRadius: 8, padding: "6px 12px", color: primary }}>
                  Entrepreneur <span style={{ color: "var(--szz-text-dim)" }}>▾</span>
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: muted }}>
                <span>Sites</span>
                <span style={{ color: light }}>up to 4</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: muted }}>
                <span>Storage</span>
                <span style={{ color: light }}>25 GB SSD</span>
              </div>
            </div>
            <Button asChild variant="primary" size="lg" style={{ width: "100%" }}>
              <Link href="/support">Get started</Link>
            </Button>
            <span style={{ textAlign: "center", fontSize: 13, color: muted }}>
              or{" "}
              <Link href="/support" className="szz-link-accent" style={{ fontSize: 13, color: "var(--szz-accent-blue)" }}>
                talk to our team
              </Link>{" "}
              first
            </span>
          </div>
        </Card>
      </section>

      {/* what's included */}
      <section style={{ padding: "0 0 70px" }}>
        <h2 style={{ margin: "0 0 28px", fontFamily: display, fontSize: "clamp(24px, 4vw, 30px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-.5px", color: primary }}>
          What&apos;s included
        </h2>
        <div className="szz-grid-3" style={{ gap: 18 }}>
          {included.map(({ Icon, color, title, body }) => (
            <Card key={title}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Icon size={22} style={{ color }} />
                <span style={{ fontFamily: display, fontSize: 18, fontWeight: 700, color: primary }}>{title}</span>
                <span style={{ fontSize: 14, lineHeight: 1.5, color: muted }}>{body}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* specs + terminal */}
      <section className="szz-grid-2" style={{ paddingBottom: 80, alignItems: "stretch" }}>
        <Card flush>
          <div style={{ padding: "16px 22px", borderBottom: "1px solid var(--szz-border)", fontFamily: display, fontSize: 16, fontWeight: 700, color: primary }}>
            The specs
          </div>
          {specs.map(([k, v], i) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "14px 22px", borderBottom: i === specs.length - 1 ? "none" : "1px solid var(--szz-border)", fontSize: 14 }}>
              <span style={{ color: muted }}>{k}</span>
              <span style={{ color: light }}>{v}</span>
            </div>
          ))}
        </Card>
        <Terminal title="serverizz-cli v4.2.0" lines={wpLines} />
      </section>

      {/* CTA */}
      <section style={{ paddingBottom: 90 }}>
        <Card surface="deep">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center", padding: 18 }}>
            <h3 style={{ margin: 0, fontFamily: display, fontSize: 26, fontWeight: 700, letterSpacing: "-.5px", color: primary }}>
              Not sure which plan?
            </h3>
            <p style={{ margin: 0, maxWidth: 440, fontSize: 15, color: muted }}>
              Tell us about your site and your account manager will point you to the right one.
            </p>
            <Button asChild variant="outline" size="lg">
              <Link href="/hosting">Compare all plans →</Link>
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
}
