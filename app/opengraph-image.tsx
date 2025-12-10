import { createStaticOgImage, defaultOgSize } from "@/lib/og";

export const size = defaultOgSize;
export const contentType = "image/png";
export const alt = "Contentful Blog - ブログとお知らせのハブ";

export default function Image() {
	return createStaticOgImage({
		title: "ブログとお知らせのハブ",
		label: "Contentful Blog",
		background:
			"linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
	});
}
