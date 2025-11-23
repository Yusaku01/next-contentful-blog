import Link from "next/link";
import { notFound } from "next/navigation";
import { draftMode } from "next/headers";

import Date from "../date";
import { getPaginatedNews } from "@/lib/api";

export const metadata = {
  title: "お知らせ",
  description: "お知らせ一覧",
};

export default async function NewsPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const { isEnabled } = await draftMode();
  const params = await searchParams;
  const pageParam = Number.parseInt(params?.page ?? "1", 10);
  const currentPage = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const pageSize = 10;
  const skip = (currentPage - 1) * pageSize;

  const { items: notices, total } = await getPaginatedNews(isEnabled, {
    limit: pageSize,
    skip,
  });

  const totalPages = total > 0 ? Math.ceil(total / pageSize) : 1;
  if (total > 0 && currentPage > totalPages) {
    notFound();
  }

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;
  const buildPageLink = (page: number) =>
    page <= 1 ? "/news" : `/news?page=${page}`;

  console.log("[/news] draft mode:", isEnabled);
  console.log("[/news] notices count:", notices.length);
  console.log("[/news] notices:", JSON.stringify(notices, null, 2));

  if (notices.length === 0) {
    return (
      <div className="container mx-auto px-5 pb-16">
        <header className="max-w-3xl mx-auto mb-8">
          <h1 className="text-3xl font-bold">News</h1>
          <p className="text-sm text-gray-600">シンプルにタイトルと日付のみを表示します。</p>
        </header>
        <div className="max-w-3xl mx-auto">
          <p className="text-gray-500">お知らせがまだありません。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-5 pb-16">
      <header className="max-w-3xl mx-auto mb-8">
        <h1 className="text-3xl font-bold">News</h1>
        <p className="text-sm text-gray-600">シンプルにタイトルと日付のみを表示します。</p>
      </header>

      <div className="max-w-3xl mx-auto divide-y divide-gray-200 border border-gray-200 rounded-xl bg-white shadow-sm">
        {notices.map((notice) => (
          <Link
            href={`/news/${notice.slug}`}
            key={notice.slug}
            className="flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition"
          >
            <div className="flex-1">
              <p className="text-base font-medium text-gray-900">{notice.title}</p>
            </div>
            <div className="text-xs text-gray-500">
              <Date dateString={notice.date} />
            </div>
          </Link>
        ))}
      </div>

      <div className="max-w-3xl mx-auto mt-6 flex items-center justify-between text-sm text-gray-700">
        {hasPrev ? (
          <Link
            href={buildPageLink(currentPage - 1)}
            className="text-blue-600 hover:underline"
          >
            前の10件
          </Link>
        ) : (
          <span className="text-gray-400">前の10件</span>
        )}

        <span>
          {currentPage} / {totalPages} ページ
        </span>

        {hasNext ? (
          <Link
            href={buildPageLink(currentPage + 1)}
            className="text-blue-600 hover:underline"
          >
            次の10件
          </Link>
        ) : (
          <span className="text-gray-400">次の10件</span>
        )}
      </div>
    </div>
  );
}
