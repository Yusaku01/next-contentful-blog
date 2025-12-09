import { NextRequest, NextResponse } from "next/server";

const spaceId = process.env.CONTENTFUL_SPACE_ID;
const environmentId = process.env.CONTENTFUL_ENVIRONMENT || "master";
const cdaToken = process.env.CONTENTFUL_ACCESS_TOKEN;
const cmaToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const defaultLocale = process.env.CONTENTFUL_DEFAULT_LOCALE || "en-US";
const commentContentType =
  process.env.CONTENTFUL_COMMENT_CONTENT_TYPE || "comment";

type ContentfulEntry = {
  sys: { id: string; createdAt: string };
  fields: {
    body?: Record<string, string>;
    author?: Record<string, string>;
    subject?: Record<string, string>;
    parentComment?: Record<
      string,
      {
        sys: { id: string };
      }
    >;
  };
};

type Comment = {
  id: string;
  body: string;
  author: string;
  subject: string;
  createdAt: string;
  parentId: string | null;
};

function mapEntryToComment(entry: ContentfulEntry): Comment {
  return {
    id: entry.sys.id,
    body: entry.fields.body?.[defaultLocale] || "",
    author: entry.fields.author?.[defaultLocale] || "Anonymous",
    subject: entry.fields.subject?.[defaultLocale] || "",
    createdAt: entry.sys.createdAt,
    parentId: entry.fields.parentComment?.[defaultLocale]?.sys?.id ?? null,
  };
}

function missingEnv() {
  return !spaceId || !cdaToken || !cmaToken;
}

export async function GET(request: NextRequest) {
  if (missingEnv()) {
    return NextResponse.json(
      { error: "Contentful credentials are not configured." },
      { status: 500 }
    );
  }

  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json(
      { error: "Query parameter 'slug' is required." },
      { status: 400 }
    );
  }

  const url = new URL(
    `/spaces/${spaceId}/environments/${environmentId}/entries`,
    "https://cdn.contentful.com"
  );
  url.searchParams.set("content_type", commentContentType);
  url.searchParams.set("fields.subject", slug);
  url.searchParams.set("order", "sys.createdAt");

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${cdaToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to fetch comments." },
      { status: response.status }
    );
  }

  const data = await response.json();
  const items: ContentfulEntry[] = data.items || [];

  return NextResponse.json({
    items: items.map(mapEntryToComment),
  });
}

export async function POST(request: NextRequest) {
  if (missingEnv()) {
    return NextResponse.json(
      { error: "Contentful credentials are not configured." },
      { status: 500 }
    );
  }

  let bodyJson: {
    slug?: string;
    body?: string;
    author?: string;
    parentId?: string;
  };

  try {
    bodyJson = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const slug = bodyJson.slug?.trim();
  const body = bodyJson.body?.trim();
  const author = bodyJson.author?.trim();
  const parentId = bodyJson.parentId?.trim();

  if (!slug || !body) {
    return NextResponse.json(
      { error: "'slug' and 'body' are required." },
      { status: 400 }
    );
  }

  const entryRes = await fetch(
    `https://api.contentful.com/spaces/${spaceId}/environments/${environmentId}/entries`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cmaToken}`,
        "Content-Type": "application/vnd.contentful.management.v1+json",
        "X-Contentful-Content-Type": commentContentType,
      },
      body: JSON.stringify({
        fields: {
          body: { [defaultLocale]: body },
          author: { [defaultLocale]: author || "Anonymous" },
          subject: { [defaultLocale]: slug },
          ...(parentId
            ? {
                parentComment: {
                  [defaultLocale]: {
                    sys: { type: "Link", linkType: "Entry", id: parentId },
                  },
                },
              }
            : {}),
        },
      }),
    }
  );

  if (!entryRes.ok) {
    return NextResponse.json(
      { error: "Failed to create comment entry." },
      { status: entryRes.status }
    );
  }

  const entryData = (await entryRes.json()) as ContentfulEntry & {
    sys: { version: number };
  };

  const publishRes = await fetch(
    `https://api.contentful.com/spaces/${spaceId}/environments/${environmentId}/entries/${entryData.sys.id}/published`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${cmaToken}`,
        "X-Contentful-Version": entryData.sys.version.toString(),
      },
    }
  );

  if (!publishRes.ok) {
    return NextResponse.json(
      { error: "Failed to publish comment entry." },
      { status: publishRes.status }
    );
  }

  const publishedEntry = (await publishRes.json()) as ContentfulEntry;

  return NextResponse.json(mapEntryToComment(publishedEntry), { status: 201 });
}
