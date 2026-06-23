import { renderProse, type TocItem } from "@/lib/wp-prose";

// ---------- Raw WordPress REST shapes (only the fields we use) ----------
interface Rendered { rendered: string }
export interface RawWpTerm { id: number; slug: string; name: string; taxonomy: string }
export interface RawWpPost {
  id: number;
  slug: string;
  date: string;
  modified: string;
  title: Rendered;
  excerpt: Rendered;
  content: Rendered;
  categories: number[];
  _embedded?: {
    author?: { name: string; slug: string; description?: string; avatar_urls?: Record<string, string> }[];
    "wp:featuredmedia"?: { source_url: string; alt_text?: string; media_details?: { width?: number; height?: number } }[];
    "wp:term"?: RawWpTerm[][];
  };
}
export interface RawWpCategory { id: number; slug: string; name: string; count: number; description: string }

// ---------- Domain types ----------
export interface Author { name: string; slug: string; description: string; avatarUrl: string | null }
export interface PostCategory { id: number; slug: string; name: string; colorVar: string }
export interface Category extends PostCategory { count: number; description: string }
export interface FeaturedImage { url: string; alt: string; width: number | null; height: number | null }
export interface PostSummary {
  id: number; slug: string; title: string; excerpt: string;
  date: string; modified: string; dateLabel: string; readingMinutes: number;
  category: PostCategory | null; featuredImage: FeaturedImage | null;
}
export interface Post extends PostSummary { contentHtml: string; toc: TocItem[]; author: Author | null }

// ---------- Category accent colors (slug → --szz token; brand consistency) ----------
const CATEGORY_COLORS: Record<string, string> = {
  "hosting-101": "--szz-accent-blue",
  wordpress: "--szz-accent-blue",
  "small-business": "--szz-green",
  "domains-email": "--szz-green",
  "security-speed": "--szz-yellow",
};
const DEFAULT_CATEGORY_COLOR = "--szz-accent-blue";

export function categoryColorVar(slug: string): string {
  return `var(${CATEGORY_COLORS[slug] ?? DEFAULT_CATEGORY_COLOR})`;
}

// ---------- Derived fields WordPress doesn't provide ----------
function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#8217;/g, "'").replace(/&[a-z0-9#]+;/gi, " ").replace(/\s+/g, " ").trim();
}

export function readingMinutes(html: string): number {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(iso));
}

// ---------- Mappers ----------
function embeddedCategory(raw: RawWpPost): PostCategory | null {
  const term = raw._embedded?.["wp:term"]?.flat().find((t) => t.taxonomy === "category");
  if (!term) return null;
  return { id: term.id, slug: term.slug, name: term.name, colorVar: categoryColorVar(term.slug) };
}

function embeddedImage(raw: RawWpPost): FeaturedImage | null {
  const m = raw._embedded?.["wp:featuredmedia"]?.[0];
  if (!m?.source_url) return null;
  return { url: m.source_url, alt: m.alt_text || "", width: m.media_details?.width ?? null, height: m.media_details?.height ?? null };
}

export function mapPostSummary(raw: RawWpPost): PostSummary {
  return {
    id: raw.id,
    slug: raw.slug,
    title: stripHtml(raw.title.rendered),
    excerpt: stripHtml(raw.excerpt.rendered),
    date: raw.date,
    modified: raw.modified,
    dateLabel: formatDate(raw.date),
    readingMinutes: readingMinutes(raw.content?.rendered ?? raw.excerpt.rendered),
    category: embeddedCategory(raw),
    featuredImage: embeddedImage(raw),
  };
}

export function mapPost(raw: RawWpPost): Post {
  const summary = mapPostSummary(raw);
  const { html, toc } = renderProse(raw.content.rendered);
  const a = raw._embedded?.author?.[0];
  const author: Author | null = a
    ? { name: a.name, slug: a.slug, description: a.description ?? "", avatarUrl: a.avatar_urls?.["96"] ?? null }
    : null;
  return { ...summary, contentHtml: html, toc, author };
}

export function mapCategory(raw: RawWpCategory): Category {
  return { id: raw.id, slug: raw.slug, name: raw.name, count: raw.count, description: stripHtml(raw.description), colorVar: categoryColorVar(raw.slug) };
}
