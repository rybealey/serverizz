"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { TerminalLogo } from "@/components/szz/terminal-logo";
import { ThemeToggle } from "@/components/szz/theme-toggle";
import { Button } from "@/components/ui/button";

type MaintenanceState = { active: boolean; title: string | null };

function useMaintenanceStatus(): MaintenanceState {
  const [state, setState] = React.useState<MaintenanceState>({ active: false, title: null });
  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/maintenance-status");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setState({ active: !!data.active, title: data.title ?? null });
      } catch {
        /* keep the default marketing line on any error */
      }
    };
    load();
    const id = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);
  return state;
}

type NavItem = { href: string; label: string };
type NavGroup = { label: string; items: NavItem[] };
type NavEntry = NavItem | NavGroup;

const NAV_LINKS: NavEntry[] = [
  {
    label: "Hosting",
    items: [
      { href: "/hosting", label: "Hosting" },
      { href: "/hosting/wordpress", label: "WordPress" },
    ],
  },
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

function NavDropdown({
  label,
  items,
  pathname,
}: {
  label: string;
  items: NavItem[];
  pathname: string;
}) {
  const [open, setOpen] = React.useState(false);
  const groupActive = items.some((it) => pathname.startsWith(it.href));

  return (
    <div
      style={{ position: "relative", display: "flex" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        type="button"
        className="szz-nav-link"
        data-active={groupActive}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          fontFamily: "var(--font-body)",
          fontSize: 14,
          fontWeight: 500,
          color: groupActive ? "var(--szz-text-primary)" : "var(--szz-text-muted)",
          padding: "8px 12px",
        }}
      >
        {label}
        <ChevronDown
          size={14}
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .15s ease" }}
        />
        {groupActive && (
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
      </button>

      {open && (
        <div
          role="menu"
          style={{ position: "absolute", top: "100%", left: 0, paddingTop: 6, zIndex: 60 }}
        >
          <div
            style={{
              minWidth: 180,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              padding: 6,
              borderRadius: 10,
              background: "var(--szz-bg-card)",
              border: "1px solid var(--szz-border-subtle)",
              boxShadow: "0 12px 32px rgba(0,0,0,.18)",
            }}
          >
            {items.map((it) => {
              const active =
                it.href === "/hosting" ? pathname === "/hosting" : pathname.startsWith(it.href);
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  role="menuitem"
                  className="szz-nav-link"
                  data-active={active}
                  onClick={() => setOpen(false)}
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 14,
                    fontWeight: 500,
                    color: active ? "var(--szz-text-primary)" : "var(--szz-text-muted)",
                    padding: "8px 10px",
                    borderRadius: 6,
                  }}
                >
                  {it.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function SiteNav() {
  const pathname = usePathname();
  const maintenance = useMaintenanceStatus();

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
            background: maintenance.active ? "var(--szz-yellow)" : "var(--szz-green)",
          }}
        />
        {maintenance.active ? (
          <Link
            href="https://status.serverizz.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: ".5px",
              color: "var(--szz-text-muted)",
              textDecoration: "none",
            }}
          >
            Scheduled maintenance in progress — you may notice slower performance. View status →
          </Link>
        ) : (
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
        )}
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

        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {NAV_LINKS.map((link) =>
            "items" in link ? (
              <NavDropdown
                key={link.label}
                label={link.label}
                items={link.items}
                pathname={pathname}
              />
            ) : (
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
            )
          )}
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
            <Link href="/register">Get Started</Link>
          </Button>
          <ThemeToggle />
        </div>
      </nav>
    </div>
  );
}
