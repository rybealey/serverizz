import type { Metadata } from "next";
import { SITE_URL, SITE_NAME, pageMetadata } from "@/lib/seo";
import type { Post } from "@/lib/wp-map";

/** Per-article Metadata: registry-style canonical/OG/Twitter, plus article type + image. */
export function articleMetadata(post: Post): Metadata {
  const path = `/blog/${post.slug}`;
  const description = post.excerpt.slice(0, 160);
  const meta = pageMetadata({ title: post.title, description, path });
  const images = post.featuredImage
    ? [
        {
          url: post.featuredImage.url,
          ...(post.featuredImage.width ? { width: post.featuredImage.width } : {}),
          ...(post.featuredImage.height ? { height: post.featuredImage.height } : {}),
          ...(post.featuredImage.alt ? { alt: post.featuredImage.alt } : {}),
        },
      ]
    : undefined;
  meta.openGraph = { ...meta.openGraph, type: "article", ...(images ? { images } : {}) };
  if (images) meta.twitter = { ...meta.twitter, images };
  return meta;
}

/** BlogPosting JSON-LD (rendered via <JsonLdScript>). */
export function blogPostingJsonLd(post: Post): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.modified,
    url: `${SITE_URL}/blog/${post.slug}`,
    ...(post.featuredImage ? { image: post.featuredImage.url } : {}),
    ...(post.author ? { author: { "@type": "Person", name: post.author.name } } : {}),
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    ...(post.category ? { articleSection: post.category.name } : {}),
  };
}

/** Breadcrumb items: Home → Newsroom → [Category] → Post. */
export function blogBreadcrumb(post: Post) {
  const items = [
    { position: 1, name: "Home", item: `${SITE_URL}/` },
    { position: 2, name: "Newsroom", item: `${SITE_URL}/blog` },
  ];
  if (post.category) {
    items.push({ position: 3, name: post.category.name, item: `${SITE_URL}/blog/category/${post.category.slug}` });
  }
  items.push({ position: items.length + 1, name: post.title, item: `${SITE_URL}/blog/${post.slug}` });
  return items;
}
