"use client";

import * as React from "react";
import { Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { parseDomain, type DomainResult } from "@/lib/domains";

type State =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "results"; results: DomainResult[] }
  | { phase: "error"; message: string };

export function DomainSearch({ placeholder = "find yourbakery.com" }: { placeholder?: string }) {
  const [value, setValue] = React.useState("");
  const [state, setState] = React.useState<State>({ phase: "idle" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseDomain(value);
    if (!parsed.ok) {
      setState({ phase: "error", message: parsed.error });
      return;
    }
    setState({ phase: "loading" });
    try {
      const res = await fetch("/api/domain-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: value }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState({ phase: "error", message: json.error ?? "Search failed. Please try again." });
        return;
      }
      setState({ phase: "results", results: json.results ?? [] });
    } catch {
      setState({ phase: "error", message: "Search failed. Check your connection and try again." });
    }
  }

  return (
    <div style={{ width: "100%", maxWidth: 600, display: "flex", flexDirection: "column", gap: 16 }}>
      <form className="szz-inline-search" style={{ display: "flex", gap: 10, width: "100%" }} onSubmit={handleSubmit}>
        <div style={{ flex: 1 }}>
          <Input
            mono
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            aria-label="Search for a domain"
          />
        </div>
        <Button type="submit" variant="primary" size="lg" disabled={state.phase === "loading"}>
          {state.phase === "loading" ? "Searching…" : "Search"}
        </Button>
      </form>

      {state.phase === "error" && (
        <p role="alert" style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--szz-red)" }}>
          {state.message}
        </p>
      )}

      {state.phase === "loading" && (
        <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--szz-text-muted)" }}>
          Checking availability…
        </p>
      )}

      {state.phase === "results" && (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8, textAlign: "left" }}>
          {state.results.map((r) => (
            <li
              key={r.domain}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                border: "1px solid var(--szz-border)", borderRadius: 10,
                background: "var(--szz-bg-deep)", padding: "12px 16px",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                {r.status === "available" ? (
                  <Check size={18} style={{ color: "var(--szz-green)", flex: "none" }} />
                ) : (
                  <X size={18} style={{ color: "var(--szz-text-dim)", flex: "none" }} />
                )}
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 15, color: "var(--szz-text-primary)", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {r.domain}
                </span>
              </span>

              {r.status === "available" ? (
                <span style={{ display: "flex", alignItems: "center", gap: 14, flex: "none" }}>
                  {r.formatedPrice && (
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--szz-accent-blue)", whiteSpace: "nowrap" }}>
                      {r.formatedPrice}
                    </span>
                  )}
                  <Button asChild variant="primary" size="sm">
                    <a href={r.continueUrl ?? "#"}>Continue →</a>
                  </Button>
                </span>
              ) : (
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--szz-text-dim)", flex: "none" }}>
                  {r.status === "taken" ? "taken" : "unavailable"}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
