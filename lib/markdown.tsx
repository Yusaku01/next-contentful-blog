import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import type { Block, Document } from "@contentful/rich-text-types";
import { BLOCKS } from "@contentful/rich-text-types";
import Image from "next/image";

interface Asset {
	sys: {
		id: string;
	};
	url: string;
	description: string;
}

interface AssetLink {
	block: Asset[];
}

interface Content {
	json: Document;
	links: {
		assets: AssetLink;
	};
}

function RichTextAsset({
	id,
	assets,
}: {
	id: string;
	assets: Asset[] | undefined;
}) {
	const asset = assets?.find((asset) => asset.sys.id === id);

	if (asset?.url) {
		return <Image src={asset.url} layout="fill" alt={asset.description} />;
	}

	return null;
}

export function Markdown({ content }: { content: Content }) {
	return documentToReactComponents(content.json, {
		renderNode: {
			[BLOCKS.EMBEDDED_ASSET]: (node: Block) => {
				const assetId =
					typeof node.data === "object" && node.data?.target?.sys?.id;
				if (!assetId) return null;
				return (
					<RichTextAsset
						id={assetId as string}
						assets={content.links.assets.block}
					/>
				);
			},
		},
	});
}
