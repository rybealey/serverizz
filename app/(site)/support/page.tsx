import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { UserRound, Mail, Activity, type LucideIcon } from "lucide-react";
import { BreadcrumbJsonLd } from "next-seo";
import { SectionEyebrow } from "@/components/szz/section-eyebrow";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { breadcrumbTrail, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Support",
  description:
    "How can we help? A real account manager on every plan, 24/7 email tickets and a live status page.",
  path: "/support",
});

const display = "var(--font-heading)";
const muted = "var(--szz-text-muted)";
const primary = "var(--szz-text-primary)";
const light = "var(--szz-text-light)";

const channels: {
  Icon: LucideIcon;
  title: string;
  body: string;
  badge?: ReactNode;
  note?: string;
}[] = [
  {
    Icon: UserRound,
    title: "Your account manager",
    body: "A real person who knows your account — by name.",
    badge: <Badge variant="success" dot>Assigned on every plan</Badge>,
  },
  {
    Icon: Mail,
    title: "Email a ticket",
    body: "help@serverizz.com — open 24/7.",
    note: "replies within the hour",
  },
  {
    Icon: Activity,
    title: "Status & uptime",
    body: "status.serverizz.com",
    badge: <Badge variant="success" dot>All systems operational</Badge>,
  },
];

const topics = [
  { label: "→ Migrate my site to SERVERIZZ", href: "/wordpress" },
  { label: "→ Set up email on my domain", href: "/domains" },
  { label: "→ Point a domain I own", href: "/domains" },
  { label: "→ Restore from a backup", href: "/why" },
];

export default function SupportPage() {
  return (
    <div>
      <BreadcrumbJsonLd items={breadcrumbTrail("Support", "/support")} />
      {/* hero */}
      <section style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22, padding: "80px 24px 50px", maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
        <SectionEyebrow>Support</SectionEyebrow>
        <h1 style={{ margin: 0, fontFamily: display, fontSize: "clamp(32px, 6vw, 48px)", fontWeight: 700, lineHeight: 1.08, letterSpacing: "-1.5px", color: primary }}>
          How can we help?
        </h1>
        <form className="szz-inline-search" style={{ display: "flex", gap: 10, width: "100%", maxWidth: 520 }}>
          <div style={{ flex: 1 }}>
            <Input placeholder="Search help articles…" aria-label="Search help articles" />
          </div>
          <Button type="submit" variant="primary" size="lg">Search</Button>
        </form>
      </section>

      {/* channels */}
      <section style={{ padding: "0 48px 20px" }}>
        <div className="szz-grid-3" style={{ maxWidth: 1100, margin: "0 auto", gap: 18 }}>
          {channels.map(({ Icon, title, body, badge, note }) => (
            <Card key={title} interactive>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: "var(--szz-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={20} style={{ color: "var(--szz-accent-blue)" }} />
                </div>
                <span style={{ fontFamily: display, fontSize: 19, fontWeight: 700, color: primary }}>{title}</span>
                <span style={{ fontSize: 14, lineHeight: 1.5, color: muted }}>{body}</span>
                {badge}
                {note && <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--szz-text-dim)" }}>{note}</span>}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* form + sidebar */}
      <section style={{ padding: "60px 48px 90px" }}>
        <div className="szz-form-grid" style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Card>
            <form style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <h2 style={{ margin: 0, fontFamily: display, fontSize: 22, fontWeight: 700, color: primary }}>Send us a message</h2>
              <div className="szz-grid-2" style={{ gap: 14 }}>
                <Input label="Name" placeholder="Jane Baker" />
                <Input label="Email" type="email" placeholder="jane@mybakery.com" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500, color: light }}>Topic</span>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 44, background: "var(--szz-bg-deep)", border: "1px solid var(--szz-border)", borderRadius: 8, padding: "0 14px", fontSize: 14, color: muted }}>
                  Billing · Technical · Sales <span style={{ color: "var(--szz-text-dim)" }}>▾</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500, color: light }}>Message</span>
                <textarea
                  placeholder="Tell us what's up…"
                  style={{ minHeight: 120, background: "var(--szz-bg-deep)", border: "1px solid var(--szz-border)", borderRadius: 8, padding: "12px 14px", fontFamily: "var(--font-body)", fontSize: 14, color: primary, resize: "vertical", outline: "none" }}
                />
              </div>
              <div>
                <Button type="submit" variant="primary" size="lg">Send message</Button>
              </div>
            </form>
          </Card>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <Card>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <span style={{ fontFamily: display, fontSize: 18, fontWeight: 700, color: primary }}>Popular help topics</span>
                {topics.map((t) => (
                  <Link key={t.label} href={t.href} className="szz-link-accent" style={{ fontSize: 14 }}>
                    {t.label}
                  </Link>
                ))}
              </div>
            </Card>
            <Card>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontFamily: display, fontSize: 18, fontWeight: 700, color: primary }}>Hours</span>
                <span style={{ fontSize: 14, lineHeight: 1.6, color: muted }}>
                  Tickets: 24/7, every day.
                  <br />
                  Account manager: Mon–Fri, 8am–8pm CT.
                </span>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
