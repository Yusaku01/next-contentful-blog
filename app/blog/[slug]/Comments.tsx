"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useState } from "react";

type Comment = {
  id: string;
  body: string;
  author: string;
  createdAt: string;
  parentId: string | null;
};

async function fetchComments(slug: string) {
  const res = await fetch(`/api/comments?slug=${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Failed to load comments");
  }
  return (await res.json()) as { items: Comment[] };
}

async function postComment(input: {
  slug: string;
  body: string;
  author?: string;
}) {
  const res = await fetch("/api/comments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    const message = error?.error || "Failed to post comment";
    throw new Error(message);
  }
  return (await res.json()) as Comment;
}

export function Comments({ slug }: { slug: string }) {
  const queryClient = useQueryClient();
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["comments", slug],
    queryFn: () => fetchComments(slug),
  });

  const mutation = useMutation({
    mutationFn: postComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", slug] });
      setBody("");
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!body.trim()) return;
    mutation.mutate({ slug, body, author });
  };

  return (
    <section className="mt-12 space-y-6">
      <div>
        <h2 className="text-xl font-semibold">コメント</h2>
        <p className="text-sm text-gray-600">
          コメントを投稿すると即座に公開されます。個人情報の記載にはご注意ください。
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-3 rounded-lg border border-gray-200 p-4"
      >
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="お名前（任意）"
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="コメントを入力してください"
          required
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          rows={4}
        />
        <button
          type="submit"
          disabled={mutation.isLoading}
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {mutation.isLoading ? "送信中..." : "コメントを投稿"}
        </button>
        {mutation.isError && (
          <p className="text-sm text-red-600">
            {(mutation.error as Error).message}
          </p>
        )}
        {mutation.isSuccess && (
          <p className="text-sm text-green-600">投稿しました。</p>
        )}
      </form>

      <div className="space-y-3">
        {isLoading && <p className="text-sm text-gray-600">読み込み中...</p>}
        {isError && (
          <p className="text-sm text-red-600">コメントを読み込めませんでした。</p>
        )}
        {data?.items.length === 0 && (
          <p className="text-sm text-gray-600">まだコメントはありません。</p>
        )}
        {data?.items.map((item) => (
          <article
            key={item.id}
            className="rounded-lg border border-gray-200 bg-white p-4"
          >
            <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
              <span>{item.author || "Anonymous"}</span>
              <time dateTime={item.createdAt}>
                {new Date(item.createdAt).toLocaleString("ja-JP")}
              </time>
            </div>
            <p className="whitespace-pre-wrap text-sm text-gray-900">
              {item.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
