import { SectionEyebrow } from "@/components/szz/section-eyebrow";
import { CategoryRail } from "@/components/szz/blog/category-rail";
import { BlogFeatured } from "@/components/szz/blog/blog-featured";
import { PostCard } from "@/components/szz/blog/post-card";
import { Pagination } from "@/components/szz/blog/pagination";
import type { PostSummary, Category } from "@/lib/wp-map";

export function BlogIndexView({
  featured, posts, categories, page, totalPages,
}: {
  featured: PostSummary | null;
  posts: PostSummary[];
  categories: Category[];
  page: number;
  totalPages: number;
}) {
  return (
    <div>
      <section style={{ borderBottom: "1px solid var(--szz-border)", background: "var(--szz-bg-card)", padding: "80px 48px 50px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
          <SectionEyebrow>Newsroom</SectionEyebrow>
          <h1 style={{ margin: 0, maxWidth: 760, fontFamily: "var(--font-heading)", fontSize: 46, fontWeight: 700, lineHeight: 1.06, letterSpacing: "-1.5px", color: "var(--szz-text-primary)" }}>Field notes for getting online.</h1>
          <p style={{ margin: 0, maxWidth: 600, fontSize: 17, lineHeight: 1.6, color: "var(--szz-text-muted)" }}>Plain-English guides to hosting, WordPress, domains and running a small business on the web — written by the people who keep it all running.</p>
          <div style={{ marginTop: 8 }}><CategoryRail categories={categories} /></div>
        </div>
      </section>
      <section style={{ padding: "48px 48px 90px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", flexDirection: "column", gap: 40 }}>
          {page === 1 && featured && <BlogFeatured post={featured} />}
          {posts.length ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 22 }}>
              {posts.map((p) => <PostCard key={p.slug} post={p} />)}
            </div>
          ) : (
            <p style={{ color: "var(--szz-text-muted)", fontSize: 16 }}>No posts published yet — check back soon.</p>
          )}
          <Pagination basePath="/blog" page={page} totalPages={totalPages} />
        </div>
      </section>
    </div>
  );
}
