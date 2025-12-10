import type { Metadata } from "next";
import { draftMode } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getAllNewsEntries, getNewsWithAdjacent } from "@/lib/api";
import { Markdown } from "@/lib/markdown";
import CoverImage from "../../cover-image";
import DateComponent from "../../date";

type Props = {
	params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
	const allNews = await getAllNewsEntries(false);

	return allNews.map((item) => ({
		slug: item.slug,
	}));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const { notice } = await getNewsWithAdjacent(slug, false);

	if (!notice) {
		return {};
	}

	const description =
		notice.excerpt || (notice.content?.json ? "お知らせ記事" : undefined);

	return {
		title: `${notice.title} | お知らせ`,
		description,
		alternates: {
			canonical: `/news/${slug}`,
		},
		openGraph: {
			title: notice.title,
			description,
			type: "article",
			url: `/news/${slug}`,
			publishedTime: notice.date,
		},
	};
}

export default async function NewsDetailPage({ params }: Props) {
	const { slug } = await params;
	const { isEnabled } = await draftMode();
	const { notice, newer, older } = await getNewsWithAdjacent(slug, isEnabled);

	if (!notice) {
		notFound();
	}

	return (
		<div className="container mx-auto px-5 pb-16">
			<div className="max-w-3xl mx-auto">
				<div className="mb-6 text-sm text-gray-500">
					<Link href="/">Home</Link> <span className="mx-1">/</span>
					<Link href="/news" className="hover:underline">
						News
					</Link>
				</div>

				<h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight">
					{notice.title}
				</h1>
				<div className="mb-4 text-xs text-gray-600">
					<DateComponent dateString={notice.date} />
				</div>

				{notice.coverImage?.url && (
					<div className="mb-6">
						<CoverImage title={notice.title} url={notice.coverImage.url} />
					</div>
				)}

				{notice.content && (
					<article className="prose prose-neutral max-w-none">
						<Markdown content={notice.content} />
					</article>
				)}

				<nav className="mt-10 border-t border-gray-200 pt-6 flex flex-col gap-3 text-sm">
					{newer && (
						<Link
							href={`/news/${newer.slug}`}
							className="text-blue-600 hover:underline"
						>
							次のお知らせ: {newer.title}
						</Link>
					)}
					{older && (
						<Link
							href={`/news/${older.slug}`}
							className="text-blue-600 hover:underline"
						>
							前のお知らせ: {older.title}
						</Link>
					)}
				</nav>
			</div>
		</div>
	);
}
