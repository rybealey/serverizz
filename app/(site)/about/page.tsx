import type { Metadata } from "next";
import Link from "next/link";
import { PhoneCall, Sprout, Compass, Leaf, type LucideIcon } from "lucide-react";
import { BreadcrumbJsonLd } from "next-seo";
import { SectionEyebrow } from "@/components/szz/section-eyebrow";
import { Terminal } from "@/components/szz/terminal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImpactStatCards } from "@/components/szz/impact-stat-cards";
import { aboutLines } from "@/lib/szz-data";
import { breadcrumbTrail, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About SERVERIZZ",
  description:
    "SERVERIZZ has been a one-person promise since 2014 — fast, well-managed hosting and a real human who picks up. Meet the founder and the story behind it.",
  path: "/about",
});

const display = "var(--font-heading)";
const mono = "var(--font-mono)";
const muted = "var(--szz-text-muted)";
const primary = "var(--szz-text-primary)";
const light = "var(--szz-text-light)";
const dim = "var(--szz-text-dim)";

const values: { Icon: LucideIcon; color: string; title: string; body: string }[] = [
  {
    Icon: PhoneCall,
    color: "var(--szz-accent-blue)",
    title: "Real humans, never ghosts",
    body: "A dedicated account manager who knows your setup and actually replies. No queue roulette, no vanishing act.",
  },
  {
    Icon: Sprout,
    color: "var(--szz-green)",
    title: "Leave it better than we found it",
    body: "For your site and for the planet — we fund reforestation and restoration with every plan you run.",
  },
  {
    Icon: Compass,
    color: "var(--szz-accent-blue)",
    title: "Always looking ahead",
    body: "We keep learning — new platforms, faster stacks, better security — so you don't have to think about any of it.",
  },
];

const timeline: { year: string; title: string; body: string; green?: boolean }[] = [
  {
    year: "2014",
    title: "It begins with mom's site",
    body: "A high-school project becomes a calling — building and managing a real small-business website.",
  },
  {
    year: "2016",
    title: "Word gets around",
    body: "Her friends need sites too. The first paying hosting clients arrive — all by referral.",
  },
  {
    year: "2018",
    title: "Rizz Enterprises is born",
    body: "Hosting grows into a small agency — web design, branding and SEO under one roof.",
  },
  {
    year: "2023",
    title: "A manager for every account",
    body: "We make the original promise official: a dedicated human on every single plan.",
  },
  {
    year: "2026",
    title: "Focused on what we do best",
    body: "SERVERIZZ sharpens to managed hosting for small business — and starts planting trees with every plan.",
    green: true,
  },
];

export default function AboutPage() {
  return (
    <div>
      <BreadcrumbJsonLd items={breadcrumbTrail("About SERVERIZZ", "/about")} />

      {/* hero */}
      <section style={{ borderBottom: "1px solid var(--szz-border)", background: "var(--szz-bg-card)", padding: "80px 48px 70px" }}>
        <div className="szz-split" style={{ maxWidth: 1100, margin: "0 auto", gap: 56 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <SectionEyebrow>Our story</SectionEyebrow>
            <h1 style={{ margin: 0, fontFamily: display, fontSize: "clamp(34px, 6vw, 48px)", fontWeight: 700, lineHeight: 1.06, letterSpacing: "-1.5px", color: primary }}>
              It started with my mom&apos;s website.
            </h1>
            <p style={{ margin: 0, maxWidth: 480, fontSize: 17, lineHeight: 1.65, color: muted }}>
              SERVERIZZ has been a one-person promise since 2014 — that you&apos;ll always have fast,
              well-managed hosting and a real human who picks up. I&apos;m still that human.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 14, paddingTop: 6 }}>
              <div style={{ width: 44, height: 44, borderRadius: 999, background: "var(--szz-border)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: display, fontWeight: 700, fontSize: 16, color: primary }}>
                RB
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontFamily: display, fontSize: 15, fontWeight: 700, color: primary }}>Ry Bealey</span>
                <span style={{ fontSize: 13, color: dim }}>Founder, SERVERIZZ · Rizz Enterprises, LLC</span>
              </div>
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <Terminal title="serverizz-cli v4.2.0" lines={aboutLines} />
            <div style={{ position: "absolute", right: -14, bottom: -16, display: "flex", alignItems: "center", gap: 8, border: "1px solid var(--szz-border)", borderRadius: 10, background: "var(--szz-bg-card)", boxShadow: "var(--shadow-glow-blue)", padding: "9px 13px" }}>
              <span style={{ width: 7, height: 7, borderRadius: 999, background: "var(--szz-green)" }} />
              <span style={{ fontFamily: mono, fontSize: 12, color: light }}>online since 2014</span>
            </div>
          </div>
        </div>
      </section>

      {/* story / origin */}
      <section style={{ padding: "80px 48px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 22 }}>
          <h2 style={{ margin: 0, fontFamily: display, fontSize: "clamp(26px, 5vw, 30px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-.5px", color: primary }}>
            A high-schooler, a small business, and a lot of late nights
          </h2>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.75, color: muted }}>
            Back in 2014, my mom started a business and needed a website. I was in high school, so I
            volunteered — I built it, got it online, and then kept it running. Somewhere between fixing
            a broken plugin at midnight and explaining DNS over dinner, I fell completely in love with
            web technology.
          </p>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.75, color: muted }}>
            What stuck with me wasn&apos;t the code — it was how much it mattered to her to have one
            person she could call who actually knew her site and wouldn&apos;t disappear. That&apos;s
            rare in hosting. Most companies hand you a ticket number and a queue. I wanted to offer the
            opposite: a genuinely reliable setup, and a dedicated point of contact when you need help.
            For years, that point of contact was just me.
          </p>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.75, color: muted }}>
            That work grew into{" "}
            <span style={{ color: light, fontWeight: 600 }}>Rizz Enterprises</span> — a small agency
            doing web design, branding and SEO alongside hosting. We&apos;re proud of that heritage;
            it&apos;s still part of how we think about your whole online presence, not just the server
            it sits on. But over time it became clear where we did our best work: quietly keeping
            small-business websites fast, secure and online, with a real person behind every account.
            So that&apos;s what SERVERIZZ is now built to do.
          </p>
          <div style={{ marginTop: 10, borderLeft: "2px solid var(--szz-accent-blue)", padding: "4px 0 4px 20px" }}>
            <p style={{ margin: 0, fontFamily: display, fontSize: 20, fontWeight: 600, lineHeight: 1.4, letterSpacing: "-.3px", color: primary }}>
              &ldquo;Every account is still someone&apos;s business. I never forgot what it felt like
              when that someone was my mom.&rdquo;
            </p>
            <span style={{ display: "inline-block", marginTop: 12, fontFamily: mono, fontSize: 12, color: dim }}>
              — Ry Bealey, Founder
            </span>
          </div>
        </div>
      </section>

      {/* mission & values */}
      <section style={{ background: "var(--szz-bg-card)", padding: "80px 48px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 44 }}>
          <div style={{ maxWidth: 640, display: "flex", flexDirection: "column", gap: 14 }}>
            <SectionEyebrow>What we stand for</SectionEyebrow>
            <h2 style={{ margin: 0, fontFamily: display, fontSize: "clamp(26px, 5vw, 32px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-.5px", color: primary }}>
              Keep small businesses online — and treat them like people.
            </h2>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.65, color: muted }}>
              Three things have stayed true from that first website to today. They&apos;re not posters
              on a wall — they&apos;re how we actually run.
            </p>
          </div>
          <div className="szz-grid-3" style={{ gap: 18 }}>
            {values.map(({ Icon, color, title, body }) => (
              <Card key={title}>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <Icon size={24} style={{ color }} />
                  <span style={{ fontFamily: display, fontSize: 19, fontWeight: 700, color: primary }}>{title}</span>
                  <span style={{ fontSize: 14, lineHeight: 1.6, color: muted }}>{body}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* timeline */}
      <section style={{ padding: "80px 48px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 36 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <SectionEyebrow>The road here</SectionEyebrow>
            <h2 style={{ margin: 0, fontFamily: display, fontSize: "clamp(26px, 5vw, 32px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-.5px", color: primary }}>
              From one website to thousands
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {timeline.map((item, i) => {
              const last = i === timeline.length - 1;
              const dotColor = item.green ? "var(--szz-green)" : "var(--szz-accent-blue)";
              return (
                <div
                  key={item.year}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "88px 1fr",
                    gap: 24,
                    paddingBottom: last ? 0 : 28,
                    borderLeft: last ? "2px solid transparent" : "2px solid var(--szz-border)",
                    marginLeft: 42,
                    paddingLeft: 30,
                    position: "relative",
                  }}
                >
                  <span style={{ position: "absolute", left: -7, top: 2, width: 12, height: 12, borderRadius: 999, background: dotColor, border: "3px solid var(--szz-bg-deep)" }} />
                  <span style={{ fontFamily: mono, fontSize: 15, fontWeight: 700, color: dotColor }}>{item.year}</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: -3 }}>
                    <span style={{ fontFamily: display, fontSize: 17, fontWeight: 700, color: primary }}>{item.title}</span>
                    <span style={{ fontSize: 14, lineHeight: 1.6, color: muted }}>{item.body}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* sustainability — figures pull live from the same feed as the footer */}
      <section style={{ background: "var(--szz-bg-card)", padding: "80px 48px" }}>
        <div className="szz-split" style={{ maxWidth: 1100, margin: "0 auto", gap: 48 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <SectionEyebrow tone="green">Our impact</SectionEyebrow>
            <h2 style={{ margin: 0, fontFamily: display, fontSize: "clamp(26px, 5vw, 32px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-.5px", color: primary }}>
              Every plan leaves the world a little greener
            </h2>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: muted }}>
              Hosting runs on energy, and we&apos;d rather give back more than we take. A share of every
              plan funds reforestation, land restoration and the local workdays that make them happen.
              It&apos;s a small thing per account — but together it adds up, and we publish the running
              totals openly.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 10, border: "1px solid color-mix(in srgb, var(--szz-green) 35%, transparent)", borderRadius: 10, background: "color-mix(in srgb, var(--szz-green) 8%, transparent)", padding: "12px 16px", alignSelf: "flex-start" }}>
              <Leaf size={18} style={{ color: "var(--szz-green)" }} />
              <span style={{ fontSize: 14, color: light }}>Totals are live in our footer — and growing with every signup.</span>
            </div>
          </div>
          <ImpactStatCards />
        </div>
      </section>

      {/* closing CTA */}
      <section style={{ background: "var(--gradient-cta)", padding: "100px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 28, textAlign: "center" }}>
        <h2 style={{ margin: 0, maxWidth: 640, fontFamily: display, fontSize: "clamp(28px, 6vw, 42px)", fontWeight: 700, letterSpacing: "-1.5px", lineHeight: 1.1, color: primary }}>
          Come build something that lasts.
        </h2>
        <p style={{ margin: 0, maxWidth: 520, fontSize: 16, lineHeight: 1.6, color: muted }}>
          Bring your business online with hosting that&apos;s actually managed — and a founder who
          still cares how your site is doing.
        </p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          <Button asChild variant="primary" size="lg">
            <Link href="/hosting">See plans</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/support">Say hello</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
