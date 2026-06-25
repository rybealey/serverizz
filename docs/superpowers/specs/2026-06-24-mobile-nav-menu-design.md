# Mobile Navigation Menu — Design

**Date:** 2026-06-24
**Component:** `components/szz/site-nav.tsx`
**Status:** Approved

## Problem

The site navigation has no responsive handling. On tablet and phone widths the
nav relies on `flexWrap: "wrap"`, so the logo, link group, and right-side actions
(Log In / Get Started / theme toggle) wrap onto multiple rows in an awkward,
unintentional stack. We need an intentional mobile experience: a collapsed bar
plus a mobile menu.

## Goals

- Clean, intentional layout below the breakpoint.
- A full-screen overlay menu containing all navigation and actions.
- Preserve the existing desktop nav exactly as-is above the breakpoint.
- No hydration flash; SSR-correct.
- Accessible (keyboard + screen reader).

## Non-Goals

- No change to desktop nav appearance or behavior above the breakpoint.
- No new dependency (no drawer/headless-ui library) — follow the existing
  custom design-token + inline-style pattern.
- No two-stage (tablet-specific) collapse. One breakpoint for all small screens.

## Decisions (from brainstorming)

- **Menu pattern:** Full-screen overlay.
- **Breakpoint:** single switch at **900px** (`max-width: 900px` = mobile).
- **Collapsed bar contents:** logo (left) · `Get Started` button + hamburger (right).
- **Responsive technique:** CSS classes with media queries in `app/globals.css`
  toggling `display`. Overlay open/close stays React state. (Chosen over a JS
  `matchMedia` hook to avoid hydration flash and stay SSR-correct.)

## Architecture

All work stays in `components/szz/site-nav.tsx` (already a `"use client"`
component) plus a few lines in `app/globals.css`.

### CSS (app/globals.css)

Add two helper classes:

```css
/* shown on desktop, hidden on mobile */
.szz-nav-desktop { display: flex; }
/* shown on mobile, hidden on desktop */
.szz-nav-mobile { display: none; }

@media (max-width: 900px) {
  .szz-nav-desktop { display: none !important; }
  .szz-nav-mobile { display: flex !important; }
}
```

`!important` is used because the existing nav sets `display` via inline styles
(higher specificity than a plain class). The desktop link group and the desktop
actions cluster get `className="szz-nav-desktop"`; the mobile cluster
(Get Started + hamburger) gets `className="szz-nav-mobile"`. Inline `display`
declarations are removed from those specific containers so the class controls
visibility (other inline style props remain).

Reduced padding on small screens: the main `<nav>` padding drops from
`16px 48px` to roughly `12px 20px` under the breakpoint (via a nav class +
media query) so the collapsed bar isn't cramped.

### Component structure

- Keep `NAV_LINKS`, `NavLink`, `NavDropdown` as-is (desktop).
- The desktop link group `<div>` → add `className="szz-nav-desktop"`.
- The desktop actions `<div>` (Log In / Get Started / ThemeToggle) → add
  `className="szz-nav-desktop"`.
- Add a new mobile cluster `<div className="szz-nav-mobile">` containing the
  `Get Started` button and a hamburger `<button>`.
- Add a new in-file `MobileNav` component rendering the overlay, driven by an
  `open` state lifted into `SiteNav` (so the hamburger toggles it).

### MobileNav overlay

- `position: fixed`, full viewport, `zIndex` above the sticky nav (e.g. 100).
- Background: reuse `var(--szz-nav-bg)` with `backdropFilter: blur(16px)` (or a
  solid `var(--szz-bg-page)` for full opacity — final pick during impl, must be
  readable). Fade/slide-in transition on open.
- **Top row:** logo (left) + close `X` button (right).
- **Links (stacked, large ~20px):**
  - Iterate `NAV_LINKS`. Single items render as large links.
  - The "Hosting" group renders as an inline **accordion**: tapping the row
    toggles reveal of Shared / WordPress sub-items (indented).
  - Active-route highlighting reuses the existing `pathname` logic
    (`pathname === href` for `/` and `/hosting`; `startsWith` otherwise).
- **Actions block (below links):** `Log In` link, full-width `Get Started`
  button, and the `ThemeToggle`.
- Tapping any link closes the overlay (client navigation).

### Interaction & a11y

- Hamburger: `<button type="button">` with `aria-label="Open menu"`,
  `aria-expanded={open}`, `aria-controls="mobile-nav"`.
- Close button: `aria-label="Close menu"`.
- Overlay container `id="mobile-nav"`.
- **Escape** key closes the overlay (listener active only while open).
- **Body scroll lock** while open (`document.body.style.overflow = "hidden"`,
  restored on close/unmount).
- Overlay closes on: link tap, X button, Escape.

## Data Flow

```
SiteNav
  state: open (bool)
  ├─ announcement bar (unchanged)
  └─ nav
      ├─ logo
      ├─ desktop link group        [.szz-nav-desktop]  (unchanged content)
      ├─ desktop actions           [.szz-nav-desktop]  (unchanged content)
      └─ mobile cluster            [.szz-nav-mobile]
          ├─ Get Started button
          └─ hamburger → setOpen(true)
  └─ MobileNav (open, onClose, pathname)   // renders overlay when open
```

## Testing / Verification

- Manual: resize browser across the 900px breakpoint — desktop nav above,
  collapsed bar below; no wrapping.
- Overlay opens/closes via hamburger, X, Escape, and link tap.
- Hosting accordion expands/collapses; sub-links navigate and close overlay.
- Body does not scroll while overlay is open; scroll restored after close.
- Active route highlighted in both desktop and overlay.
- Light and dark theme both readable in the overlay.
- Keyboard: hamburger focusable, `aria-expanded` toggles, Escape closes.

## Risks

- `!important` in CSS: acceptable and scoped to these helper classes; needed to
  beat inline `display`.
- Backdrop-blur overlay readability over page content — fall back to a more
  opaque background if needed.
