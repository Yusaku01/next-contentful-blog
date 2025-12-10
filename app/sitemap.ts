// export const revalidate = 0;

import type { MetadataRoute } from "next";
import { getAllNewsEntries, getAllPosts } from "@/lib/api";

const siteUrl = (
	process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const [posts, news] = await Promise.all([
		getAllPosts(false),
		getAllNewsEntries(false),
	]);

	const now = new Date();
	const entries: MetadataRoute.Sitemap = [
		{
			url: `${siteUrl}/`,
			lastModified: now,
			changeFrequency: "weekly",
			priority: 1,
		},
		{
			url: `${siteUrl}/blog`,
			lastModified: posts[0]?.date ? new Date(posts[0].date) : now,
			changeFrequency: "weekly",
			priority: 0.8,
		},
		{
			url: `${siteUrl}/news`,
			lastModified: news[0]?.date ? new Date(news[0].date) : now,
			changeFrequency: "weekly",
			priority: 0.6,
		},
	];

	posts.forEach((post) => {
		entries.push({
			url: `${siteUrl}/blog/${post.slug}`,
			lastModified: post.date ? new Date(post.date) : now,
			changeFrequency: "weekly",
			priority: 0.6,
		});
	});

	news.forEach((item) => {
		entries.push({
			url: `${siteUrl}/news/${item.slug}`,
			lastModified: item.date ? new Date(item.date) : now,
			changeFrequency: "weekly",
			priority: 0.5,
		});
	});

	return entries;
}
