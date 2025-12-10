import type { Document } from "@contentful/rich-text-types";

const POST_GRAPHQL_FIELDS = `
  slug
  title
  coverImage {
    url
  }
  date
  author {
    name
    picture {
      url
    }
  }
  excerpt
  content {
    json
    links {
      assets {
        block {
          sys {
            id
          }
          url
          description
        }
      }
    }
  }
`;

const NOTICE_GRAPHQL_FIELDS = `
  slug
  title
  coverImage: cover {
    url
  }
  date
  excerpt
  content {
    json
    links {
      assets {
        block {
          sys {
            id
          }
          url
          description
        }
      }
    }
  }
`;

// /news ページ用の軽量版（title, slug, date のみ）
const NOTICE_LIST_FIELDS = `
  slug
  title
  date
`;

type ImageField = {
	url: string;
};

type Author = {
	name: string;
	picture?: ImageField | null;
} | null;

type RichTextAsset = {
	sys: { id: string };
	url: string;
	description: string;
};

type RichTextContent = {
	json: Document;
	links: {
		assets: {
			block: RichTextAsset[];
		};
	};
};

export type Post = {
	slug: string;
	title: string;
	coverImage?: ImageField | null;
	date: string;
	author?: Author;
	excerpt?: string;
	content?: RichTextContent;
};

type Notice = {
	slug: string;
	title: string;
	coverImage?: ImageField | null;
	date: string;
	excerpt?: string;
	content?: RichTextContent;
};

type GraphqlResponse = {
	data?: {
		postCollection?: {
			items?: Post[];
		};
		noticeCollection?: {
			items?: Notice[];
			total?: number;
			limit?: number;
			skip?: number;
		};
		newer?: {
			items?: Notice[];
		};
		older?: {
			items?: Notice[];
		};
	};
	errors?: unknown;
};

type NewsPaginationOptions = {
	limit?: number;
	skip?: number;
};

async function fetchGraphQL(
	query: string,
	preview = false,
	tag = "posts",
): Promise<GraphqlResponse> {
	const isDev = process.env.NODE_ENV === "development";

	const fetchOptions = isDev
		? { cache: "no-store" as const }
		: { next: { tags: [tag] } };

	const response = await fetch(
		`https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${
					preview
						? process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN
						: process.env.CONTENTFUL_ACCESS_TOKEN
				}`,
			},
			body: JSON.stringify({ query }),
			...fetchOptions,
		},
	);

	return (await response.json()) as GraphqlResponse;
}

function extractPost(fetchResponse: GraphqlResponse): Post | undefined {
	return fetchResponse.data?.postCollection?.items?.[0];
}

function extractPostEntries(fetchResponse: GraphqlResponse): Post[] {
	return fetchResponse.data?.postCollection?.items ?? [];
}

function extractNotice(fetchResponse: GraphqlResponse): Notice | undefined {
	return fetchResponse.data?.noticeCollection?.items?.[0];
}

function extractNoticeCollection(fetchResponse: GraphqlResponse): {
	items: Notice[];
	total: number;
	limit: number;
	skip: number;
} {
	const collection = fetchResponse.data?.noticeCollection;
	return {
		items: collection?.items ?? [],
		total: collection?.total ?? 0,
		limit: collection?.limit ?? 0,
		skip: collection?.skip ?? 0,
	};
}

export async function getPreviewPostBySlug(
	slug: string | null,
): Promise<Post | undefined> {
	const entry = await fetchGraphQL(
		`query {
      postCollection(where: { slug: "${slug}" }, preview: true, limit: 1) {
        items {
          ${POST_GRAPHQL_FIELDS}
        }
      }
    }`,
		true,
		"posts",
	);
	return extractPost(entry);
}

export async function getAllPosts(isDraftMode: boolean): Promise<Post[]> {
	const entries = await fetchGraphQL(
		`query {
      postCollection(where: { slug_exists: true }, order: date_DESC, preview: ${
				isDraftMode ? "true" : "false"
			}) {
        items {
          ${POST_GRAPHQL_FIELDS}
        }
      }
    }`,
		isDraftMode,
		"posts",
	);
	return extractPostEntries(entries);
}

export async function getPostAndMorePosts(
	slug: string,
	preview: boolean,
): Promise<{ post: Post | undefined; morePosts: Post[] }> {
	const entry = await fetchGraphQL(
		`query {
      postCollection(where: { slug: "${slug}" }, preview: ${
				preview ? "true" : "false"
			}, limit: 1) {
        items {
          ${POST_GRAPHQL_FIELDS}
        }
      }
    }`,
		preview,
		"posts",
	);
	const entries = await fetchGraphQL(
		`query {
      postCollection(where: { slug_not_in: "${slug}" }, order: date_DESC, preview: ${
				preview ? "true" : "false"
			}, limit: 2) {
        items {
          ${POST_GRAPHQL_FIELDS}
        }
      }
    }`,
		preview,
		"posts",
	);
	return {
		post: extractPost(entry),
		morePosts: extractPostEntries(entries),
	};
}

export async function getPostWithAdjacent(
	slug: string,
	preview: boolean,
): Promise<{ post: Post | null; newer: Post | null; older: Post | null }> {
	const list = await getAllPosts(preview);
	const index = list.findIndex((item) => item.slug === slug);
	const current = index >= 0 ? list[index] : null;
	const newer = index > 0 ? list[index - 1] : null;
	const older = index >= 0 && index < list.length - 1 ? list[index + 1] : null;

	return { post: current, newer, older };
}

function normalizeNewsPagination(options: NewsPaginationOptions = {}) {
	const limit = Math.max(1, Math.min(10, Math.floor(options.limit ?? 10)));
	const skip = Math.max(0, Math.floor(options.skip ?? 0));
	return { limit, skip };
}

export async function getPaginatedNews(
	isDraftMode: boolean,
	options: NewsPaginationOptions = {},
): Promise<{ items: Notice[]; total: number; limit: number; skip: number }> {
	const { limit, skip } = normalizeNewsPagination(options);

	const entries = await fetchGraphQL(
		`query {
      noticeCollection(
        where: { slug_exists: true }
        order: date_DESC
        limit: ${limit}
        skip: ${skip}
        preview: ${isDraftMode ? "true" : "false"}
      ) {
        total
        skip
        limit
        items {
          ${NOTICE_LIST_FIELDS}
        }
      }
    }`,
		isDraftMode,
		"notices",
	);

	if (entries.errors) {
		console.error("[getAllNews] GraphQL Errors:", entries.errors);
	}

	const {
		items,
		total,
		limit: responseLimit,
		skip: responseSkip,
	} = extractNoticeCollection(entries);

	return {
		items,
		total,
		limit: responseLimit || limit,
		skip: responseSkip || skip,
	};
}

export async function getAllNews(
	isDraftMode: boolean,
	options: NewsPaginationOptions = {},
): Promise<Notice[]> {
	const { items } = await getPaginatedNews(isDraftMode, options);
	return items;
}

export async function getAllNewsEntries(
	isDraftMode: boolean,
): Promise<Notice[]> {
	const firstPage = await getPaginatedNews(isDraftMode, { limit: 10, skip: 0 });
	const allItems = [...firstPage.items];
	const total = firstPage.total ?? firstPage.items.length;
	const limit = firstPage.limit || 10;

	if (total <= limit) {
		return allItems;
	}

	for (let offset = limit; offset < total; offset += limit) {
		const page = await getPaginatedNews(isDraftMode, { limit, skip: offset });
		allItems.push(...page.items);
	}

	return allItems;
}

export async function getNewsWithAdjacent(
	slug: string,
	preview: boolean,
): Promise<{
	notice: Notice | null;
	newer: Notice | null;
	older: Notice | null;
}> {
	const currentResponse = await fetchGraphQL(
		`query {
      noticeCollection(where: { slug: "${slug}" }, preview: ${
				preview ? "true" : "false"
			}, limit: 1) {
        items {
          ${NOTICE_GRAPHQL_FIELDS}
        }
      }
    }`,
		preview,
		"notices",
	);

	const notice = extractNotice(currentResponse);

	if (!notice?.date) {
		return { notice: null, newer: null, older: null };
	}

	const normalizedDate = new Date(notice.date).toISOString();
	const adjacentResponse = await fetchGraphQL(
		`query {
      newer: noticeCollection(
        where: { date_gt: "${normalizedDate}" }
        order: date_ASC
        limit: 1
        preview: ${preview ? "true" : "false"}
      ) {
        items {
          ${NOTICE_LIST_FIELDS}
        }
      }
      older: noticeCollection(
        where: { date_lt: "${normalizedDate}" }
        order: date_DESC
        limit: 1
        preview: ${preview ? "true" : "false"}
      ) {
        items {
          ${NOTICE_LIST_FIELDS}
        }
      }
    }`,
		preview,
		"notices",
	);

	const newer = adjacentResponse?.data?.newer?.items?.[0] ?? null;
	const older = adjacentResponse?.data?.older?.items?.[0] ?? null;

	return { notice, newer, older };
}
