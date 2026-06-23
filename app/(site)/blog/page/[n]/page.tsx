import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPosts, getCategories } from "@/lib/wordpress";
import { pageMetadataFor } from "@/lib/seo";
import { BlogIndexView } from "@/components/szz/blog/blog-index-view";
import type { PostSummary, Category } from "@/lib/wp-map";

export const revalidate = 600;

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }): Promise<Metadata> {
  const { n } = await params;
  const base = pageMetadataFor("/blog");
  return {
    ...base,
    title: `Newsroom — Page ${n}`,
    alternates: { canonical: `/blog/page/${n}` },
    openGraph: { ...(base.openGraph ?? {}), url: `/blog/page/${n}` },
  };
}

export default async function BlogIndexPaged({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const page = Number(n);
  if (!Number.isInteger(page) || page < 2) notFound();

  let posts: PostSummary[] = [];
  let totalPages = 1;
  let categories: Category[] = [];

  try {
    const [{ posts: p, totalPages: tp }, cats] = await Promise.all([getPosts({ perPage: 10, page }), getCategories()]);
    posts = p;
    totalPages = tp;
    categories = cats;
  } catch {
    notFound();
  }

  if (!posts.length) notFound();

  return <BlogIndexView featured={null} posts={posts} categories={categories} page={page} totalPages={totalPages} />;
}
