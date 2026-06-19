"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TerminalLogo } from "@/components/szz/terminal-logo";
import { ThemeToggle } from "@/components/szz/theme-toggle";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/hosting", label: "Hosting" },
  { href: "/wordpress", label: "WordPress" },
  { href: "/domains", label: "Domains" },
  { href: "/support", label: "Support" },
];

function NavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className="szz-nav-link"
      data-active={active}
      style={{
        position: "relative",
        fontFamily: "var(--font-body)",
        fontSize: 14,
        fontWeight: 500,
        color: active ? "var(--szz-text-primary)" : "var(--szz-text-muted)",
        padding: "8px 12px",
      }}
    >
      {label}
      {active && (
        <span
          style={{
            position: "absolute",
            left: 12,
            right: 12,
            bottom: 0,
            height: 2,
            background: "var(--szz-accent-blue)",
          }}
        />
      )}
    </Link>
  );
}

export function SiteNav() {
  const pathname = usePathname();

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "var(--szz-nav-bg)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--szz-border-subtle)",
      }}
    >
      {/* announcement bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          borderBottom: "1px solid var(--szz-border-subtle)",
          background: "var(--szz-bg-card)",
          padding: "8px 20px",
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: 999,
            background: "var(--szz-green)",
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: ".5px",
            color: "var(--szz-text-muted)",
          }}
        >
          Free site migrations on every plan — we do the moving for you.
        </span>
      </div>

      {/* main nav */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
          padding: "16px 48px",
          maxWidth: 1280,
          margin: "0 auto",
          flexWrap: "wrap",
          rowGap: 10,
        }}
      >
        <Link href="/" aria-label="SERVERIZZ home" style={{ display: "flex", alignItems: "center" }}>
          <TerminalLogo size={24} />
        </Link>

        <div style={{ display: "flex", gap: 4 }}>
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              active={
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href)
              }
            />
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link
            href="/login"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 14,
              fontWeight: 500,
              color: "var(--szz-text-primary)",
            }}
          >
            Log In
          </Link>
          <Button asChild variant="primary" size="sm">
            <a
              href="https://account.serverizz.com/order.php"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Started
            </a>
          </Button>
          <ThemeToggle />
        </div>
      </nav>
    </div>
  );
}
