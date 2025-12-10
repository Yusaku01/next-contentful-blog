import { draftMode } from "next/headers";
import Link from "next/link";

import { getAllPosts } from "@/lib/api";
import CoverImage from "../cover-image";
import DateComponent from "../date";

export const metadata = {
	title: "ブログ",
	description: "ブログ記事の一覧",
};

export default async function BlogPage() {
	const { isEnabled } = await draftMode();
	const posts = await getAllPosts(isEnabled);

	return (
		<div className="container mx-auto px-5 pb-16">
			<header className="max-w-5xl mx-auto mb-10 flex flex-col gap-2">
				<h1 className="text-3xl font-bold">Blog</h1>
				<p className="text-sm text-gray-600">
					最新の記事をカードで並べています。
				</p>
			</header>

			<div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
				{posts.map((post) => (
					<article
						key={post.slug}
						className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
					>
						<div className="mb-4 overflow-hidden rounded-lg">
							<CoverImage
								title={post.title}
								slug={post.slug}
								url={post.coverImage.url}
							/>
						</div>
						<h2 className="text-xl font-semibold leading-snug mb-2">
							<Link href={`/blog/${post.slug}`} className="hover:underline">
								{post.title}
							</Link>
						</h2>
						<div className="text-xs text-gray-500 mb-3">
							<DateComponent dateString={post.date} />
						</div>
						{post.excerpt && (
							<p className="text-sm text-gray-700 mb-4 line-clamp-3">
								{post.excerpt}
							</p>
						)}
						{post.author && (
							<div className="mt-auto text-xs text-gray-500">
								{post.author.name}
							</div>
						)}
					</article>
				))}
			</div>
		</div>
	);
}
