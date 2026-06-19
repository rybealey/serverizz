import type { Metadata } from "next";
import Link from "next/link";
import {
  History,
  Activity,
  Lock,
  RefreshCw,
  UserRoundCheck,
  LayoutDashboard,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { BreadcrumbJsonLd } from "next-seo";
import { SectionEyebrow } from "@/components/szz/section-eyebrow";
import { Terminal } from "@/components/szz/terminal";
import { Stat } from "@/components/szz/stat";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { heroLines } from "@/lib/szz-data";
import { breadcrumbTrail, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Why SERVERIZZ",
  description:
    "“Managed” should mean we actually manage it. Free migration, daily backups, 99.9% uptime and a dedicated account manager on every plan.",
  path: "/why",
});

const display = "var(--font-heading)";
const muted = "var(--szz-text-muted)";
const primary = "var(--szz-text-primary)";
const light = "var(--szz-text-light)";

const restorePoints = ["today 03:00", "yesterday 03:00", "2 days ago 03:00"];

const sixUp: {
  Icon: LucideIcon;
  color: string;
  title: string;
  body: string;
  interactive?: boolean;
}[] = [
  { Icon: Activity, color: "var(--szz-accent-blue)", title: "99.9% uptime", body: "Backed by an SLA you can actually read." },
  { Icon: Lock, color: "var(--szz-accent-blue)", title: "Free SSL forever", body: "Auto-issued and auto-renewed." },
  { Icon: RefreshCw, color: "var(--szz-accent-blue)", title: "Auto updates", body: "Security patches applied for you." },
  { Icon: UserRoundCheck, color: "var(--szz-green)", title: "Dedicated account manager", body: "One person who knows your setup — on every plan.", interactive: true },
  { Icon: LayoutDashboard, color: "var(--szz-accent-blue)", title: "Simple control panel", body: "Everything in plain language." },
  { Icon: Wallet, color: "var(--szz-accent-blue)", title: "Fair, flat pricing", body: "The price you see is the price you pay." },
];

export default function WhyPage() {
  return (
    <div>
      <BreadcrumbJsonLd items={breadcrumbTrail("Why SERVERIZZ", "/why")} />
      {/* hero */}
      <section style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, padding: "80px 24px 50px", maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
        <SectionEyebrow>Why_Serverizz</SectionEyebrow>
        <h1 style={{ margin: 0, fontFamily: display, fontSize: "clamp(32px, 6vw, 48px)", fontWeight: 700, lineHeight: 1.08, letterSpacing: "-1.5px", color: primary }}>
          &ldquo;Managed&rdquo; should mean we actually manage it.
        </h1>
        <p style={{ margin: 0, maxWidth: 560, fontSize: 17, lineHeight: 1.6, color: muted }}>
          No servers to patch, no surprise bills, no support mazes. Hand us the boring parts and get
          on with running your business.
        </p>
      </section>

      {/* stats */}
      <section style={{ display: "flex", justifyContent: "center", gap: 64, flexWrap: "wrap", padding: "0 24px 70px" }}>
        <Stat value="99.9%" label="uptime, every month" variant="display" center />
        <Stat value="2,400+" label="small businesses" variant="display" center />
        <Stat value="24/7" label="ticket support" variant="display" center />
        <Stat value="$0" label="to migrate in" variant="display" center />
      </section>

      {/* alternating row 1 */}
      <section className="szz-section" style={{ background: "var(--szz-bg-card)", padding: "80px 48px" }}>
        <div className="szz-split" style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <SectionEyebrow tone="green" slashes={false}>We move you in — free</SectionEyebrow>
            <h2 style={{ margin: 0, fontFamily: display, fontSize: "clamp(26px, 5vw, 32px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-.5px", color: primary }}>
              Switch hosts without lifting a finger
            </h2>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: muted }}>
              Send us your current host login. We copy everything, test it on a staging URL, and flip
              the switch with zero downtime. Your account manager runs the whole move.
            </p>
          </div>
          <Terminal title="migration in progress" lines={heroLines} />
        </div>
      </section>

      {/* alternating row 2 */}
      <section className="szz-section" style={{ background: "var(--szz-bg-deep)", padding: "80px 48px" }}>
        <div className="szz-split" style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Card glow>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <History size={20} style={{ color: "var(--szz-accent-blue)" }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: light }}>restore points · last 30 days</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {restorePoints.map((rp) => (
                  <div key={rp} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid var(--szz-border)", borderRadius: 8, padding: "10px 14px", fontSize: 13 }}>
                    <span style={{ fontFamily: "var(--font-mono)", color: light }}>{rp}</span>
                    <span style={{ color: "var(--szz-green)" }}>✓ verified</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <SectionEyebrow tone="accent" slashes={false}>Set it and forget it</SectionEyebrow>
            <h2 style={{ margin: 0, fontFamily: display, fontSize: "clamp(26px, 5vw, 32px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-.5px", color: primary }}>
              Backed up every single day
            </h2>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: muted }}>
              Automatic daily backups kept for 30 days. Made a mistake or got hacked? Roll the whole
              site back to any day in one click — no support ticket required.
            </p>
          </div>
        </div>
      </section>

      {/* 6-up */}
      <section className="szz-section" style={{ background: "var(--szz-bg-card)", padding: "80px 48px" }}>
        <div className="szz-grid-3" style={{ maxWidth: 1100, margin: "0 auto", gap: 18 }}>
          {sixUp.map(({ Icon, color, title, body, interactive }) => (
            <Card key={title} interactive={interactive}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Icon size={20} style={{ color }} />
                <span style={{ fontFamily: display, fontSize: 18, fontWeight: 700, color: primary }}>{title}</span>
                <span style={{ fontSize: 13, lineHeight: 1.5, color: muted }}>{body}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "var(--gradient-cta)", padding: "100px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 28, textAlign: "center" }}>
        <h2 style={{ margin: 0, maxWidth: 640, fontFamily: display, fontSize: "clamp(28px, 6vw, 42px)", fontWeight: 700, letterSpacing: "-1.5px", lineHeight: 1.1, color: primary }}>
          Spend your time on the business, not the server.
        </h2>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          <Button asChild variant="primary" size="lg">
            <Link href="/hosting">See plans</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/support">Talk to us</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
