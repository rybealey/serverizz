"use client";

import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const display = "var(--font-heading)";
const muted = "var(--szz-text-muted)";
const primary = "var(--szz-text-primary)";
const light = "var(--szz-text-light)";

type PlanKey = "Entrepreneur" | "Engineer";

const plans: Record<
  PlanKey,
  { price: string; sites: string; storage: string; orderUrl: string }
> = {
  Entrepreneur: {
    price: "15",
    sites: "up to 4",
    storage: "25 GB SSD",
    orderUrl: "https://go.serverizz.com/order.php?step=1&productGroup=1&product=584",
  },
  Engineer: {
    price: "25",
    sites: "Unlimited",
    storage: "75 GB SSD",
    orderUrl: "https://go.serverizz.com/order.php?step=1&productGroup=1&product=585",
  },
};

const planOrder: PlanKey[] = ["Entrepreneur", "Engineer"];

export function WpPricingCard() {
  const [plan, setPlan] = React.useState<PlanKey>("Entrepreneur");
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const current = plans[plan];

  return (
    <Card glow>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, height: "100%" }}>
        <span style={{ fontSize: 13, color: muted }}>Starts at</span>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <span style={{ fontFamily: display, fontSize: 44, fontWeight: 700, color: primary }}>
            ${current.price}
          </span>
          <span style={{ fontSize: 15, color: "var(--szz-text-dim)" }}>/mo</span>
        </div>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--szz-text-dim)", marginTop: -6 }}>
          billed annually · 30-day refund
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, margin: "6px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14, color: muted }}>
            <span>Plan</span>
            <div ref={ref} style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={open}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  border: "1px solid var(--szz-border)",
                  borderRadius: 8,
                  padding: "6px 12px",
                  background: "transparent",
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                  fontSize: 14,
                  color: primary,
                }}
              >
                {plan}{" "}
                <span
                  style={{
                    color: "var(--szz-text-dim)",
                    transition: "transform .15s ease",
                    transform: open ? "rotate(180deg)" : "none",
                  }}
                >
                  ▾
                </span>
              </button>
              {open && (
                <ul
                  role="listbox"
                  style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    right: 0,
                    zIndex: 20,
                    minWidth: "100%",
                    margin: 0,
                    padding: 4,
                    listStyle: "none",
                    background: "var(--szz-bg-card)",
                    border: "1px solid var(--szz-border)",
                    borderRadius: 8,
                    boxShadow: "0 8px 24px rgba(0,0,0,.35)",
                  }}
                >
                  {planOrder.map((p) => (
                    <li key={p}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={p === plan}
                        onClick={() => {
                          setPlan(p);
                          setOpen(false);
                        }}
                        style={{
                          display: "block",
                          width: "100%",
                          textAlign: "left",
                          whiteSpace: "nowrap",
                          border: "none",
                          borderRadius: 6,
                          padding: "8px 12px",
                          cursor: "pointer",
                          fontFamily: "var(--font-body)",
                          fontSize: 14,
                          background: p === plan ? "var(--szz-border)" : "transparent",
                          color: p === plan ? primary : light,
                        }}
                      >
                        {p}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: muted }}>
            <span>Sites</span>
            <span style={{ color: light }}>{current.sites}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: muted }}>
            <span>Storage</span>
            <span style={{ color: light }}>{current.storage}</span>
          </div>
        </div>
        <Button asChild variant="primary" size="lg" style={{ width: "100%" }}>
          <a href={current.orderUrl} target="_blank" rel="noopener noreferrer">
            Get started
          </a>
        </Button>
        <span style={{ textAlign: "center", fontSize: 13, color: muted }}>
          or{" "}
          <Link href="/support" className="szz-link-accent" style={{ fontSize: 13, color: "var(--szz-accent-blue)" }}>
            talk to our team
          </Link>{" "}
          first
        </span>
      </div>
    </Card>
  );
}
