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

async function fetchGraphQL(
  query: string,
  preview = false,
  tag = "posts"
): Promise<any> {
  const isDev = process.env.NODE_ENV === "development";

  const fetchOptions = isDev
    ? { cache: "no-store" as const }
    : { next: { tags: [tag] } };

  return fetch(
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
    }
  ).then((response) => response.json());
}

function extractPost(fetchResponse: any): any {
  return fetchResponse?.data?.postCollection?.items?.[0];
}

function extractPostEntries(fetchResponse: any): any[] {
  return fetchResponse?.data?.postCollection?.items ?? [];
}

function extractNotice(fetchResponse: any): any {
  return fetchResponse?.data?.noticeCollection?.items?.[0];
}

function extractNoticeEntries(fetchResponse: any): any[] {
  return fetchResponse?.data?.noticeCollection?.items ?? [];
}

export async function getPreviewPostBySlug(slug: string | null): Promise<any> {
  const entry = await fetchGraphQL(
    `query {
      postCollection(where: { slug: "${slug}" }, preview: true, limit: 1) {
        items {
          ${POST_GRAPHQL_FIELDS}
        }
      }
    }`,
    true,
    "posts"
  );
  return extractPost(entry);
}

export async function getAllPosts(isDraftMode: boolean): Promise<any[]> {
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
    "posts"
  );
  return extractPostEntries(entries);
}

export async function getPostAndMorePosts(
  slug: string,
  preview: boolean
): Promise<any> {
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
    "posts"
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
    "posts"
  );
  return {
    post: extractPost(entry),
    morePosts: extractPostEntries(entries),
  };
}

export async function getPostWithAdjacent(
  slug: string,
  preview: boolean
): Promise<any> {
  const list = await getAllPosts(preview);
  const index = list.findIndex((item) => item.slug === slug);
  const current = index >= 0 ? list[index] : null;
  const newer = index > 0 ? list[index - 1] : null;
  const older = index >= 0 && index < list.length - 1 ? list[index + 1] : null;

  return { post: current, newer, older };
}

export async function getAllNews(isDraftMode: boolean): Promise<any[]> {
  const entries = await fetchGraphQL(
    `query {
      noticeCollection(where: { slug_exists: true }, order: date_DESC, preview: ${
        isDraftMode ? "true" : "false"
      }) {
        items {
          ${NOTICE_GRAPHQL_FIELDS}
        }
      }
    }`,
    isDraftMode,
    "notices"
  );
  return extractNoticeEntries(entries);
}

export async function getNewsWithAdjacent(
  slug: string,
  preview: boolean
): Promise<any> {
  const [currentResponse, list] = await Promise.all([
    fetchGraphQL(
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
      "notices"
    ),
    getAllNews(preview),
  ]);

  const current = extractNotice(currentResponse);
  const index = list.findIndex((item) => item.slug === slug);
  const newer = index > 0 ? list[index - 1] : null;
  const older = index >= 0 && index < list.length - 1 ? list[index + 1] : null;

  return { notice: current, newer, older };
}
