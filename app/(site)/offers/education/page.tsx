import type { Metadata } from "next";
import { VerifyCta } from "@/components/szz/verify-cta";
import {
  Hexagon,
  FileCode,
  GitBranch,
  Sparkles,
  LayoutTemplate,
  Layout,
  SlidersHorizontal,
  Terminal,
  Palette,
  Gamepad2,
  Image as ImageIcon,
  GraduationCap,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { BreadcrumbJsonLd } from "next-seo";
import { HighlightSweep } from "@/components/szz/highlight-sweep";
import { EmojiRain } from "@/components/szz/emoji-rain";
import { breadcrumbTrail, pageMetadataFor } from "@/lib/seo";

export const metadata: Metadata = pageMetadataFor("/offers/education");

const PATH = "/offers/education";

const heading = "var(--font-heading)";
const body = "var(--font-body)";
const mono = "var(--font-mono)";

const ink = "#0B0E18";
const slate = "#475569";
const slate2 = "#64748B";
const cream = "#FBFAF6";
const hair = "#ECE7DC";

type Tile = { Icon: LucideIcon; title: string; body: string };

const engineerFeatures: Tile[] = [
  {
    Icon: Hexagon,
    title: "Node.js apps",
    body: "Run Express, Next.js, and any Node runtime as a real, always-on process — not just static files.",
  },
  {
    Icon: FileCode,
    title: "Python apps",
    body: "Host Django, Flask, and FastAPI with background workers and scheduled jobs, fully managed.",
  },
  {
    Icon: GitBranch,
    title: "GitHub connection",
    body: "Link your repo and push to deploy. Every commit ships automatically, with instant rollbacks.",
  },
];

const noCodeTools: Tile[] = [
  {
    Icon: LayoutTemplate,
    title: "SITEJET Builder",
    body: "Drag-and-drop your portfolio together — no code, designer-grade templates.",
  },
  {
    Icon: Layout,
    title: "WP Toolkit",
    body: "One-click WordPress with staging, backups, and updates handled for you.",
  },
  {
    Icon: SlidersHorizontal,
    title: "cPanel",
    body: "The familiar control panel for files, email, and domains — all in one place.",
  },
];

const steps: { n: string; title: string; body: string; green?: boolean }[] = [
  {
    n: "1",
    title: "Add your school email",
    body: "Drop in your .edu or school email — that's all we need to get started.",
  },
  {
    n: "2",
    title: "Verify with VerifyPass",
    body: "VerifyPass confirms your enrollment in seconds — no paperwork, no document uploads.",
  },
  {
    n: "3",
    title: "Save 75% + grab stickers",
    body: "Your discount runs a full 12 months and the free sticker pack ships on us.",
    green: true,
  },
];

const majors: {
  Icon: LucideIcon;
  bar: string;
  tileBg: string;
  tileColor: string;
  title: string;
  body: string;
}[] = [
  {
    Icon: Terminal,
    bar: "#2563EB",
    tileBg: "#DBEAFE",
    tileColor: "#2563EB",
    title: "Computer Science",
    body: "Deploy Node.js & Python apps, APIs, and thesis demos — straight from your GitHub repo.",
  },
  {
    Icon: Layout,
    bar: "#60A5FA",
    tileBg: "#DBEAFE",
    tileColor: "#2563EB",
    title: "Web Design",
    body: "Responsive sites & SPAs on fast global hosting. Free SSL, staging URLs, 1-click WordPress.",
  },
  {
    Icon: Palette,
    bar: "#22C55E",
    tileBg: "#DCFCE7",
    tileColor: "#16a34a",
    title: "Graphic Design",
    body: "A portfolio that loads instantly. Image-optimized CDN so hi-res work never lags.",
  },
  {
    Icon: Gamepad2,
    bar: "#F59E0B",
    tileBg: "#FEF3C7",
    tileColor: "#d97706",
    title: "Game Design",
    body: "Host playable WebGL builds & devlogs. Spin up multiplayer test servers on demand.",
  },
  {
    Icon: ImageIcon,
    bar: "#EF4444",
    tileBg: "#FEE2E2",
    tileColor: "#dc2626",
    title: "Art & Portfolio",
    body: "Your name, your domain, your gallery — a home recruiters & galleries actually visit.",
  },
  {
    Icon: GraduationCap,
    bar: "#8B5CF6",
    tileBg: "#EDE9FE",
    tileColor: "#7c3aed",
    title: "Educators & Faculty",
    body: "Host course sites, class projects, and research. Pre-K through higher ed — same 75% off.",
  },
];

const faqs: { q: string; a: string }[] = [
  {
    q: "Who's eligible?",
    a: "Enrolled college students — plus educators and professors across Pre-K, K-12, and higher ed. Verify with a valid school email.",
  },
  {
    q: "How does verification work?",
    a: "Instantly, via VerifyPass. Most schools verify with no document uploads.",
  },
  {
    q: "Which plan is the discount on?",
    a: "Only the Engineer package — our Node.js + Python app host with one-click GitHub deploys. 75% off for the full 12 months.",
  },
  {
    q: "What's the free gift?",
    a: "A free SERVERIZZ sticker pack with every verified plan — terminal-green vinyl, naturally.",
  },
  {
    q: "What happens when I graduate?",
    a: "Your 75% holds the full 12 months, then you roll to our alumni rate. Sites never go down.",
  },
  {
    q: "When does it end?",
    a: "The Back to School offer runs through September 30, 2026.",
  },
];

const eyebrow = (text: string) => (
  <span
    style={{
      fontFamily: mono,
      fontWeight: 700,
      fontSize: 13,
      letterSpacing: 2,
      textTransform: "uppercase",
      color: "#16a34a",
    }}
  >
    {text}
  </span>
);

export default function EducationOfferPage() {
  return (
    <div style={{ background: cream, fontFamily: body }}>
      <BreadcrumbJsonLd
        items={breadcrumbTrail("Students & Educators — Back to School", PATH)}
      />
      <EmojiRain />

      {/* hero */}
      <section style={{ background: cream }}>
        <div style={{ maxWidth: 880, margin: "0 auto", padding: "74px 40px 64px", textAlign: "center" }}>
          {eyebrow("// HEY_STUDENTS & EDUCATORS")}
          <h1
            style={{
              margin: "18px auto 0",
              maxWidth: 760,
              fontFamily: heading,
              fontWeight: 700,
              fontSize: "clamp(40px, 8vw, 68px)",
              lineHeight: 1.03,
              letterSpacing: "-2.5px",
              color: ink,
            }}
          >
            Your portfolio, hosted{" "}
            <HighlightSweep color="#FCD34D">75% off</HighlightSweep> all year.
          </h1>
          <p style={{ margin: "24px auto 0", maxWidth: 580, fontSize: 18, lineHeight: 1.6, color: slate }}>
            Verify with your school email and get{" "}
            <strong style={{ color: ink }}>75% off the Engineer package for 12 months</strong> — the
            plan that hosts Node.js &amp; Python apps with one-click GitHub deploys. Free sticker
            pack included.
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginTop: 32, flexWrap: "wrap" }}>
            <VerifyCta
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#2563EB",
                color: "#fff",
                fontWeight: 700,
                fontSize: 16,
                padding: "16px 30px",
                borderRadius: 10,
                textDecoration: "none",
              }}
            >
              Verify &amp; Save 75%
              <ArrowRight size={18} />
            </VerifyCta>
            <a
              href="#package"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                fontWeight: 700,
                fontSize: 16,
                color: ink,
                textDecoration: "none",
                borderBottom: `2px solid ${ink}`,
                paddingBottom: 2,
              }}
            >
              What&apos;s included
            </a>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 40, flexWrap: "wrap" }}>
            <span style={{ transform: "rotate(-3deg)", background: "#22C55E", color: "#06310f", fontFamily: mono, fontWeight: 700, fontSize: 13, letterSpacing: ".5px", padding: "9px 15px", borderRadius: 9, boxShadow: "0 6px 16px rgba(34,197,94,.28)" }}>
              NODE.JS + PYTHON
            </span>
            <span style={{ transform: "rotate(1deg)", background: "#A78BFA", color: "#2e1065", fontFamily: mono, fontWeight: 700, fontSize: 13, letterSpacing: ".5px", padding: "9px 15px", borderRadius: 9, boxShadow: "0 6px 16px rgba(167,139,250,.32)" }}>
              WEBSITE BUILDER
            </span>
            <span style={{ transform: "rotate(2deg)", background: "#60A5FA", color: "#06203f", fontFamily: mono, fontWeight: 700, fontSize: 13, letterSpacing: ".5px", padding: "9px 15px", borderRadius: 9, boxShadow: "0 6px 16px rgba(96,165,250,.3)" }}>
              FREE SSL
            </span>
            <span style={{ transform: "rotate(-2deg)", background: "#FCD34D", color: "#3d2c00", fontFamily: mono, fontWeight: 700, fontSize: 13, letterSpacing: ".5px", padding: "9px 15px", borderRadius: 9, boxShadow: "0 6px 16px rgba(245,158,11,.3)" }}>
              FREE STICKERS ★
            </span>
            <span style={{ transform: "rotate(3deg)", background: ink, color: "#fff", fontFamily: mono, fontWeight: 700, fontSize: 13, letterSpacing: ".5px", padding: "9px 15px", borderRadius: 9, boxShadow: "0 6px 16px rgba(11,14,24,.25)" }}>
              $6.25/mo
            </span>
          </div>
        </div>
      </section>

      {/* engineer package */}
      <section id="package" style={{ background: "#fff", borderTop: `1px solid ${hair}` }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "72px 40px" }}>
          <div style={{ textAlign: "center", maxWidth: 660, margin: "0 auto 40px" }}>
            {eyebrow("// THE_ENGINEER_PACKAGE")}
            <h2 style={{ margin: "14px 0 12px", fontFamily: heading, fontWeight: 700, fontSize: "clamp(28px, 5vw, 36px)", letterSpacing: "-1px", color: ink }}>
              Built for builders. <HighlightSweep color="#BBF7D0">75% off.</HighlightSweep>
            </h2>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: slate }}>
              The deal runs on our <strong style={{ color: ink }}>Engineer package</strong> — the plan
              that hosts real Node.js and Python apps and connects straight to GitHub. Coders ship from
              the repo; designers and artists build the same site with WordPress, cPanel, or the SITEJET
              drag-and-drop builder.
            </p>
          </div>

          <div style={{ background: "#F2F6FF", border: "1px solid #DBE4F5", borderRadius: 18, padding: 32 }} className="szz-grid-3">
            {engineerFeatures.map(({ Icon, title, body: copy }) => (
              <div key={title} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <span style={{ width: 46, height: 46, borderRadius: 12, background: "#fff", border: "1px solid #DBE4F5", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={22} />
                </span>
                <h3 style={{ margin: 0, fontFamily: heading, fontWeight: 700, fontSize: 18, color: ink }}>{title}</h3>
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: slate2 }}>{copy}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 18, background: cream, border: `1px solid ${hair}`, borderRadius: 18, padding: "26px 32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <span style={{ width: 30, height: 30, borderRadius: 8, background: "#FEF3C7", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Sparkles size={18} />
              </span>
              <h3 style={{ margin: 0, fontFamily: heading, fontWeight: 700, fontSize: 17, color: ink }}>
                More art than code? Build it without writing any.
              </h3>
            </div>
            <div className="szz-grid-3">
              {noCodeTools.map(({ Icon, title, body: copy }) => (
                <div key={title} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <span style={{ width: 40, height: 40, flex: "none", borderRadius: 11, background: "#fff", border: `1px solid ${hair}`, color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={20} />
                  </span>
                  <div>
                    <h4 style={{ margin: "0 0 3px", fontFamily: heading, fontWeight: 700, fontSize: 15, color: ink }}>{title}</h4>
                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: slate2 }}>{copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p style={{ textAlign: "center", margin: "24px 0 0", fontFamily: mono, fontSize: 12, color: "#94A3B8" }}>
            Engineer package · <span style={{ textDecoration: "line-through" }}>$25/mo</span>{" "}
            <strong style={{ color: "#16a34a" }}>$6.25/mo</strong>{" "}
            billed annually for verified students &amp; educators · 12 months
          </p>
        </div>
      </section>

      {/* steps */}
      <section id="how" style={{ background: "#fff", borderTop: `1px solid ${hair}` }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "72px 40px" }}>
          <h2 style={{ margin: "0 0 44px", textAlign: "center", fontFamily: heading, fontWeight: 700, fontSize: "clamp(28px, 5vw, 36px)", letterSpacing: "-1px", color: ink }}>
            Three steps. Thirty seconds.
          </h2>
          <div className="szz-grid-3" style={{ gap: 28 }}>
            {steps.map(({ n, title, body: copy, green }) => (
              <div key={n} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 14 }}>
                <span style={{ width: 60, height: 60, borderRadius: 999, background: green ? "#DCFCE7" : "#DBEAFE", color: green ? "#16a34a" : "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: heading, fontWeight: 700, fontSize: 24 }}>
                  {n}
                </span>
                <h3 style={{ margin: 0, fontFamily: heading, fontWeight: 700, fontSize: 19, color: ink }}>{title}</h3>
                <p style={{ margin: 0, maxWidth: 250, fontSize: 14, lineHeight: 1.55, color: slate2 }}>{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* by major */}
      <section id="majors" style={{ background: cream, borderTop: `1px solid ${hair}` }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "72px 40px" }}>
          <h2 style={{ margin: "0 0 6px", textAlign: "center", fontFamily: heading, fontWeight: 700, fontSize: "clamp(28px, 5vw, 36px)", letterSpacing: "-1px", color: ink }}>
            Pick your major. We&apos;ve got you.
          </h2>
          <p style={{ margin: "0 0 40px", textAlign: "center", fontSize: 15, color: slate2 }}>
            One Engineer plan, tuned for whatever you&apos;re building.
          </p>
          <div className="szz-grid-3" style={{ gap: 22 }}>
            {majors.map(({ Icon, bar, tileBg, tileColor, title, body: copy }) => (
              <div key={title} style={{ background: "#fff", border: `1px solid ${hair}`, borderRadius: 16, overflow: "hidden" }}>
                <div style={{ height: 6, background: bar }} />
                <div style={{ padding: 26, display: "flex", flexDirection: "column", gap: 12 }}>
                  <span style={{ width: 44, height: 44, borderRadius: 11, background: tileBg, color: tileColor, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={22} />
                  </span>
                  <h3 style={{ margin: 0, fontFamily: heading, fontWeight: 700, fontSize: 18, color: ink }}>{title}</h3>
                  <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: slate2 }}>{copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* faq */}
      <section id="faq" style={{ background: "#fff", borderTop: `1px solid ${hair}` }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "72px 40px" }}>
          <h2 style={{ margin: "0 0 36px", textAlign: "center", fontFamily: heading, fontWeight: 700, fontSize: "clamp(28px, 5vw, 36px)", letterSpacing: "-1px", color: ink }}>
            Got questions?
          </h2>
          <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column" }}>
            {faqs.map(({ q, a }, i) => (
              <div
                key={q}
                style={{
                  borderTop: `1px solid ${hair}`,
                  borderBottom: i === faqs.length - 1 ? `1px solid ${hair}` : undefined,
                  padding: "20px 0",
                  display: "flex",
                  gap: 18,
                }}
              >
                <span style={{ fontFamily: mono, fontSize: 13, fontWeight: 700, color: "#22C55E", flex: "none", width: 24 }}>Q.</span>
                <div>
                  <h4 style={{ margin: "0 0 5px", fontFamily: heading, fontWeight: 700, fontSize: 16, color: ink }}>{q}</h4>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: slate2 }}>{a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* final cta */}
      <section style={{ background: "#2563EB" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "74px 40px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20, textAlign: "center" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid rgba(255,255,255,.3)", background: "rgba(255,255,255,.12)", borderRadius: 999, padding: "7px 15px" }}>
            <span style={{ width: 7, height: 7, borderRadius: 999, background: "#FCD34D" }} />
            <span style={{ fontFamily: mono, fontSize: 11, letterSpacing: 1, color: "#fff" }}>OFFER ENDS SEPT 30</span>
          </span>
          <h2 style={{ margin: 0, fontFamily: heading, fontWeight: 700, fontSize: "clamp(32px, 6vw, 44px)", letterSpacing: "-1.5px", color: "#fff", maxWidth: 560 }}>
            75% off. All year. Let&apos;s go.
          </h2>
          <p style={{ margin: 0, maxWidth: 480, fontSize: 16, lineHeight: 1.6, color: "#DBEAFE" }}>
            Verify with your school email and start building today.
          </p>
          <VerifyCta
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#fff",
              color: "#2563EB",
              fontWeight: 700,
              fontSize: 16,
              padding: "15px 30px",
              borderRadius: 10,
              textDecoration: "none",
              marginTop: 4,
            }}
          >
            Verify &amp; Save 75%
            <ArrowRight size={18} />
          </VerifyCta>
        </div>
      </section>
    </div>
  );
}
