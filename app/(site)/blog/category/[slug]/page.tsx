import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategory, getCategories, getPosts } from "@/lib/wordpress";
import { pageMetadata } from "@/lib/seo";
import { SectionEyebrow } from "@/components/szz/section-eyebrow";
import { CategoryRail } from "@/components/szz/blog/category-rail";
import { PostCard } from "@/components/szz/blog/post-card";
import { Pagination } from "@/components/szz/blog/pagination";

export const revalidate = 600;

export async function generateStaticParams() {
  try {
    return (await getCategories()).map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const cat = await getCategory(slug).catch(() => null);
  if (!cat) return {};
  return pageMetadata({
    title: `${cat.name} — SERVERIZZ Newsroom`,
    description: cat.description || `${cat.name} guides and updates from the SERVERIZZ Newsroom.`,
    path: `/blog/category/${cat.slug}`,
  });
}

export default async function CategoryPage({
  params, searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const cat = await getCategory(slug).catch(() => null);
  if (!cat) notFound();

  let posts: Awaited<ReturnType<typeof getPosts>>["posts"] = [];
  let totalPages = 1;
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  try {
    const [res, cats] = await Promise.all([getPosts({ categoryId: cat.id, perPage: 10, page }), getCategories()]);
    posts = res.posts; totalPages = res.totalPages; categories = cats;
  } catch { /* render empty state below */ }

  return (
    <div>
      <section style={{ borderBottom: "1px solid var(--szz-border)", background: "var(--szz-bg-card)", padding: "80px 48px 50px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
          <SectionEyebrow>Newsroom</SectionEyebrow>
          <h1 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: 42, fontWeight: 700, lineHeight: 1.1, letterSpacing: "-1.5px", color: cat.colorVar }}>{cat.name}</h1>
          {cat.description && <p style={{ margin: 0, maxWidth: 600, fontSize: 17, lineHeight: 1.6, color: "var(--szz-text-muted)" }}>{cat.description}</p>}
          <div style={{ marginTop: 8 }}><CategoryRail categories={categories} activeSlug={cat.slug} /></div>
        </div>
      </section>
      <section style={{ padding: "48px 48px 90px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", flexDirection: "column", gap: 40 }}>
          {posts.length ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 22 }}>
              {posts.map((p) => <PostCard key={p.slug} post={p} />)}
            </div>
          ) : (
            <p style={{ color: "var(--szz-text-muted)", fontSize: 16 }}>No posts in this category yet.</p>
          )}
          <Pagination basePath={`/blog/category/${cat.slug}`} page={page} totalPages={totalPages} />
        </div>
      </section>
    </div>
  );
}
