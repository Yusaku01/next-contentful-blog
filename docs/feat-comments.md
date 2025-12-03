# コメント機能（最小構成）導入メモ

TanStack Query を最小限に入れて、コメントの取得・投稿だけ動かすための手順です。まずは「API 1 本＋Query 1 つ＋Mutation 1 つ」で進め、慣れたら拡張してください。

## 前提・インストール
- パッケージ: `npm install @tanstack/react-query`
- 追加で使うなら: `@tanstack/react-query-devtools`（任意）
- `.env.local` に Contentful の管理トークンが必要（コメント作成で CMA を使うため）。

## Contentful 側の準備
1. Content Model で `Comment` コンテンツタイプを作成  
   - `slug` (Short text, required) — 対象記事の slug  
   - `body` (Long text, required) — コメント本文  
   - `author` (Short text, optional) — 表示名  
   - `status` (Short text or Boolean, optional) — 例: `published`/`pending`（運用ポリシーに合わせて）  
2. API Keys  
   - 既存の Delivery/Preview token で読み取り可能。  
   - 書き込み用に **Content Management API Token** を発行。  
3. 必要な環境変数（`.env.local`）  
   - `CONTENTFUL_SPACE_ID`（既存）  
   - `CONTENTFUL_ACCESS_TOKEN`（既存・読み取り）  
   - `CONTENTFUL_PREVIEW_ACCESS_TOKEN`（既存・ドラフト時読み取り）  
   - `CONTENTFUL_MANAGEMENT_TOKEN`（新規・書き込み用）  
   - `CONTENTFUL_ENVIRONMENT` を分けたい場合は追加（未指定なら `master` を想定）。  

## 実装の最小ステップ
1) **API Route を 1 本作る**  
   - `app/api/comments/route.ts` を新規作成。  
   - GET: `?slug=...` でコメント一覧を Delivery API から取得。`{ cache: 'no-store' }` で返す。  
   - POST: `Contentful Management API` に対して `Comment` エントリを作成（`status` を `published` にするか、エディトリアルレビュー用に `draft` 保存するかは運用次第）。  
   - 認証: 最小構成では未サインインでも投稿可。あとで認証を入れる余地を残す。  
   - 再検証: `revalidateTag("comments")` を追加しておくと、後述のタグに合わせて再取得できる。  

2) **クライアント側の最小 UI**  
   - `app/providers.tsx`（新規）で `QueryClientProvider` を配置。  
   - `app/layout.tsx` で `<Providers>` でアプリ全体をラップ。  
   - `app/blog/[slug]/Comments.tsx`（新規, `"use client"`）  
     - `useQuery` で `/api/comments?slug=...` を叩く。  
     - `useMutation` で `/api/comments` に POST。`onSuccess` で `invalidateQueries(['comments', slug])`。  
     - 最初は楽観的更新なし。慣れたら `onMutate` を追加。  
   - `app/blog/[slug]/page.tsx` で本文の下に `<Comments slug={slug} />` を挿入。  

3) **サーバーのデータアクセス**  
   - `lib/api.ts` にコメント用の helper を追加しても良いが、最小構成では Route Handler 内に閉じてもよい。  
   - 読み取りは Delivery API の GraphQL/REST どちらでも可。書き込みは Management API（REST）。  
   - 全て `{ cache: 'no-store' }` で、静的キャッシュに載せない。  

4) **拡張する場合の順番（迷子防止）**  
   - Step 1 だけで「取得＋投稿＋再読込」まで動く。  
   - 次に、`onMutate` を足して楽観的更新。  
   - その次に、SSR 初期データを `dehydrate/Hydrate` で埋める。  
   - 認証（NextAuth など）は最後に。POST ハンドラでユーザー ID を見て保存するだけでよい。  

## ディレクトリ構成イメージ
以下は追加・修正箇所をコメントで記した例です。

```
docs/
  feat-comments.md              # このガイド
app/
  layout.tsx                    # 追加: <Providers> でラップ
  providers.tsx                 # 新規: QueryClientProvider を定義
  api/
    comments/
      route.ts                  # 新規: GET/POST コメント API（no-store）
  blog/
    [slug]/
      page.tsx                  # 追加: <Comments slug={slug} /> を挿入
      Comments.tsx              # 新規: "use client" TanStack Query UI
lib/
  api.ts                        # （任意）コメント fetch/post helper を追加してもよい
```

## 動作確認の流れ（最小）
1. `.env.local` に CMA トークンを入れる。  
2. `npm install @tanstack/react-query`。  
3. `npm run dev` でローカル起動。  
4. ブログ詳細ページにアクセスし、コメントを投稿 → リスト再取得で反映されるか確認。  
5. Contentful の Webhooks で `/api/revalidate` を叩いても良いが、コメント API 自体は `no-store` なので必須ではない。  
