import { getNewsWithAdjacent } from "@/lib/api";
import { createStaticOgImage, defaultOgSize } from "@/lib/og";

export const size = defaultOgSize;
export const contentType = "image/png";
export const alt = "Contentful News Article";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { notice } = await getNewsWithAdjacent(slug, false);

  const title = notice?.title ?? "Contentful News";

  return createStaticOgImage({
    title,
    label: "News",
    background:
      "linear-gradient(135deg, #0f172a 0%, #0f766e 45%, #0ea5e9 100%)",
    textColor: "#e2f3ff",
  });
}
