"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useEffect, useRef, useState } from "react";

type Comment = {
	id: string;
	body: string;
	author: string;
	createdAt: string;
	parentId: string | null;
};

function formatRelativeTime(dateString: string) {
	const target = new Date(dateString).getTime();
	if (Number.isNaN(target)) return dateString;
	const diffSec = Math.max(0, Math.floor((Date.now() - target) / 1000));
	if (diffSec < 60) return "たった今";
	const diffMin = Math.floor(diffSec / 60);
	if (diffMin < 60) return `${diffMin}分前`;
	const diffHour = Math.floor(diffMin / 60);
	if (diffHour < 24) return `${diffHour}時間前`;
	const diffDay = Math.floor(diffHour / 24);
	if (diffDay < 30) return `${diffDay}日前`;
	const date = new Date(target);
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
		date.getDate(),
	).padStart(2, "0")}`;
}

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
	const [highlightId, setHighlightId] = useState<string | null>(null);
	const highlightRef = useRef<HTMLElement | null>(null);
	const { data, isPending, isError } = useQuery({
		queryKey: ["comments", slug],
		queryFn: () => fetchComments(slug),
	});

	const mutation = useMutation({
		mutationFn: postComment,
		onMutate: async (input) => {
			await queryClient.cancelQueries({ queryKey: ["comments", slug] });
			const previous = queryClient.getQueryData<{ items: Comment[] }>([
				"comments",
				slug,
			]);
			const optimisticId = `tmp-${Date.now()}`;
			const optimistic: Comment = {
				id: optimisticId,
				body: input.body,
				author: input.author || "Anonymous",
				createdAt: new Date().toISOString(),
				parentId: null,
			};
			queryClient.setQueryData<{ items: Comment[] }>(
				["comments", slug],
				(prev) =>
					prev
						? { items: [...prev.items, optimistic] }
						: { items: [optimistic] },
			);
			setHighlightId(optimisticId);
			setBody("");
			return { previous };
		},
		onError: (_err, _input, context) => {
			if (context?.previous) {
				queryClient.setQueryData(["comments", slug], context.previous);
			}
		},
		onSuccess: (newComment) => {
			// Replace optimistic entry with server-confirmed comment.
			queryClient.setQueryData<{ items: Comment[] }>(
				["comments", slug],
				(prev) => {
					if (!prev) return { items: [newComment] };
					const filtered = prev.items.filter((c) => !c.id.startsWith("tmp-"));
					return { items: [...filtered, newComment] };
				},
			);
			setHighlightId(newComment.id);
		},
		// We skip immediate refetch to avoid CDA eventual-consistency gaps that
		// would temporarily drop the just-posted comment. A delayed/manual refetch
		// can be added later if needed.
	});

	useEffect(() => {
		if (highlightId && highlightRef.current) {
			highlightRef.current.scrollIntoView({
				behavior: "smooth",
				block: "center",
			});
			const timer = setTimeout(() => setHighlightId(null), 1200);
			return () => clearTimeout(timer);
		}
	}, [highlightId]);

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
					disabled={mutation.isPending}
					className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
				>
					{mutation.isPending ? "送信中..." : "コメントを投稿"}
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
				{isPending && <p className="text-sm text-gray-600">読み込み中...</p>}
				{isError && (
					<p className="text-sm text-red-600">
						コメントを読み込めませんでした。
					</p>
				)}
				{data?.items.length === 0 && (
					<p className="text-sm text-gray-600">まだコメントはありません。</p>
				)}
				{data?.items.map((item) => (
					<article
						key={item.id}
						ref={
							item.id === highlightId
								? (el) => {
										highlightRef.current = el;
									}
								: undefined
						}
						className={`rounded-lg border bg-white p-4 transition-colors ${
							item.id === highlightId
								? "border-blue-200 bg-blue-50"
								: "border-gray-200"
						}`}
					>
						<div className="mb-1 flex items-center justify-between text-xs text-gray-500">
							<span>{item.author || "Anonymous"}</span>
							<time dateTime={item.createdAt}>
								{formatRelativeTime(item.createdAt)}
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
