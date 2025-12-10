import Link from "next/link";
import Avatar from "./avatar";
import CoverImage from "./cover-image";
import DateComponent from "./date";

type ImageField = {
	url: string;
};

type Author = {
	name: string;
	picture: ImageField;
};

type PostPreviewData = {
	title: string;
	coverImage: ImageField;
	date: string;
	excerpt?: string;
	author?: Author;
	slug: string;
};

function PostPreview({
	title,
	coverImage,
	date,
	excerpt,
	author,
	slug,
}: PostPreviewData) {
	return (
		<article className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
			<div className="mb-4 overflow-hidden rounded-lg">
				<CoverImage title={title} slug={`/blog/${slug}`} url={coverImage.url} />
			</div>
			<h3 className="text-xl font-semibold leading-snug mb-2">
				<Link href={`/blog/${slug}`} className="hover:underline">
					{title}
				</Link>
			</h3>
			<div className="text-xs text-gray-500 mb-3">
				<DateComponent dateString={date} />
			</div>
			{excerpt && (
				<p className="text-sm text-gray-700 mb-4 line-clamp-3">{excerpt}</p>
			)}
			{author && <Avatar name={author.name} picture={author.picture} />}
		</article>
	);
}

export default function MoreStories({
	morePosts,
}: {
	morePosts: PostPreviewData[];
}) {
	return (
		<section className="max-w-5xl mx-auto">
			<h2 className="mb-6 text-2xl font-bold tracking-tight">More Stories</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-16">
				{morePosts.map((post) => (
					<PostPreview
						key={post.slug}
						title={post.title}
						coverImage={post.coverImage}
						date={post.date}
						author={post.author}
						slug={post.slug}
						excerpt={post.excerpt}
					/>
				))}
			</div>
		</section>
	);
}
