import type { Metadata } from "next";
import { Fragment, type ReactNode } from "react";
import { getPopularKbTopics, getSupportTicketTypes } from "@/lib/clientexec";
import { SupportForm } from "@/components/szz/support-form";
import { UserRound, Mail, Activity, type LucideIcon } from "lucide-react";
import { BreadcrumbJsonLd } from "next-seo";
import { SectionEyebrow } from "@/components/szz/section-eyebrow";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { BadgeProps } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { breadcrumbTrail, pageMetadata } from "@/lib/seo";
import { getSystemStatus, type SystemStatusLevel } from "@/lib/uptime-kuma";

export const metadata: Metadata = pageMetadata({
  title: "Support",
  description:
    "How can we help? A real account manager on every plan, 24/7 email tickets and a live status page.",
  path: "/support",
});

const display = "var(--font-heading)";
const muted = "var(--szz-text-muted)";
const primary = "var(--szz-text-primary)";

// Cloudflare's always-pass test site key — overridden by env in real environments.
const TEST_SITE_KEY = "1x00000000000000000000AA";

const channels: {
  Icon: LucideIcon;
  title: string;
  body: string;
  badge?: ReactNode;
  note?: string;
  href?: string;
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
    // badge is injected dynamically from the live status page (see SupportPage).
    href: "https://status.serverizz.com",
  },
];

const STATUS_VARIANT: Record<SystemStatusLevel, NonNullable<BadgeProps["variant"]>> = {
  operational: "success",
  maintenance: "warning",
  degraded: "warning",
  down: "error",
  unknown: "neutral",
};

export default async function SupportPage() {
  const [topics, ticketTypes, status] = await Promise.all([
    getPopularKbTopics(),
    getSupportTicketTypes(),
    getSystemStatus(),
  ]);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? TEST_SITE_KEY;
  const statusBadge = (
    <Badge variant={STATUS_VARIANT[status.level]} dot>
      {status.label}
    </Badge>
  );
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
          {channels.map(({ Icon, title, body, badge, note, href }) => {
            const effectiveBadge = title === "Status & uptime" ? statusBadge : badge;
            const card = (
              <Card interactive style={{ height: "100%" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start", height: "100%" }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: "var(--szz-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={20} style={{ color: "var(--szz-accent-blue)" }} />
                  </div>
                  <span style={{ fontFamily: display, fontSize: 19, fontWeight: 700, color: primary }}>{title}</span>
                  <span style={{ fontSize: 14, lineHeight: 1.5, color: muted }}>{body}</span>
                  {effectiveBadge && <div style={{ marginTop: "auto" }}>{effectiveBadge}</div>}
                  {note && <span style={{ marginTop: effectiveBadge ? undefined : "auto", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--szz-text-dim)" }}>{note}</span>}
                </div>
              </Card>
            );
            return href ? (
              <a key={title} href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>
                {card}
              </a>
            ) : (
              <Fragment key={title}>{card}</Fragment>
            );
          })}
        </div>
      </section>

      {/* form + sidebar */}
      <section style={{ padding: "60px 48px 90px" }}>
        <div className="szz-form-grid" style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Card>
            <SupportForm turnstileSiteKey={siteKey} ticketTypes={ticketTypes} />
          </Card>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <Card>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <span style={{ fontFamily: display, fontSize: 18, fontWeight: 700, color: primary }}>Popular help topics</span>
                {topics.map((t) => (
                  <a
                    key={t.href}
                    href={t.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="szz-link-accent"
                    style={{ fontSize: 14 }}
                  >
                    → {t.title}
                  </a>
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
