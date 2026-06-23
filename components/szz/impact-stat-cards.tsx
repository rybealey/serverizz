"use client";

import * as React from "react";
import { Sprout, Cloud, Trees, Briefcase, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  FALLBACK_IMPACT,
  formatCount,
  formatTonnes,
  formatSqMeters,
  type ImpactSummary,
} from "@/lib/treeapp";

// The About "Our impact" cards, sourced from the same /api/impact-summary feed as
// the footer badges so both stay in lockstep with The Tree App totals.
const STATS: { icon: LucideIcon; label: string; value: (i: ImpactSummary) => string }[] = [
  { icon: Sprout, label: "trees planted", value: (i) => formatCount(i.trees) },
  { icon: Cloud, label: "CO₂ absorbed", value: (i) => formatTonnes(i.co2Tonnes) },
  { icon: Trees, label: "land restored", value: (i) => formatSqMeters(i.landSqMeters) },
  { icon: Briefcase, label: "workdays created", value: (i) => formatCount(i.workdays) },
];

export function ImpactStatCards() {
  // Seed with the fallback so the cards render immediately, then refresh from the API.
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
    <div className="szz-grid-2" style={{ gap: 16 }}>
      {STATS.map(({ icon: Icon, label, value }) => (
        <Card key={label} surface="deep">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Icon size={20} aria-hidden style={{ color: "var(--szz-green)" }} />
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 26, fontWeight: 700, color: "var(--szz-text-primary)" }}>
              {value(impact)}
            </span>
            <span style={{ fontSize: 13, color: "var(--szz-text-muted)" }}>{label}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}
