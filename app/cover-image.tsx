import Link from "next/link";
import ContentfulImage from "../lib/contentful-image";

function cn(
	...classes: Array<
		| string
		| Record<string, boolean | null | undefined>
		| false
		| null
		| undefined
	>
) {
	return classes
		.flatMap((entry) => {
			if (!entry) return [];
			if (typeof entry === "string") return [entry];
			return Object.entries(entry)
				.filter(([, active]) => Boolean(active))
				.map(([name]) => name);
		})
		.join(" ");
}

export default function CoverImage({
	title,
	url,
	slug,
}: {
	title: string;
	url: string;
	slug?: string;
}) {
	const href = slug?.startsWith("/")
		? slug
		: slug
			? `/blog/${slug}`
			: undefined;
	const image = (
		<ContentfulImage
			alt={`Cover Image for ${title}`}
			priority
			width={1200}
			height={630}
			className={cn("shadow-small rounded-lg", {
				"hover:shadow-medium transition-shadow duration-200": slug,
			})}
			src={url}
		/>
	);

	return (
		<div className="sm:mx-0">
			{href ? (
				<Link href={href} aria-label={title}>
					{image}
				</Link>
			) : (
				image
			)}
		</div>
	);
}
