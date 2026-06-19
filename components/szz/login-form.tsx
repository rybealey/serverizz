"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Status = "idle" | "verifying" | "error";

export function LoginForm({
  ceLoginUrl,
  ceForgotUrl,
  ceSignupUrl,
}: {
  ceLoginUrl: string;
  ceForgotUrl: string;
  ceSignupUrl: string;
}) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [status, setStatus] = React.useState<Status>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const handoffRef = React.useRef<HTMLFormElement>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setStatus("error");
      setError("Enter your email and password.");
      return;
    }
    setEmail(trimmedEmail);
    setStatus("verifying");
    setError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.ok) {
        // Credentials are valid — hand off to ClientExec so the browser
        // receives CE's (cross-domain) session cookie. Stay in "verifying"
        // while the navigation happens.
        handoffRef.current?.submit();
        return;
      }
      setStatus("error");
      setError(typeof data?.error === "string" ? data.error : "Incorrect email or password.");
    } catch {
      setStatus("error");
      setError("Something went wrong. Please try again.");
    }
  }

  const verifying = status === "verifying";

  return (
    <div style={{ width: "100%", maxWidth: 400 }}>
      <div style={{ marginBottom: 30, display: "flex", flexDirection: "column", gap: 8 }}>
        <h2 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: 28, fontWeight: 700, letterSpacing: "-.5px", color: "var(--szz-text-primary)" }}>
          Sign in
        </h2>
        <p style={{ margin: 0, fontSize: 14, color: "var(--szz-text-muted)" }}>
          Access your SERVERIZZ account.
        </p>
      </div>

      {verifying && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, border: "1px solid var(--szz-border)", borderRadius: 8, background: "var(--szz-bg-deep)", padding: "11px 14px" }}>
          <span style={{ width: 7, height: 7, borderRadius: 999, background: "var(--szz-green)" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--szz-text-light)" }}>
            Verifying credentials…
          </span>
        </div>
      )}

      {status === "error" && error && (
        <div role="alert" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, border: "1px solid var(--szz-red)", borderRadius: 8, background: "var(--szz-bg-deep)", padding: "11px 14px" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--szz-red)" }}>{error}</span>
        </div>
      )}

      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Input
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@yourbusiness.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500, color: "var(--szz-text-light)" }}>
              Password
            </span>
            <a href={ceForgotUrl} style={{ fontSize: 12, color: "var(--szz-accent-blue)" }}>
              Forgot password?
            </a>
          </div>
          <Input
            type="password"
            name="password"
            aria-label="Password"
            autoComplete="current-password"
            placeholder="••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" variant="primary" size="lg" disabled={verifying}>
          {verifying ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p style={{ marginTop: 28, textAlign: "center", fontSize: 13, color: "var(--szz-text-muted)" }}>
        New to SERVERIZZ?{" "}
        <a href={ceSignupUrl} style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: "var(--szz-accent-blue)" }}>
          Create an account
        </a>
      </p>

      {/* Hidden native form: the actual session-establishing POST to ClientExec. */}
      <form ref={handoffRef} method="post" action={ceLoginUrl} style={{ display: "none" }} aria-hidden="true">
        <input type="hidden" name="email" value={email} readOnly />
        <input type="hidden" name="passed_password" value={password} readOnly />
        <input type="hidden" name="btnSubmit" value="Login" readOnly />
      </form>
    </div>
  );
}
