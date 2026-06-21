"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TurnstileWidget } from "@/components/szz/turnstile-widget";

type Status = "idle" | "submitting" | "error" | "done";

const display = "var(--font-heading)";
const primary = "var(--szz-text-primary)";
const light = "var(--szz-text-light)";

const fieldStyle: React.CSSProperties = {
  height: 44,
  background: "var(--szz-bg-deep)",
  border: "1px solid var(--szz-border)",
  borderRadius: 8,
  padding: "0 14px",
  fontFamily: "var(--font-body)",
  fontSize: 14,
  color: primary,
  outline: "none",
};

export function SupportForm({
  turnstileSiteKey,
  ticketTypes,
}: {
  turnstileSiteKey: string;
  ticketTypes: { value: string; label: string }[];
}) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [ticketType, setTicketType] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [token, setToken] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<Status>("idle");
  const [error, setError] = React.useState<string | null>(null);

  const onVerify = React.useCallback((t: string) => setToken(t), []);
  const onExpire = React.useCallback(() => setToken(null), []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const n = name.trim(), em = email.trim(), su = subject.trim(), ms = message.trim();
    if (!n || !em || !su || !ms || !ticketType) {
      setStatus("error");
      setError("Please fill in every field and choose a topic.");
      return;
    }
    if (!token) {
      setStatus("error");
      setError("Please complete the verification.");
      return;
    }
    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/api/support-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: n, email: em, subject: su, message: ms, ticketType, turnstileToken: token }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.ok) {
        setStatus("done");
        return;
      }
      setStatus("error");
      setError(typeof data?.error === "string" ? data.error : "We couldn't submit your ticket.");
    } catch {
      setStatus("error");
      setError("Something went wrong. Please try again.");
    }
  }

  const submitting = status === "submitting";

  if (status === "done") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <span style={{ width: 44, height: 44, borderRadius: 999, background: "var(--szz-green)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 22, color: "#06240f" }}>✓</span>
        </span>
        <h2 style={{ margin: 0, fontFamily: display, fontSize: 22, fontWeight: 700, color: primary }}>Ticket received</h2>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "var(--szz-text-muted)" }}>
          Thanks — we&apos;ve logged your ticket and emailed you a confirmation. We&apos;ll reply by email shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <h2 style={{ margin: 0, fontFamily: display, fontSize: 22, fontWeight: 700, color: primary }}>Send us a message</h2>

      {status === "error" && error && (
        <div role="alert" style={{ display: "flex", alignItems: "center", gap: 10, border: "1px solid var(--szz-red)", borderRadius: 8, background: "var(--szz-bg-deep)", padding: "11px 14px" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--szz-red)" }}>{error}</span>
        </div>
      )}

      <div className="szz-grid-2" style={{ gap: 14 }}>
        <Input label="Name" name="name" autoComplete="name" placeholder="Jane Baker" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label="Email" type="email" name="email" autoComplete="email" placeholder="jane@mybakery.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>

      <Input label="Subject" name="subject" placeholder="Brief summary" value={subject} onChange={(e) => setSubject(e.target.value)} required />

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500, color: light }}>Topic</span>
        <select
          aria-label="Topic"
          value={ticketType}
          onChange={(e) => setTicketType(e.target.value)}
          required
          style={{ ...fieldStyle, appearance: "auto" }}
        >
          <option value="" disabled>Select a topic…</option>
          {ticketTypes.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500, color: light }}>Message</span>
        <textarea
          aria-label="Message"
          placeholder="Tell us what's up…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          style={{ minHeight: 120, background: "var(--szz-bg-deep)", border: "1px solid var(--szz-border)", borderRadius: 8, padding: "12px 14px", fontFamily: "var(--font-body)", fontSize: 14, color: primary, resize: "vertical", outline: "none" }}
        />
      </div>

      <TurnstileWidget siteKey={turnstileSiteKey} onVerify={onVerify} onExpire={onExpire} />

      <div>
        <Button type="submit" variant="primary" size="lg" disabled={submitting || !token}>
          {submitting ? "Sending…" : "Send message"}
        </Button>
      </div>
    </form>
  );
}
