"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Globe, LayoutTemplate, Menu, X, type LucideIcon } from "lucide-react";
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

type NavItem = { href: string; label: string; Icon?: LucideIcon };
type NavGroup = { label: string; items: NavItem[] };
type NavEntry = NavItem | NavGroup;

const NAV_LINKS: NavEntry[] = [
  {
    label: "Hosting",
    items: [
      { href: "/hosting", label: "Shared", Icon: Globe },
      { href: "/hosting/wordpress", label: "WordPress", Icon: LayoutTemplate },
    ],
  },
  { href: "/vps", label: "VPS" },
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
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    fontFamily: "var(--font-body)",
                    fontSize: 14,
                    fontWeight: 500,
                    color: active ? "var(--szz-text-primary)" : "var(--szz-text-muted)",
                    padding: "8px 10px",
                    borderRadius: 6,
                  }}
                >
                  {it.Icon && (
                    <it.Icon
                      size={16}
                      style={{ flexShrink: 0, color: "var(--szz-accent-blue)" }}
                    />
                  )}
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

function MobileNav({
  open,
  onClose,
  pathname,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
}) {
  const [hostingOpen, setHostingOpen] = React.useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  React.useEffect(() => {
    if (!open) setHostingOpen(false);
  }, [open]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const overlayRef = React.useRef<HTMLDivElement>(null);
  const closeBtnRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const prevFocused = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();
    return () => {
      prevFocused?.focus();
    };
  }, [open]);

  // Escape closes the overlay; body scroll is locked while it is open.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && overlayRef.current) {
        const focusables = overlayRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  // Rendered through a portal to document.body: the sticky nav wrapper sets
  // backdrop-filter, which makes it the containing block for fixed-position
  // descendants — that would clamp this overlay to the nav's box instead of
  // the viewport. Portaling escapes that ancestor entirely.
  return createPortal(
    <div
      ref={overlayRef}
      id="mobile-nav"
      role="dialog"
      aria-modal={true}
      aria-label="Site menu"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "var(--szz-bg-deep)",
        display: "flex",
        flexDirection: "column",
        padding: "16px 20px 32px",
        overflowY: "auto",
      }}
    >
      {/* top row: logo + close */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/"
          onClick={onClose}
          style={{ display: "flex", alignItems: "center" }}
        >
          <TerminalLogo size={24} />
        </Link>
        <button
          ref={closeBtnRef}
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 40,
            height: 40,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--szz-text-primary)",
          }}
        >
          <X size={24} />
        </button>
      </div>

      {/* links */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          marginTop: 24,
        }}
      >
        {NAV_LINKS.map((link) => {
          if ("items" in link) {
            return (
              <div
                key={link.label}
                style={{ display: "flex", flexDirection: "column" }}
              >
                <button
                  type="button"
                  aria-expanded={hostingOpen}
                  aria-controls="mobile-nav-hosting"
                  onClick={() => setHostingOpen((v) => !v)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "var(--font-body)",
                    fontSize: 20,
                    fontWeight: 600,
                    color: "var(--szz-text-primary)",
                    padding: "12px 0",
                  }}
                >
                  {link.label}
                  <ChevronDown
                    size={20}
                    style={{
                      transform: hostingOpen ? "rotate(180deg)" : "none",
                      transition: "transform .15s ease",
                    }}
                  />
                </button>
                {hostingOpen && (
                  <div
                    id="mobile-nav-hosting"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      paddingLeft: 16,
                      paddingBottom: 8,
                    }}
                  >
                    {link.items.map((it) => {
                      const active =
                        it.href === "/hosting"
                          ? pathname === "/hosting"
                          : pathname.startsWith(it.href);
                      return (
                        <Link
                          key={it.href}
                          href={it.href}
                          onClick={onClose}
                          className="szz-nav-link"
                          data-active={active}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 10,
                            fontFamily: "var(--font-body)",
                            fontSize: 16,
                            fontWeight: 500,
                            color: active
                              ? "var(--szz-text-primary)"
                              : "var(--szz-text-muted)",
                            padding: "10px 0",
                          }}
                        >
                          {it.Icon && (
                            <it.Icon
                              size={18}
                              style={{
                                flexShrink: 0,
                                color: "var(--szz-accent-blue)",
                              }}
                            />
                          )}
                          {it.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="szz-nav-link"
              data-active={active}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 20,
                fontWeight: 600,
                color: active
                  ? "var(--szz-text-primary)"
                  : "var(--szz-text-muted)",
                padding: "12px 0",
              }}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* actions */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          marginTop: 32,
          paddingTop: 24,
          borderTop: "1px solid var(--szz-border-subtle)",
        }}
      >
        <Link
          href="/login"
          onClick={onClose}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 16,
            fontWeight: 500,
            color: "var(--szz-text-primary)",
          }}
        >
          Log In
        </Link>
        <Button
          asChild
          variant="primary"
          size="md"
          style={{ width: "100%", justifyContent: "center" }}
        >
          <Link href="/register" onClick={onClose}>
            Get Started
          </Link>
        </Button>
        <ThemeToggle />
      </div>
    </div>,
    document.body
  );
}

export function SiteNav() {
  const pathname = usePathname();
  const maintenance = useMaintenanceStatus();
  const [menuOpen, setMenuOpen] = React.useState(false);

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
          <Link
            href="/offers/education"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: ".5px",
              color: "var(--szz-text-muted)",
              textDecoration: "none",
            }}
          >
            Students and educators save 75% on our Engineer plan – learn more →
          </Link>
        )}
      </div>

      {/* main nav */}
      <nav
        className="szz-nav--mobile-pad"
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
        {/* No aria-label: the visible "SERVERIZZ" wordmark is the accessible
            name. An aria-label that adds words the visible text lacks trips
            WCAG 2.5.3 (label-content-name-mismatch). */}
        <Link href="/" style={{ display: "flex", alignItems: "center" }}>
          <TerminalLogo size={24} />
        </Link>

        <div className="szz-nav-desktop" style={{ alignItems: "center", gap: 4 }}>
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

        <div className="szz-nav-desktop" style={{ alignItems: "center", gap: 16 }}>
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

        <div className="szz-nav-mobile" style={{ alignItems: "center", gap: 12 }}>
          <Button asChild variant="primary" size="sm">
            <Link href="/register">Get Started</Link>
          </Button>
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--szz-text-primary)",
            }}
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      <MobileNav
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        pathname={pathname}
      />
    </div>
  );
}
