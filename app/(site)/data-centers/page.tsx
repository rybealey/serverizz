import type { Metadata } from "next";
import Link from "next/link";
import { Globe, Route, Gauge, Network, type LucideIcon } from "lucide-react";
import { BreadcrumbJsonLd, JsonLdScript } from "next-seo";
import { SectionEyebrow } from "@/components/szz/section-eyebrow";
import { Stat } from "@/components/szz/stat";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { dcRegions } from "@/lib/szz-data";
import { breadcrumbTrail, pageMetadataFor, serviceJsonLd } from "@/lib/seo";

export const metadata: Metadata = pageMetadataFor("/data-centers");

const display = "var(--font-heading)";
const mono = "var(--font-mono)";
const muted = "var(--szz-text-muted)";
const primary = "var(--szz-text-primary)";
const light = "var(--szz-text-light)";
const dim = "var(--szz-text-dim)";
const blue = "var(--szz-accent-blue)";
const green = "var(--szz-green)";

const features: { Icon: LucideIcon; color: string; title: string; body: string }[] = [
  {
    Icon: Route,
    color: blue,
    title: "Localized peering",
    body: "Routing and peering are continuously optimized in every region, so traffic takes the shortest path to your users.",
  },
  {
    Icon: Gauge,
    color: blue,
    title: "Low latency, near you",
    body: "Spin up high-performance SSD compute in the city closest to your customers — develop locally, serve globally.",
  },
  {
    Icon: Network,
    color: green,
    title: "Redundant by design",
    body: "A multi-homed architecture across multiple transit providers keeps your infrastructure reachable and resilient.",
  },
];

export default function DataCentersPage() {
  return (
    <div>
      <BreadcrumbJsonLd items={breadcrumbTrail("Data Centers", "/data-centers")} />
      <JsonLdScript
        id="data-centers-service-jsonld"
        scriptKey="data-centers-service-jsonld"
        data={serviceJsonLd("/data-centers")}
      />

      {/* hero */}
      <section
        style={{
          borderBottom: "1px solid var(--szz-border)",
          background: "var(--szz-bg-card)",
          padding: "80px 48px 60px",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 30 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 680 }}>
            <SectionEyebrow>Global infrastructure</SectionEyebrow>
            <h1
              style={{
                margin: 0,
                fontFamily: display,
                fontSize: "clamp(32px, 6vw, 48px)",
                fontWeight: 700,
                lineHeight: 1.06,
                letterSpacing: "-1.5px",
                color: primary,
              }}
            >
              Deploy in 32 cities. Pick yours.
            </h1>
            <p style={{ margin: 0, fontSize: 17, lineHeight: 1.65, color: muted }}>
              SERVERIZZ enterprise customers can place workloads in any of 32 data center regions
              across six continents — close to your team, and closer to your customers.
            </p>
          </div>
          <div style={{ display: "flex", gap: 56, flexWrap: "wrap", paddingTop: 6 }}>
            <Stat value="32" label="data center regions" />
            <Stat value="6" label="continents covered" />
            <Stat value={<>&lt;50ms</>} label="to most major metros" />
            <Stat value="100%" label="enterprise region choice" />
          </div>
        </div>
      </section>

      {/* network footprint note */}
      <section style={{ padding: "28px 48px 0" }}>
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: 12,
            border: "1px solid var(--szz-border)",
            borderRadius: 10,
            background: "var(--szz-bg-card)",
            padding: "14px 20px",
          }}
        >
          <Globe size={18} style={{ flex: "none", color: blue }} />
          <span style={{ fontSize: 14, color: muted }}>
            One of the largest worldwide footprints available — spin up and scale low-latency
            infrastructure wherever you, or your customers, happen to be.
          </span>
        </div>
      </section>

      {/* region listing */}
      <section style={{ padding: "50px 48px 70px" }}>
        <div className="szz-grid-2" style={{ maxWidth: 1100, margin: "0 auto", gap: 18, alignItems: "start" }}>
          {dcRegions.map((r) => (
            <Card key={r.region}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    paddingBottom: 12,
                    borderBottom: "1px solid var(--szz-border)",
                  }}
                >
                  <span style={{ fontFamily: display, fontSize: 18, fontWeight: 700, color: primary }}>
                    {r.region}
                  </span>
                  <span
                    style={{
                      fontFamily: mono,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "1px",
                      color: blue,
                      border: "1px solid var(--szz-border)",
                      borderRadius: 999,
                      padding: "3px 10px",
                      flex: "none",
                    }}
                  >
                    {r.count} REGIONS
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 18px" }}>
                  {r.cities.map((c) => (
                    <div key={c.city} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <span
                        aria-hidden
                        style={{ width: 6, height: 6, borderRadius: 999, background: green, flex: "none" }}
                      />
                      <span style={{ fontSize: 14, color: light }}>{c.city}</span>
                      <span style={{ fontFamily: mono, fontSize: 11, color: dim, marginLeft: "auto" }}>
                        {c.code}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* network features */}
      <section className="szz-section" style={{ background: "var(--szz-bg-card)", padding: "80px 48px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 40 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 640 }}>
            <SectionEyebrow>Why_it_matters</SectionEyebrow>
            <h2
              style={{
                margin: 0,
                fontFamily: display,
                fontSize: "clamp(26px, 5vw, 32px)",
                fontWeight: 700,
                lineHeight: 1.15,
                letterSpacing: "-.5px",
                color: primary,
              }}
            >
              A network engineered for low latency
            </h2>
          </div>
          <div className="szz-grid-3" style={{ gap: 18 }}>
            {features.map(({ Icon, color, title, body }) => (
              <Card key={title} surface="deep">
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <Icon size={24} style={{ color }} />
                  <span style={{ fontFamily: display, fontSize: 18, fontWeight: 700, color: primary }}>
                    {title}
                  </span>
                  <span style={{ fontSize: 14, lineHeight: 1.6, color: muted }}>{body}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* enterprise CTA */}
      <section style={{ padding: "80px 48px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Card glow>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 32,
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 560 }}>
                <SectionEyebrow tone="green" slashes={false}>
                  Enterprise
                </SectionEyebrow>
                <h2
                  style={{
                    margin: 0,
                    fontFamily: display,
                    fontSize: "clamp(24px, 5vw, 28px)",
                    fontWeight: 700,
                    lineHeight: 1.15,
                    letterSpacing: "-.5px",
                    color: primary,
                  }}
                >
                  Need a specific region — or several?
                </h2>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: muted }}>
                  Enterprise plans can deploy to any region above, span multiple, or pin data to a
                  jurisdiction for compliance. Tell us your map and your account manager will architect it.
                </p>
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Button asChild variant="primary" size="lg">
                  <Link href="/support">Talk to enterprise</Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
