import Link from "next/link";
import { Globe, LayoutTemplate, AtSign } from "lucide-react";
import { SectionEyebrow } from "@/components/szz/section-eyebrow";
import { Terminal } from "@/components/szz/terminal";
import { Stat } from "@/components/szz/stat";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { heroLines } from "@/lib/szz-data";

const display = "var(--font-heading)";
const muted = "var(--szz-text-muted)";
const primary = "var(--szz-text-primary)";

const products = [
  {
    href: "/hosting",
    Icon: Globe,
    iconColor: "var(--szz-accent-blue)",
    title: "Web Hosting",
    body: "One fast, managed home for your website — with free email mailboxes on your domain.",
    price: "from $15/mo →",
    priceColor: "var(--szz-accent-blue)",
  },
  {
    href: "/wordpress",
    Icon: LayoutTemplate,
    iconColor: "var(--szz-accent-blue)",
    title: "WordPress",
    body: "Managed WordPress that updates, backs up and secures itself. You just write and sell.",
    price: "from $15/mo →",
    priceColor: "var(--szz-accent-blue)",
  },
  {
    href: "/domains",
    Icon: AtSign,
    iconColor: "var(--szz-green)",
    title: "Domains",
    body: "Search, register and transfer across 400+ extensions — with free WHOIS privacy.",
    price: "from $9 →",
    priceColor: "var(--szz-green)",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* hero */}
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 28,
          padding: "90px 24px 70px",
          maxWidth: 920,
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <SectionEyebrow>Managed hosting for small business</SectionEyebrow>
        <h1
          style={{
            margin: 0,
            fontFamily: display,
            fontSize: "clamp(36px, 7vw, 64px)",
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-2px",
            color: primary,
          }}
        >
          Start with your domain.
        </h1>
        <p style={{ margin: 0, maxWidth: 560, fontSize: 18, lineHeight: 1.6, color: muted }}>
          Claim your name, then launch a fast, fully-managed website on it — email, SSL and
          backups included. No servers to babysit.
        </p>
        <div className="szz-inline-search" style={{ display: "flex", gap: 10, width: "100%", maxWidth: 560 }}>
          <div style={{ flex: 1 }}>
            <Input mono placeholder="find yourbakery.com" aria-label="Search for a domain" />
          </div>
          <Button asChild variant="primary" size="lg">
            <Link href="/domains">Search</Link>
          </Button>
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--szz-text-dim)" }}>
          .com <span style={{ color: "var(--szz-accent-blue)" }}>$11</span> &nbsp;·&nbsp; .co{" "}
          <span style={{ color: "var(--szz-accent-blue)" }}>$24</span> &nbsp;·&nbsp; .io{" "}
          <span style={{ color: "var(--szz-accent-blue)" }}>$39</span> &nbsp;·&nbsp; .org{" "}
          <span style={{ color: "var(--szz-accent-blue)" }}>$13</span> &nbsp;—&nbsp;{" "}
          <Link
            href="/domains"
            className="szz-link-accent"
            style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--szz-text-light)" }}
          >
            already own one? bring it free →
          </Link>
        </div>
      </section>

      {/* trust stats */}
      <section
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 64,
          flexWrap: "wrap",
          padding: "0 24px 80px",
        }}
      >
        <Stat value="2,400+" label="small businesses hosted" variant="display" center />
        <Stat value="99.9%" label="uptime, every month" variant="display" center />
        <Stat value="<1s" label="average page load" variant="display" center />
        <Stat value="$0" label="to migrate your site" variant="display" center />
      </section>

      {/* products */}
      <section className="szz-section" style={{ background: "var(--szz-bg-card)" }}>
        <div className="szz-container" style={{ display: "flex", flexDirection: "column", gap: 48 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center" }}>
            <SectionEyebrow>Products</SectionEyebrow>
            <h2 style={{ margin: 0, fontFamily: display, fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 700, lineHeight: 1.12, letterSpacing: "-1px", color: primary }}>
              Everything for your name
            </h2>
            <p style={{ margin: 0, fontSize: 16, color: muted }}>
              Three simple products. Email comes free with every hosting plan.
            </p>
          </div>
          <div className="szz-grid-3 fill-cards">
            {products.map(({ href, Icon, iconColor, title, body, price, priceColor }) => (
              <Link key={title} href={href} style={{ minWidth: 0 }}>
                <Card surface="deep" interactive style={{ height: "100%" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14, height: "100%" }}>
                    <div style={{ width: 48, height: 48, borderRadius: 10, background: "var(--szz-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={24} style={{ color: iconColor }} />
                    </div>
                    <h3 style={{ margin: 0, fontFamily: display, fontSize: 20, fontWeight: 700, color: primary }}>
                      {title}
                    </h3>
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: muted }}>{body}</p>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: priceColor, marginTop: "auto" }}>
                      {price}
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* why / managed */}
      <section className="szz-section" style={{ background: "var(--szz-bg-deep)" }}>
        <div className="szz-container" style={{ display: "flex", flexDirection: "column", gap: 48 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 640 }}>
            <SectionEyebrow>Why_Serverizz</SectionEyebrow>
            <h2 style={{ margin: 0, fontFamily: display, fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 700, lineHeight: 1.12, letterSpacing: "-1px", color: primary }}>
              &ldquo;Managed&rdquo; should mean we actually manage it.
            </h2>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: muted }}>
              No servers to patch, no surprise bills, no support mazes. Hand us the boring parts and
              get on with running your business.
            </p>
          </div>
          <div style={{ display: "flex", gap: 20, alignItems: "stretch", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 300, display: "flex", flexDirection: "column", gap: 20 }}>
              <Card>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <SectionEyebrow tone="green" slashes={false}>We move you in — free</SectionEyebrow>
                  <h3 style={{ margin: 0, fontFamily: display, fontSize: 22, fontWeight: 700, letterSpacing: "-.5px", color: primary }}>
                    Free, hands-off migration
                  </h3>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: muted }}>
                    Send your current host login. We copy everything, test it, and flip the switch
                    with zero downtime.
                  </p>
                </div>
              </Card>
              <Card>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <SectionEyebrow tone="green" slashes={false}>A human on your account</SectionEyebrow>
                  <h3 style={{ margin: 0, fontFamily: display, fontSize: 22, fontWeight: 700, letterSpacing: "-.5px", color: primary }}>
                    Dedicated account manager
                  </h3>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: muted }}>
                    Every plan gets one real person who knows your setup — not a queue of strangers.
                  </p>
                </div>
              </Card>
            </div>
            <div className="fill-cards" style={{ flex: 1, minWidth: 300 }}>
              <Card glow style={{ height: "100%" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 20, justifyContent: "center", height: "100%" }}>
                  <SectionEyebrow tone="accent" slashes={false}>Set it and forget it</SectionEyebrow>
                  <h3 style={{ margin: 0, fontFamily: display, fontSize: 30, fontWeight: 700, lineHeight: 1.1, letterSpacing: "-1px", color: primary }}>
                    Backed up daily.
                    <br />
                    Secured automatically.
                  </h3>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: muted }}>
                    Automatic daily backups kept for 30 days, free SSL, malware scanning and updates
                    — all handled for you.
                  </p>
                  <div style={{ display: "flex", gap: 40, flexWrap: "wrap", paddingTop: 4 }}>
                    {[
                      ["30 days", "backup history"],
                      ["1-click", "restore"],
                      ["Free", "SSL + CDN"],
                    ].map(([v, l]) => (
                      <div key={l} style={{ display: "flex", flexDirection: "column", gap: 4, flex: "none" }}>
                        <span style={{ whiteSpace: "nowrap", fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700, color: "var(--szz-accent-blue)" }}>
                          {v}
                        </span>
                        <span style={{ fontSize: 12, color: "var(--szz-text-dim)" }}>{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
          <Terminal title="serverizz-cli v4.2.0" lines={heroLines} />
        </div>
      </section>

      {/* pricing teaser */}
      <section className="szz-section" style={{ background: "var(--szz-bg-card)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 40, alignItems: "center", textAlign: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <SectionEyebrow>Pricing</SectionEyebrow>
            <h2 style={{ margin: 0, fontFamily: display, fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 700, lineHeight: 1.12, letterSpacing: "-1px", color: primary }}>
              Two plans. That&apos;s it.
            </h2>
            <p style={{ margin: 0, fontSize: 16, color: muted }}>
              Start small, or bring your own code. Switch any time.
            </p>
          </div>
          <div className="szz-grid-2 fill-cards" style={{ width: "100%" }}>
            <Card popular>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, textAlign: "left" }}>
                <span style={{ fontFamily: display, fontSize: 22, fontWeight: 700, color: primary }}>Entrepreneur</span>
                <span style={{ fontSize: 13, color: muted }}>For small businesses &amp; their websites</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 30, color: "var(--szz-accent-blue)" }}>
                  $15<span style={{ fontSize: 14, color: "var(--szz-text-dim)" }}>/mo</span>
                </span>
              </div>
            </Card>
            <Card>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, textAlign: "left" }}>
                <span style={{ fontFamily: display, fontSize: 22, fontWeight: 700, color: primary }}>Engineer</span>
                <span style={{ fontSize: 13, color: muted }}>Adds Node.js &amp; Python app hosting</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 30, color: primary }}>
                  $25<span style={{ fontSize: 14, color: "var(--szz-text-dim)" }}>/mo</span>
                </span>
              </div>
            </Card>
          </div>
          <Button asChild variant="outline" size="lg">
            <Link href="/hosting">Compare plans →</Link>
          </Button>
        </div>
      </section>

      {/* final CTA */}
      <section
        style={{
          background: "var(--gradient-cta)",
          padding: "110px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 32,
          textAlign: "center",
        }}
      >
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 12, border: "1px solid var(--szz-border)", background: "var(--szz-bg-card)", padding: "10px 18px" }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--szz-green)" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--szz-text-dim)" }}>ready when you are</span>
        </div>
        <h2 style={{ margin: 0, maxWidth: 680, fontFamily: display, fontSize: "clamp(30px, 6vw, 48px)", fontWeight: 700, letterSpacing: "-2px", lineHeight: 1.08, color: primary }}>
          Get your business online this afternoon.
        </h2>
        <p style={{ margin: 0, maxWidth: 560, fontSize: 16, lineHeight: 1.6, color: muted }}>
          Pick a name, choose a plan, and we&apos;ll handle the rest — migration included. 30-day
          money-back guarantee.
        </p>
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
