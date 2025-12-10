"use client";

import Image from "next/image";

interface ContentfulImageProps {
	src: string;
	alt: string;
	width?: number;
	height?: number;
	quality?: number;
	[key: string]: unknown; // For other props that might be passed
}

const contentfulLoader = ({ src, width, quality }: ContentfulImageProps) => {
	return `${src}?w=${width}&q=${quality || 75}`;
};

export default function ContentfulImage(props: ContentfulImageProps) {
	return <Image alt={props.alt} loader={contentfulLoader} {...props} />;
}
