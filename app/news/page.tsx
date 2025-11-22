import Link from "next/link";
import { draftMode } from "next/headers";

import Date from "../date";
import { getAllNews } from "@/lib/api";

export const metadata = {
  title: "お知らせ",
  description: "お知らせ一覧",
};

export default async function NewsPage() {
  const { isEnabled } = await draftMode();
  const notices = await getAllNews(isEnabled);

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
    </div>
  );
}

