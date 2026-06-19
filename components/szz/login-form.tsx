"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TurnstileWidget } from "@/components/szz/turnstile-widget";

type Status = "idle" | "verifying" | "error";

export function LoginForm({
  ceLoginUrl,
  ceForgotUrl,
  ceSignupUrl,
  turnstileSiteKey,
  loggedOut = false,
}: {
  ceLoginUrl: string;
  ceForgotUrl: string;
  ceSignupUrl: string;
  turnstileSiteKey: string;
  loggedOut?: boolean;
}) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [token, setToken] = React.useState<string | null>(null);
  const [resetSignal, setResetSignal] = React.useState(0);
  const [status, setStatus] = React.useState<Status>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const handoffRef = React.useRef<HTMLFormElement>(null);

  const onVerify = React.useCallback((t: string) => setToken(t), []);
  const onExpire = React.useCallback(() => setToken(null), []);

  // The server consumes the token (single-use) on every attempt, so after a
  // failed login clear it and re-run the challenge for the retry.
  function resetTurnstile() {
    setToken(null);
    setResetSignal((n) => n + 1);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setStatus("error");
      setError("Enter your email and password.");
      return;
    }
    if (!token) {
      setStatus("error");
      setError("Please complete the verification.");
      return;
    }
    setEmail(trimmedEmail);
    setStatus("verifying");
    setError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, password, turnstileToken: token }),
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
      resetTurnstile();
    } catch {
      setStatus("error");
      setError("Something went wrong. Please try again.");
      resetTurnstile();
    }
  }

  const verifying = status === "verifying";

  return (
    <div style={{ width: "100%", maxWidth: 400 }}>
      {loggedOut && status === "idle" && (
        <div role="status" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, border: "1px solid var(--szz-border)", borderRadius: 8, background: "var(--szz-bg-deep)", padding: "11px 14px" }}>
          <span style={{ width: 7, height: 7, borderRadius: 999, background: "var(--szz-green)" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--szz-text-light)" }}>
            You&rsquo;ve been signed out.
          </span>
        </div>
      )}
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
        <TurnstileWidget
          siteKey={turnstileSiteKey}
          onVerify={onVerify}
          onExpire={onExpire}
          resetSignal={resetSignal}
        />
        <Button type="submit" variant="primary" size="lg" disabled={verifying || !token}>
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
