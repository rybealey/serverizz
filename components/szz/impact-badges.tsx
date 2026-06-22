"use client";

import * as React from "react";
import { Sprout, BadgeCheck, Cloud, Trees, Briefcase, type LucideIcon } from "lucide-react";
import {
  FALLBACK_IMPACT,
  formatCount,
  formatTonnes,
  formatSqMeters,
  type ImpactSummary,
} from "@/lib/treeapp";

// "Our impact" footer badges, sourced from The Tree App summary via /api/impact-summary.
const BADGES: { icon: LucideIcon; label: string; value: (i: ImpactSummary) => string }[] = [
  { icon: Sprout, label: "trees planted", value: (i) => formatCount(i.trees) },
  { icon: BadgeCheck, label: "carbon credits", value: (i) => formatCount(i.carbonCredits) },
  { icon: Cloud, label: "CO₂ absorbed", value: (i) => formatTonnes(i.co2Tonnes) },
  { icon: Trees, label: "land restored", value: (i) => formatSqMeters(i.landSqMeters) },
  { icon: Briefcase, label: "workdays created", value: (i) => formatCount(i.workdays) },
];

export function ImpactBadges() {
  // Seed with the fallback so the badges render immediately, then refresh from the API.
  const [impact, setImpact] = React.useState<ImpactSummary>(FALLBACK_IMPACT);

  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/impact-summary");
        if (!res.ok) return;
        const data = (await res.json()) as ImpactSummary;
        if (!cancelled) setImpact(data);
      } catch {
        /* keep the fallback figures on any error */
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ maxWidth: 1180, margin: "44px auto 0", display: "flex", flexDirection: "column", gap: 12 }}>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 2,
          color: "var(--szz-green)",
        }}
      >
        {"// OUR_IMPACT"}
      </span>
      <div style={{ maxWidth: 560, display: "flex", flexWrap: "wrap", gap: 8 }}>
        {BADGES.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            title={`${value(impact)} ${label} through The Tree App`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              whiteSpace: "nowrap",
              border: "1px solid color-mix(in srgb, var(--szz-green) 35%, transparent)",
              borderRadius: 999,
              background: "color-mix(in srgb, var(--szz-green) 9%, transparent)",
              padding: "5px 12px 5px 10px",
            }}
          >
            <Icon size={14} aria-hidden style={{ flexShrink: 0, color: "var(--szz-green)" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "var(--szz-green)" }}>
              {value(impact)}
            </span>
            <span style={{ fontSize: 12, color: "var(--szz-text-muted)" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
