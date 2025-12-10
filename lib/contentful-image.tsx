"use client";

import Image, { type ImageLoaderProps, type ImageProps } from "next/image";

type ContentfulImageProps = Omit<ImageProps, "loader"> & {
	src: string;
	alt: string;
};

const contentfulLoader = ({ src, width, quality }: ImageLoaderProps) => {
	return `${src}?w=${width}&q=${quality ?? 75}`;
};

export default function ContentfulImage(props: ContentfulImageProps) {
	const { alt, ...rest } = props;
	return <Image alt={alt} loader={contentfulLoader} {...rest} />;
}
