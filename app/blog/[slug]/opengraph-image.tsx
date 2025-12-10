import { getPostWithAdjacent } from "@/lib/api";
import { createStaticOgImage, defaultOgSize } from "@/lib/og";

export const size = defaultOgSize;
export const contentType = "image/png";
export const alt = "Contentful Blog Post";

export default async function Image({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const { post } = await getPostWithAdjacent(slug, false);

	const title = post?.title ?? "Contentful Blog";

	return createStaticOgImage({
		title,
		label: "Blog",
		background:
			"linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
	});
}
