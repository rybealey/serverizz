import type { Metadata } from "next";
import { getPosts, getCategories } from "@/lib/wordpress";
import { pageMetadataFor } from "@/lib/seo";
import { BlogIndexView } from "@/components/szz/blog/blog-index-view";
import type { PostSummary, Category } from "@/lib/wp-map";

export const revalidate = 600;
export const metadata: Metadata = pageMetadataFor("/blog");

export default async function BlogIndexPage() {
  let featured: PostSummary | null = null;
  let rest: PostSummary[] = [];
  let categories: Category[] = [];
  let totalPages = 1;

  try {
    const [{ posts, totalPages: tp }, cats] = await Promise.all([getPosts({ perPage: 10 }), getCategories()]);
    const [first, ...remaining] = posts;
    featured = first ?? null;
    rest = remaining;
    categories = cats;
    totalPages = tp;
  } catch { /* render empty state below */ }

  return <BlogIndexView featured={featured} posts={rest} categories={categories} page={1} totalPages={totalPages} />;
}
