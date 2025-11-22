import Link from "next/link";
import { draftMode } from "next/headers";

import Date from "./date";
import CoverImage from "./cover-image";
import { getAllPosts, getAllNews } from "@/lib/api";

export default async function Page() {
  const { isEnabled } = await draftMode();
  const [posts, news] = await Promise.all([
    getAllPosts(isEnabled),
    getAllNews(isEnabled),
  ]);

  const latestPosts = posts.slice(0, 3);
  const latestNews = news.slice(0, 3);

  return (
    <div className="container mx-auto px-5 pb-16">
      <section className="max-w-5xl mx-auto mt-14 mb-12 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 p-8 text-white shadow-lg">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-300 mb-3">Contentful Blog</p>
        <h1 className="text-3xl font-bold leading-snug mb-3">ブログとお知らせのハブ</h1>
        <p className="text-sm text-slate-200 mb-6">
          記事とお知らせをまとめてチェックできます。ブログでは詳細な記事を、お知らせでは軽量なアップデートを届けます。
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
          >
            ブログを見る
          </Link>
          <Link
            href="/news"
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
          >
            お知らせを見る
          </Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto mb-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">最新のブログ</h2>
          <Link href="/blog" className="text-sm text-blue-600 hover:underline">
            すべて見る
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {latestPosts.map((post) => (
            <article
              key={post.slug}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:-translate-y-1 hover:shadow-md transition"
            >
              <div className="mb-3 overflow-hidden rounded-lg">
                <CoverImage title={post.title} slug={post.slug} url={post.coverImage.url} />
              </div>
              <h3 className="text-base font-semibold leading-snug mb-1">
                <Link href={`/blog/${post.slug}`} className="hover:underline">
                  {post.title}
                </Link>
              </h3>
              <div className="text-[11px] text-gray-500 mb-2">
                <Date dateString={post.date} />
              </div>
              {post.excerpt && (
                <p className="text-sm text-gray-700 line-clamp-2">{post.excerpt}</p>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">最新のお知らせ</h2>
          <Link href="/news" className="text-sm text-blue-600 hover:underline">
            すべて見る
          </Link>
        </div>
        <div className="divide-y divide-gray-200 border border-gray-200 rounded-xl bg-white shadow-sm">
          {latestNews.map((item) => (
            <Link
              key={item.slug}
              href={`/news/${item.slug}`}
              className="flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition"
            >
              <p className="text-base font-medium text-gray-900">{item.title}</p>
              <span className="text-[11px] text-gray-500">
                <Date dateString={item.date} />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
