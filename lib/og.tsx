import { ImageResponse } from "next/og";

type OgOptions = {
	title: string;
	label?: string;
	background: string;
	textColor?: string;
	size?: {
		width: number;
		height: number;
	};
};

const defaultSize = { width: 1200, height: 630 };

/**
 * Generate a simple branded OG image with a label and title.
 * Keeps layout consistent across sections while allowing palette tweaks.
 */
export function createStaticOgImage({
	title,
	label,
	background,
	textColor = "#ffffff",
	size = defaultSize,
}: OgOptions) {
	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				background,
				color: textColor,
				fontSize: 72,
				fontWeight: 700,
				letterSpacing: "-0.02em",
			}}
		>
			{label ? (
				<div style={{ fontSize: 32, opacity: 0.8, marginBottom: 12 }}>
					{label}
				</div>
			) : null}
			<div>{title}</div>
		</div>,
		size,
	);
}

export const defaultOgSize = defaultSize;
