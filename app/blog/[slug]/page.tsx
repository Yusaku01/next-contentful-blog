import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { draftMode } from "next/headers";

import Avatar from "../../avatar";
import Date from "../../date";
import CoverImage from "../../cover-image";
import { Markdown } from "@/lib/markdown";
import { getAllPosts, getPostWithAdjacent } from "@/lib/api";
import { Comments } from "./Comments";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const allPosts = await getAllPosts(false);

  return allPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { post } = await getPostWithAdjacent(slug, false);

  if (!post) {
    return {};
  }

  const description = post.excerpt || "ブログ記事";

  return {
    title: `${post.title} | ブログ`,
    description,
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title: post.title,
      description,
      type: "article",
      url: `/blog/${slug}`,
      publishedTime: post.date,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const { isEnabled } = await draftMode();
  const { post, newer, older } = await getPostWithAdjacent(slug, isEnabled);

  if (!post) {
    notFound();
  }

  return (
    <div className="container mx-auto px-5 pb-16">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 text-sm text-gray-500">
          <Link href="/">Home</Link> <span className="mx-1">/</span>
          <Link href="/blog" className="hover:underline">
            Blog
          </Link>
        </div>

        <h1 className="mb-6 text-3xl font-bold leading-tight tracking-tight">
          {post.title}
        </h1>

        <div className="mb-4 flex items-center justify-between text-xs text-gray-600">
          <Date dateString={post.date} />
          {post.author && (
            <div className="ml-4">
              <Avatar name={post.author.name} picture={post.author.picture} />
            </div>
          )}
        </div>

        {post.coverImage?.url && (
          <div className="mb-6">
            <CoverImage title={post.title} url={post.coverImage.url} />
          </div>
        )}

        <article className="prose prose-neutral max-w-none">
          <Markdown content={post.content} />
        </article>

        <div className="mt-10">
          <Comments slug={slug} />
        </div>

        <nav className="mt-10 border-t border-gray-200 pt-6 flex flex-col gap-3 text-sm">
          {newer && (
            <Link
              href={`/blog/${newer.slug}`}
              className="text-blue-600 hover:underline"
            >
              次の記事: {newer.title}
            </Link>
          )}
          {older && (
            <Link
              href={`/blog/${older.slug}`}
              className="text-blue-600 hover:underline"
            >
              前の記事: {older.title}
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
}
