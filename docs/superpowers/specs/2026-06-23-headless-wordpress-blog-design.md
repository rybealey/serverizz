# Headless WordPress Blog — Design Spec

**Date:** 2026-06-23
**Status:** Approved (design); pending implementation plan
**Branch:** `feat/headless-wordpress-blog`

## Summary

Build a headless WordPress blog as the public-facing front for SERVERIZZ's content,
pulling posts from the live WordPress instance at `newsroom.serverizz.com` via its REST
API and rendering them through branded Next.js templates so the blog matches the rest of
the site. Three template views from the design canvas (`SERVERIZZ Website.dc.html`) drive
the build: **index**, **article**, and **category**.

The goal is brand consistency: WordPress is the content store and editing surface; the
Next.js app owns all presentation.

## Context

- **App:** Next.js 16.2.9, App Router, React 19, Tailwind v4 with a `--szz-*` CSS-token
  design system in `app/globals.css`. Existing `components/szz/*` library + `components/ui/*`
  (shadcn-style). Single-source SEO registry in `lib/seo.ts`. External integrations follow a
  `lib/<service>.ts` + (optional) `app/api/*` pattern (see `lib/clientexec.ts`,
  `lib/uptime-kuma.ts`).
- **Deploy:** cPanel / Passenger running `next start` (not Vercel). Production has a long
  global route cache, so blog routes must set their own `revalidate` to stay fresh.
- **WordPress (verified live 2026-06-23):** "SERVERIZZ Newsroom". Standard REST at
  `/wp-json/wp/v2/*` (pretty permalinks now enabled). Namespaces include `wp/v2`. Posts
  expose `title`, `excerpt`, `content`, `slug`, `date`/`modified`, `categories`, `tags`,
  `author`, `featured_media`; `_embed` returns author + `wp:term` + `wp:featuredmedia` in one
  call. Pagination via `X-WP-Total` / `X-WP-TotalPages` headers. No custom post types or ACF.
  Currently near-empty: 1 post (Uncategorized), 1 author (`admin`), no tags/featured media —
  templates are being built ahead of content.

## Decisions (from brainstorming)

| Decision | Choice |
|---|---|
| WP connection | **REST API** (built-in `wp/v2`), WP already up |
| Freshness | **ISR** — static generation + timed revalidation (~10 min) |
| Body rendering | **Styled prose** — sanitize WP HTML, style every tag with `--szz-*` tokens |
| v1 scope | Index + article + category views; pagination/load-more; RSS feed + sitemap |
| v1 exclusions | Live search (deferred to a later version) |
| Category accent colors | **Code map by slug** → `--szz` token, with fallback |

## Architecture

```
WordPress (newsroom.serverizz.com)
   └─ REST: /wp-json/wp/v2/*  (posts, categories, tags, users, media via _embed)
        │
   lib/wordpress.ts   ← typed REST client (fetch + ISR revalidate, _embed, pagination)
   lib/wp-map.ts      ← raw WP JSON → clean domain types + derived fields
        │
   app/(site)/blog/** ← Server Components, ISR; render branded templates
        │
   components/szz/blog/* ← presentational pieces matching the design canvas
```

All rendering is server-side with ISR. No client-side data fetching and no API-route proxy
to WordPress — templates render on the server, so the WP base URL never reaches the browser.
One `_embed`'d request per page covers author, categories, and featured image together.

## Routes

All under the existing `(site)` route group so `SiteNav` / `SiteFooter` / theme wrap for free.

| Route | Template | Rendering |
|---|---|---|
| `/blog` | Index — featured post + recent grid + category rail | ISR `revalidate: 600` |
| `/blog/page/[n]` | Index pagination (older posts) | ISR `revalidate: 600` |
| `/blog/[slug]` | Article — hero, prose body, TOC, author byline, related | ISR `revalidate: 600` |
| `/blog/category/[slug]` | Category listing + pagination (`?page=`) | ISR `revalidate: 600` |
| `/blog/feed.xml` | RSS 2.0 route handler | ISR `revalidate: 3600` |

- `generateStaticParams` pre-builds known post slugs and category slugs at build time; new
  content renders on-demand, then caches (ISR).
- Per-route `revalidate` overrides the global long route cache so posts refresh within ~10 min.
- Unknown slug/category → `notFound()` (404).

## WordPress data layer

### `lib/wordpress.ts` — typed REST client

- Functions: `getPosts({ page, perPage, categoryId, search })`, `getPost(slug)`,
  `getCategories()`, `getCategory(slug)`, `getPostsByCategory(slug, { page })`.
- Always requests `_embed=1` so author/terms/featured media arrive in one call.
- Reads `X-WP-Total` / `X-WP-TotalPages` response headers to return pagination metadata
  (`{ items, total, totalPages }`).
- All fetches use `next: { revalidate, tags: ['wp-posts'] }`.
- Base URL from `WORDPRESS_API_URL` env (added to `.env.example`), e.g.
  `https://newsroom.serverizz.com/wp-json/wp/v2`. Default is the pretty-permalink form;
  client builds endpoint paths from this base.
- Network/HTTP errors throw a typed error the route layer can catch for empty-state vs 404.

### `lib/wp-map.ts` — domain types + derived fields

- Maps raw WP JSON → clean types: `Post`, `PostSummary`, `Category`, `Author`.
- Computes fields WordPress does not provide:
  - **Reading time** = `ceil(wordCount / 200)` minutes, from text content.
  - **Table of contents** — extract `<h2>`/`<h3>` headings from content, inject anchor
    `id`s, return `{ id, label, level }[]` for the article TOC.
- **`BLOG_CATEGORY_COLORS`**: `Record<slug, szzToken>` map + a default fallback token, used
  to color category pills. New categories use the fallback until added to the map.
- Style mirrors the existing `lib/seo.ts` registry (typed, single-source, documented).

### Images

- Featured images render through `next/image`; add `newsroom.serverizz.com` to
  `next.config.ts` `images.remotePatterns`.
- Posts without a featured image (current state) get a graceful branded fallback (no broken
  image, no layout shift).
- **Passenger note:** `next/image` optimization needs `sharp` + a writable cache dir on the
  cPanel box. Default to optimized; documented fallback is `unoptimized` (WP already emits
  sized thumbnails) if the box can't support optimization.

## Body rendering — `<BlogProse>`

- Sanitizes WP HTML (defense-in-depth) via a rehype / `sanitize-html` pipeline, then renders
  inside a scoped `.szz-prose` container.
- Add `.szz-prose` rules to `app/globals.css` mapping every tag to `--szz-*` tokens and the
  Sora / Inter / JetBrains font variables: `h2`–`h4`, `p`, `ul`/`ol`/`li`, `blockquote`,
  `pre`/`code`, `table`, `img`, `a`, `hr`.
- The same pipeline injects heading `id`s so TOC anchors resolve; respects `scroll-margin-top`
  for the sticky nav offset.

## Component mapping (design canvas → real components)

Reuse the existing kit: `SectionEyebrow`, `Badge` (category pills), `Card`, `Button`,
`SiteNav`, `SiteFooter`. New presentational components under `components/szz/blog/`:

- `BlogFeatured` — large featured-post card (index hero).
- `PostCard` — recent/related/category list item.
- `CategoryRail` — category list with post counts + accent pills.
- `ArticleHero` — title, category pill, date, reading time, breadcrumb.
- `ArticleToc` — sticky table of contents from computed headings.
- `AuthorByline` — author name/avatar/description (from embedded author).
- `RelatedPosts` — same-category posts (fallback: most recent), excluding current.
- `Pagination` — prev/next + page numbers for index and category lists.

All presentational; they receive mapped domain types as props and own no data fetching.

## SEO (extends `lib/seo.ts`, does not fork it)

- Add `blogMetadataFor(post)` and a blog-index entry alongside the existing registry.
  Article pages get per-post `title`, `description` (from excerpt), canonical URL, and OG
  image (featured image, with site default fallback).
- JSON-LD: `BlogPosting` per article + `Breadcrumb` (Home → Blog → [Category] → Post),
  reusing existing `JsonLdScript` / `breadcrumbTrail` helpers.
- `app/sitemap.ts` extended to include blog post + category URLs pulled from WP.
- RSS 2.0 at `/blog/feed.xml`.

## Error handling & edge cases

- WP unreachable → index/category render a branded empty state (no crash); article →
  `notFound()`.
- Empty WordPress (today) renders valid empty templates.
- Per-post fallbacks: no featured image → branded placeholder; no excerpt → derived/empty;
  Uncategorized → default pill color.
- Sanitizer strips scripts/unsafe attributes from post HTML.

## Testing (Vitest, existing setup)

- `lib/wp-map.test.ts` — reading-time math, TOC extraction + ID injection, category color
  mapping + fallback, field fallbacks (missing image/excerpt/author), against captured WP
  JSON fixtures.
- `lib/wordpress.test.ts` — endpoint URL/param construction, `_embed` inclusion, pagination
  header parsing, error paths, with mocked `fetch`.

## Out of scope (v1)

- Live search UI (deferred).
- Comments, post reactions, author archive pages, tag pages.
- On-demand revalidation webhook from WP (ISR timer is sufficient for v1; webhook is a
  natural later upgrade).
- Gutenberg block → React component mapping (using styled prose instead).

## WordPress-side prerequisites / nice-to-haves

- Pretty permalinks: **done** (enabled 2026-06-23) — `/wp-json/wp/v2/*` confirmed live.
- Set a real author display name (currently `admin`) before launch.
- Create real categories; add their slugs to `BLOG_CATEGORY_COLORS`.
- Populate posts with featured images + excerpts for best template fidelity.

## Environment / config changes

- `.env.example`: add `WORDPRESS_API_URL=https://newsroom.serverizz.com/wp-json/wp/v2`.
- `next.config.ts`: add `newsroom.serverizz.com` to `images.remotePatterns`.
