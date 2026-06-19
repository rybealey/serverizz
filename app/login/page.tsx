import type { Metadata } from "next";
import Link from "next/link";
import { Gauge, DatabaseBackup, ShieldCheck, type LucideIcon } from "lucide-react";
import { TerminalLogo } from "@/components/szz/terminal-logo";
import { SectionEyebrow } from "@/components/szz/section-eyebrow";
import { LoginForm } from "@/components/szz/login-form";
import { buildLoginUrl, buildForgotPasswordUrl } from "@/lib/clientexec";
import { isLoggedOut } from "@/lib/login";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your SERVERIZZ account.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/login" },
};

// Cloudflare's always-pass test site key — overridden by env in real environments.
const TEST_SITE_KEY = "1x00000000000000000000AA";

const features: { Icon: LucideIcon; color: string; text: string }[] = [
  { Icon: Gauge, color: "var(--szz-accent-blue)", text: "Real-time site health & uptime" },
  { Icon: DatabaseBackup, color: "var(--szz-accent-blue)", text: "One-click backups & restores" },
  { Icon: ShieldCheck, color: "var(--szz-green)", text: "Free SSL, security & 2FA built in" },
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const loggedOut = isLoggedOut(await searchParams);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? TEST_SITE_KEY;
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--szz-bg-deep)" }}>
      {/* left brand panel */}
      <div
        className="szz-login-aside"
        style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 40, padding: "56px 64px", background: "linear-gradient(135deg,#0B0E18 0%,#111827 50%,#0F172A 100%)", borderRight: "1px solid var(--szz-border)" }}
      >
        <Link href="/" aria-label="SERVERIZZ home" style={{ alignSelf: "flex-start" }}>
          <TerminalLogo size={28} />
        </Link>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <SectionEyebrow>Welcome_back</SectionEyebrow>
          <h1 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: 40, fontWeight: 700, lineHeight: 1.1, letterSpacing: "-1.5px", color: "#fff" }}>
            Your sites, email &amp; <br />billing — one login.
          </h1>
          <p style={{ margin: 0, maxWidth: 420, fontSize: 16, lineHeight: 1.6, color: "var(--szz-text-muted)" }}>
            Manage hosting, domains and mailboxes from a single dashboard — with your account manager a click away.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 4 }}>
            {features.map(({ Icon, color, text }) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Icon size={18} style={{ color }} />
                <span style={{ fontSize: 14, color: "var(--szz-text-light)" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
        <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--szz-text-faint)" }}>
          © 2026 Rizz Enterprises, LLC
        </span>
      </div>

      {/* right form panel */}
      <div style={{ width: 560, maxWidth: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "56px 64px", background: "var(--szz-bg-card)" }}>
        <LoginForm
          ceLoginUrl={buildLoginUrl()}
          ceForgotUrl={buildForgotPasswordUrl()}
          ceSignupUrl="/register"
          turnstileSiteKey={siteKey}
          loggedOut={loggedOut}
        />
      </div>
    </div>
  );
}
