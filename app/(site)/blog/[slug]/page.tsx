import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BreadcrumbJsonLd, JsonLdScript } from "next-seo";
import { getPost, getPosts } from "@/lib/wordpress";
import { articleMetadata, blogPostingJsonLd, blogBreadcrumb } from "@/lib/blog-seo";
import { ArticleHero } from "@/components/szz/blog/article-hero";
import { ArticleToc } from "@/components/szz/blog/article-toc";
import { BlogProse } from "@/components/szz/blog/blog-prose";
import { AuthorByline } from "@/components/szz/blog/author-byline";
import { RelatedPosts } from "@/components/szz/blog/related-posts";

export const revalidate = 600;

export async function generateStaticParams() {
  try {
    const { posts } = await getPosts({ perPage: 100 });
    return posts.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug).catch(() => null);
  return post ? articleMetadata(post) : {};
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug).catch(() => null);
  if (!post) notFound();

  let related: Awaited<ReturnType<typeof getPosts>>["posts"] = [];
  try {
    const { posts } = await getPosts({ perPage: 4, categoryId: post.category?.id });
    related = posts.filter((p) => p.slug !== post.slug).slice(0, 3);
  } catch { /* related is best-effort */ }

  return (
    <article style={{ padding: "60px 48px 90px" }}>
      <BreadcrumbJsonLd items={blogBreadcrumb(post)} />
      <JsonLdScript data={blogPostingJsonLd(post)} scriptKey="blog-posting" />
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 240px", gap: 48, alignItems: "start" }}>
        <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 32 }}>
          <ArticleHero post={post} />
          <BlogProse html={post.contentHtml} />
          {post.author && <AuthorByline author={post.author} />}
          <RelatedPosts posts={related} />
        </div>
        <aside><ArticleToc toc={post.toc} /></aside>
      </div>
    </article>
  );
}
