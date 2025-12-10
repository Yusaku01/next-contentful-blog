import { createStaticOgImage, defaultOgSize } from "@/lib/og";

export const size = defaultOgSize;
export const contentType = "image/png";
export const alt = "Contentful News";

export default function Image() {
	return createStaticOgImage({
		title: "Contentful News",
		label: "News",
		background:
			"linear-gradient(135deg, #0f172a 0%, #0f766e 45%, #0ea5e9 100%)",
		textColor: "#e2f3ff",
	});
}
