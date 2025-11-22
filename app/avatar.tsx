import ContentfulImage from "@/lib/contentful-image";

export default function Avatar({
  name,
  picture,
}: {
  name: string;
  picture: any;
}) {
  return (
    <div className="flex items-center">
      <div className="mr-3 w-10 h-10">
        <ContentfulImage
          alt={name}
          className="object-cover h-full rounded-full"
          height={40}
          width={40}
          src={picture.url}
        />
      </div>
      <div className="text-base font-semibold">{name}</div>
    </div>
  );
}
