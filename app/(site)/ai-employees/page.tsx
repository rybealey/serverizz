import type { Metadata } from "next";
import Link from "next/link";
import {
  Inbox,
  Megaphone,
  Target,
  TrendingUp,
  PhoneCall,
  Scale,
  BadgePercent,
  Mail,
  Calendar,
  type LucideIcon,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInstagram,
  faFacebookF,
  faXTwitter,
  faLinkedinIn,
} from "@fortawesome/free-brands-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { BreadcrumbJsonLd } from "next-seo";
import { SectionEyebrow } from "@/components/szz/section-eyebrow";
import { Terminal } from "@/components/szz/terminal";
import { Stat } from "@/components/szz/stat";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { aiTeamLines } from "@/lib/szz-data";
import { breadcrumbTrail, pageMetadataFor } from "@/lib/seo";

export const metadata: Metadata = pageMetadataFor("/ai-employees");

const display = "var(--font-heading)";
const mono = "var(--font-mono)";
const muted = "var(--szz-text-muted)";
const primary = "var(--szz-text-primary)";
const light = "var(--szz-text-light)";
const dim = "var(--szz-text-dim)";
const blue = "var(--szz-accent-blue)";
const green = "var(--szz-green)";

// All "open a ticket" CTAs route the visitor to the login page.
const TICKET_HREF = "/login";

const roster: {
  Icon: LucideIcon;
  color: string;
  name: string;
  role: string;
  body: string;
}[] = [
  { Icon: Inbox, color: blue, name: "Eva", role: "EXECUTIVE ASSISTANT", body: "Drafts replies in your voice, filters the junk, manages your calendar, and takes meeting notes." },
  { Icon: Megaphone, color: blue, name: "Sonny", role: "COMMUNITY MANAGER", body: "Turns your social media into a lead machine — posts, schedules, and engages without you on camera." },
  { Icon: Target, color: blue, name: "Stan", role: "LEAD GENERATION", body: "Finds prospects, runs outreach and follow-ups, and keeps your pipeline full while you're out." },
  { Icon: TrendingUp, color: blue, name: "Penny", role: "SEO EXPERT", body: "Writes SEO-optimized blog posts that climb Google — keyword research, story, and timing handled." },
  { Icon: PhoneCall, color: blue, name: "Rachel", role: "RECEPTIONIST", body: "Answers your calls, knows your schedule and services, and books meetings around the clock." },
  { Icon: Scale, color: green, name: "Linda", role: "LEGAL ASSISTANT", body: "Drafts contracts, answers legal questions, and flags the risky fine print before you sign." },
];

const timeline: { time: string; tone: "blue" | "green"; title: string; body: string }[] = [
  { time: "7:00 AM", tone: "blue", title: "Eva has cleared your inbox", body: "The flood is sorted, the noise filtered, and replies are drafted in your voice — waiting for a nod." },
  { time: "11:00 AM", tone: "blue", title: "Sonny already posted", body: "A new carousel is live and next week's lineup is scheduled. You just approve and move on." },
  { time: "2:00 PM", tone: "blue", title: "Stan's filling the pipeline", body: "“Three warm leads replied this morning — want me to book the calls?” While you're out, he's prospecting." },
  { time: "5:00 PM", tone: "blue", title: "Penny put you on page one", body: "She found the keywords, shaped the story, and timed the publish. Your site's climbing the ranks." },
  { time: "7:00 PM", tone: "blue", title: "Rachel's still answering", body: "Lights off, day done — and the phone still gets picked up before the second ring. She books your next meeting." },
  { time: "11:00 PM", tone: "green", title: "Linda reviews the contract", body: "“Clause 4B leans too far toward the seller — I'd revise it.” You close the laptop; she handles the fine print." },
];

const steps: { n: string; body: string }[] = [
  { n: "01", body: "Open a ticket from your dashboard or Support page" },
  { n: "02", body: "We reply with your unique Marblism partner link" },
  { n: "03", body: "Sign up — 10% comes off every bill, for life" },
];

const integrations: { icon: LucideIcon | IconDefinition; brand?: boolean; label: string }[] = [
  { icon: Mail, label: "Gmail" },
  { icon: Mail, label: "Outlook" },
  { icon: faInstagram, brand: true, label: "Instagram" },
  { icon: faFacebookF, brand: true, label: "Facebook" },
  { icon: faXTwitter, brand: true, label: "X" },
  { icon: faLinkedinIn, brand: true, label: "LinkedIn" },
  { icon: Calendar, label: "Google Calendar" },
];

const faqs: { q: string; a: string }[] = [
  { q: "How do I get the 10% discount?", a: "Open a support ticket — we'll send your partner signup link." },
  { q: "Do I need prompting skills?", a: "No — just describe your business; the team handles the rest." },
  { q: "Is there a guarantee?", a: "Yes — Marblism offers a 7-day full money-back guarantee." },
  { q: "Can I hire just one employee?", a: "Absolutely — start with one and add the rest whenever you like." },
];

export default function AiEmployeesPage() {
  return (
    <div>
      <BreadcrumbJsonLd items={breadcrumbTrail("AI Employees", "/ai-employees")} />

      {/* hero */}
      <section className="szz-section" style={{ padding: "72px 48px 60px" }}>
        <div className="szz-hero-grid" style={{ maxWidth: 1100, margin: "0 auto", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <span style={{ fontFamily: mono, fontSize: 12, fontWeight: 600, letterSpacing: "2px" }}>
              <span style={{ color: blue }}>SERVERIZZ</span>
              <span style={{ color: dim }}> &times; </span>
              <span style={{ color: green }}>MARBLISM</span>
            </span>
            <h1 style={{ margin: 0, fontFamily: display, fontSize: "clamp(32px, 6vw, 50px)", fontWeight: 700, lineHeight: 1.06, letterSpacing: "-1.5px", color: primary }}>
              Hire an AI team. Keep your evenings.
            </h1>
            <p style={{ margin: 0, maxWidth: 540, fontSize: 17, lineHeight: 1.6, color: muted }}>
              We&rsquo;ve partnered with Marblism to bring a full team of AI Employees to your business
              — running your inbox, social, SEO, lead-gen, and calls while you focus on the work only
              you can do.
            </p>
            <span
              className="szz-badge szz-badge--success"
              style={{ alignSelf: "flex-start" }}
            >
              <BadgePercent size={14} />
              SERVERIZZ clients save 10% for life
            </span>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 4 }}>
              <Button asChild variant="primary" size="lg">
                <Link href={TICKET_HREF}>Open a ticket to claim 10%</Link>
              </Button>
            </div>
          </div>
          <Terminal title="serverizz-cli v4.2.0" lines={aiTeamLines} />
        </div>
      </section>

      {/* problem framing */}
      <section className="szz-section" style={{ background: "var(--szz-bg-card)", padding: "80px 24px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center" }}>
          <SectionEyebrow>The_problem</SectionEyebrow>
          <h2 style={{ margin: 0, fontFamily: display, fontSize: "clamp(26px, 5vw, 34px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-.5px", color: primary }}>
            You&rsquo;re CEO, marketer, sales rep, and support — all before lunch.
          </h2>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.65, color: muted }}>
            A hundred unread emails. Socials that haven&rsquo;t been touched in weeks. Leads going cold.
            Everything pushed to &ldquo;next week.&rdquo; Running a small business means wearing every
            hat — and dropping a few. Your AI team picks them up.
          </p>
        </div>
      </section>

      {/* the roster */}
      <section className="szz-section" style={{ background: "var(--szz-bg-deep)", padding: "80px 48px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center", marginBottom: 12 }}>
            <SectionEyebrow slashes={false}>Meet the team</SectionEyebrow>
            <h2 style={{ margin: 0, fontFamily: display, fontSize: "clamp(26px, 5vw, 34px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-.5px", color: primary }}>
              Six AI Employees. One flat subscription.
            </h2>
            <p style={{ margin: 0, maxWidth: 580, fontSize: 16, lineHeight: 1.6, color: muted }}>
              Hire the whole team or just the one you need. They work 24/7 and learn your voice as they go.
            </p>
          </div>
          <div className="szz-grid-3" style={{ gap: 18 }}>
            {roster.map(({ Icon, color, name, role, body }) => (
              <Card key={name} interactive>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <span
                    aria-hidden
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 44,
                      height: 44,
                      borderRadius: 999,
                      background: color === green ? "var(--signal-success-fill)" : "var(--accent-fill)",
                      color,
                    }}
                  >
                    <Icon size={20} />
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <span style={{ fontFamily: display, fontSize: 19, fontWeight: 700, color: primary }}>{name}</span>
                    <span style={{ fontFamily: mono, fontSize: 11, fontWeight: 600, letterSpacing: "1px", color }}>{role}</span>
                  </div>
                  <span style={{ fontSize: 14, lineHeight: 1.55, color: muted }}>{body}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* a day on the job */}
      <section className="szz-section" style={{ background: "var(--szz-bg-card)", padding: "80px 48px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
            <SectionEyebrow>A day on the job</SectionEyebrow>
            <h2 style={{ margin: 0, fontFamily: display, fontSize: "clamp(26px, 5vw, 34px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-.5px", color: primary }}>
              While you live your life, they run the business
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {timeline.map((t, i) => (
              <div
                key={t.time}
                style={{
                  display: "grid",
                  gridTemplateColumns: "92px 1fr",
                  gap: 18,
                  padding: "18px 0",
                  borderTop: i === 0 ? "none" : "1px solid var(--szz-border)",
                }}
              >
                <span style={{ fontFamily: mono, fontSize: 13, fontWeight: 600, color: t.tone === "green" ? green : blue }}>
                  {t.time}
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontFamily: display, fontSize: 16, fontWeight: 700, color: primary }}>{t.title}</span>
                  <span style={{ fontSize: 14, lineHeight: 1.55, color: muted }}>{t.body}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* stats */}
      <section style={{ display: "flex", justifyContent: "center", gap: 64, flexWrap: "wrap", padding: "70px 24px", background: "var(--szz-bg-deep)" }}>
        <Stat value="4.8★" label="average rating" variant="display" center />
        <Stat value="40,000+" label="businesses scaling" variant="display" center />
        <Stat value="24/7" label="always on the clock" variant="display" center />
        <Stat value="7-day" label="money-back guarantee" variant="display" center />
      </section>

      {/* integrations */}
      <section className="szz-section" style={{ background: "var(--szz-bg-card)", padding: "80px 24px" }}>
        <div style={{ maxWidth: 820, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center" }}>
          <SectionEyebrow slashes={false}>Plugs right in</SectionEyebrow>
          <h2 style={{ margin: 0, fontFamily: display, fontSize: "clamp(24px, 5vw, 32px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-.5px", color: primary }}>
            Works with the tools you already use
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12, marginTop: 8 }}>
            {integrations.map((it) => (
              <span
                key={it.label}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 16px",
                  borderRadius: 999,
                  border: "1px solid var(--szz-border)",
                  background: "var(--szz-bg-deep)",
                  fontSize: 14,
                  color: light,
                }}
              >
                {it.brand ? (
                  <FontAwesomeIcon icon={it.icon as IconDefinition} style={{ fontSize: 16, color: blue }} />
                ) : (
                  (() => {
                    const Icon = it.icon as LucideIcon;
                    return <Icon size={16} style={{ color: blue }} />;
                  })()
                )}
                {it.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* SERVERIZZ perk */}
      <section className="szz-section" style={{ background: "var(--szz-bg-deep)", padding: "80px 48px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Card glow>
            <div className="szz-split" style={{ gridTemplateColumns: "1.3fr 1fr", gap: 40 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <SectionEyebrow tone="green" slashes={false}>SERVERIZZ exclusive</SectionEyebrow>
                <h2 style={{ margin: 0, fontFamily: display, fontSize: "clamp(24px, 5vw, 32px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-.5px", color: primary }}>
                  Save 10% for life — just for being with us
                </h2>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: muted }}>
                  As a SERVERIZZ customer, your Marblism subscription is 10% off for as long as you keep
                  it. To claim it, open a support ticket and your account manager will send your exclusive
                  partner signup link.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 4 }}>
                  {steps.map((s) => (
                    <div key={s.n} style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
                      <span style={{ fontFamily: mono, fontSize: 14, fontWeight: 700, color: green, flex: "none" }}>{s.n}</span>
                      <span style={{ fontSize: 15, lineHeight: 1.5, color: light }}>{s.body}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 8 }}>
                  <Button asChild variant="primary" size="lg">
                    <Link href={TICKET_HREF}>Open a ticket to claim 10%</Link>
                  </Button>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  border: "1px solid var(--szz-border)",
                  borderRadius: 12,
                  padding: "32px 24px",
                }}
              >
                <span style={{ fontFamily: mono, fontSize: 11, fontWeight: 600, letterSpacing: "1.5px", color: dim }}>
                  PARTNER DISCOUNT
                </span>
                <span style={{ fontFamily: display, fontSize: 64, fontWeight: 800, lineHeight: 1, color: green }}>10%</span>
                <span style={{ fontSize: 14, color: muted }}>off, for life</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="szz-section" style={{ background: "var(--szz-bg-card)", padding: "80px 24px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
          <h2 style={{ margin: "0 0 8px", fontFamily: display, fontSize: "clamp(24px, 5vw, 32px)", fontWeight: 700, letterSpacing: "-.5px", color: primary }}>
            Partnership questions
          </h2>
          {faqs.map((f) => (
            <div key={f.q} style={{ display: "flex", flexDirection: "column", gap: 6, borderTop: "1px solid var(--szz-border)", paddingTop: 16 }}>
              <span style={{ fontFamily: display, fontSize: 16, fontWeight: 700, color: primary }}>{f.q}</span>
              <span style={{ fontSize: 15, lineHeight: 1.55, color: muted }}>{f.a}</span>
            </div>
          ))}
        </div>
      </section>

      {/* closing CTA */}
      <section style={{ background: "var(--gradient-cta)", padding: "100px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 24, textAlign: "center" }}>
        <h2 style={{ margin: 0, maxWidth: 640, fontFamily: display, fontSize: "clamp(28px, 6vw, 42px)", fontWeight: 700, letterSpacing: "-1.5px", lineHeight: 1.1, color: primary }}>
          Your AI team is ready to clock in.
        </h2>
        <p style={{ margin: 0, maxWidth: 560, fontSize: 16, lineHeight: 1.6, color: muted }}>
          Claim your 10%-for-life discount and put Eva, Sonny, Stan, Penny, Rachel and Linda to work today.
        </p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          <Button asChild variant="primary" size="lg">
            <Link href={TICKET_HREF}>Open a ticket to claim 10%</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/support">Talk to us</Link>
          </Button>
        </div>
        <p style={{ margin: 0, fontFamily: mono, fontSize: 12, color: dim }}>
          In partnership with Marblism &middot; 40,000+ businesses
        </p>
      </section>
    </div>
  );
}
