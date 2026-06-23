import type { MetadataRoute } from "next";
import { ROUTES, SITE_URL } from "@/lib/seo";
import { getPosts, getCategories } from "@/lib/wordpress";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const base: MetadataRoute.Sitemap = ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    lastModified,
    changeFrequency,
    priority,
  }));

  let blog: MetadataRoute.Sitemap = [];
  try {
    const [{ posts }, categories] = await Promise.all([getPosts({ perPage: 100 }), getCategories()]);
    blog = [
      ...posts.map((p) => ({
        url: `${SITE_URL}/blog/${p.slug}`,
        lastModified: new Date(p.modified || p.date),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
      ...categories.map((c) => ({
        url: `${SITE_URL}/blog/category/${c.slug}`,
        lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.5,
      })),
    ];
  } catch { /* sitemap still renders static routes if WP is down */ }

  return [...base, ...blog];
}
