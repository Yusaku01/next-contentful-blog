import ContentfulImage from "@/lib/contentful-image";

export default function Avatar({
	name,
	picture,
}: {
	name: string;
	picture?: { url: string } | null;
}) {
	const initial = name?.trim()?.[0] ?? "";
	const hasPicture = Boolean(picture?.url);

	return (
		<div className="flex items-center">
			<div className="mr-3 w-10 h-10">
				{hasPicture ? (
					<ContentfulImage
						alt={name}
						className="object-cover h-full rounded-full"
						height={40}
						width={40}
						src={picture!.url}
					/>
				) : (
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-700">
						{initial}
					</div>
				)}
			</div>
			<div className="text-base font-semibold">{name}</div>
		</div>
	);
}
