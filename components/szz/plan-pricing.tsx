"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const display = "var(--font-heading)";
const muted = "var(--szz-text-muted)";
const primary = "var(--szz-text-primary)";
const light = "var(--szz-text-light)";

const entFeatures = [
  "Up to 4 websites",
  "25 GB SSD · unmetered bandwidth",
  "25 email mailboxes",
  "10 MySQL databases",
  "Free SSL, daily backups & migration",
  "Dedicated account manager",
];
const engFeatures = [
  "Node.js & Python apps — 10 slots",
  "Jailed SSH + Git deploy",
  "Unlimited sites, mailboxes & databases",
  "75 GB SSD · unmetered bandwidth",
  "Remote MySQL & full DNS control",
  "Dedicated account manager",
];

function Check() {
  return <span style={{ color: "var(--szz-green)", fontWeight: 700 }}>✓</span>;
}

function FeatureRow({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: light }}>
      <Check /> {label}
    </div>
  );
}

export function PlanPricing() {
  const [billing, setBilling] = React.useState<"annual" | "monthly">("annual");
  const annual = billing === "annual";
  const entPrice = annual ? "15" : "12";
  const engPrice = annual ? "25" : "21";
  const billNote = annual ? "billed annually" : "billed monthly — save ~15%";

  const toggleBtn = (active: boolean): React.CSSProperties => ({
    border: "none",
    cursor: "pointer",
    borderRadius: 999,
    padding: "8px 18px",
    fontFamily: "var(--font-body)",
    fontSize: 14,
    fontWeight: 600,
    background: active ? "var(--szz-cta-blue)" : "transparent",
    color: active ? "#ffffff" : muted,
    display: "flex",
    alignItems: "center",
    gap: 8,
  });

  return (
    <>
      {/* billing toggle */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "var(--szz-bg-card)",
          border: "1px solid var(--szz-border)",
          borderRadius: 999,
          padding: 5,
        }}
      >
        <button type="button" onClick={() => setBilling("monthly")} style={toggleBtn(!annual)}>
          Monthly{" "}
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".5px", color: "var(--szz-green)" }}>
            SAVE 15%
          </span>
        </button>
        <button type="button" onClick={() => setBilling("annual")} style={toggleBtn(annual)}>
          Annual
        </button>
      </div>

      {/* plan cards */}
      <div
        className="fill-cards"
        style={{ maxWidth: 840, margin: "0 auto", display: "flex", gap: 24, alignItems: "stretch", flexWrap: "wrap", width: "100%" }}
      >
        <div style={{ flex: 1, minWidth: 300 }}>
          <Card popular style={{ height: "100%" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontFamily: display, fontSize: 24, fontWeight: 700, color: primary }}>Entrepreneur</span>
                <Badge variant="accent">Most popular</Badge>
              </div>
              <span style={{ fontSize: 14, color: muted }}>For small businesses &amp; their websites.</span>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontFamily: display, fontSize: 48, fontWeight: 700, color: primary }}>${entPrice}</span>
                <span style={{ fontSize: 15, color: "var(--szz-text-dim)" }}>/mo</span>
              </div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--szz-text-dim)", marginTop: -8 }}>{billNote}</span>
              <Button asChild variant="primary" size="lg" style={{ width: "100%" }}>
                <a
                  href="https://account.serverizz.com/order.php?step=1&productGroup=1&product=1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Choose Entrepreneur
                </a>
              </Button>
              <div style={{ height: 1, background: "var(--szz-border)" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {entFeatures.map((f) => (
                  <FeatureRow key={f} label={f} />
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div style={{ flex: 1, minWidth: 300 }}>
          <Card style={{ height: "100%" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontFamily: display, fontSize: 24, fontWeight: 700, color: primary }}>Engineer</span>
                <Badge variant="success" dot>Runs your code</Badge>
              </div>
              <span style={{ fontSize: 14, color: muted }}>Everything in Entrepreneur, plus apps.</span>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontFamily: display, fontSize: 48, fontWeight: 700, color: primary }}>${engPrice}</span>
                <span style={{ fontSize: 15, color: "var(--szz-text-dim)" }}>/mo</span>
              </div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--szz-text-dim)", marginTop: -8 }}>{billNote}</span>
              <Button asChild variant="secondary" size="lg" style={{ width: "100%" }}>
                <a
                  href="https://account.serverizz.com/order.php?step=1&productGroup=1&product=2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Choose Engineer
                </a>
              </Button>
              <div style={{ height: 1, background: "var(--szz-border)" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {engFeatures.map((f) => (
                  <FeatureRow key={f} label={f} />
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
