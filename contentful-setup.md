# Contentful セットアップメモ

## 0. 必要情報
- Space ID（例: `20dokcvnxg6z`）
- Delivery token (`CONTENTFUL_ACCESS_TOKEN`)
- Preview token (`CONTENTFUL_PREVIEW_ACCESS_TOKEN`)
- Revalidate secret (`CONTENTFUL_REVALIDATE_SECRET`: 自由に決める)
- Preview secret (`CONTENTFUL_PREVIEW_SECRET`: Draft Mode 用)
- CMA Personal Access Token (`CONTENTFUL_MANAGEMENT_TOKEN`) ※モデルやWebhook作成時のみ使用

## 1. 環境変数
ローカル: `.env.local` に以下を記入
```
CONTENTFUL_SPACE_ID=...
CONTENTFUL_ACCESS_TOKEN=...
CONTENTFUL_PREVIEW_ACCESS_TOKEN=...
CONTENTFUL_PREVIEW_SECRET=...
CONTENTFUL_REVALIDATE_SECRET=...
```
Vercel: `vercel env add <VAR> production` で同じ値を入力。Preview/Development 環境にも必要なら追加する。

## 2. Contentful CLI セットアップ
```bash
npm install -g contentful-cli
contentful login --mtoken CFPAT-xxxxx
contentful space use --space-id 20dokcvnxg6z
```

## 3. モデルとダミーデータの投入
1. モデルは `npm run setup`（= `node lib/setup.js`）で Author/Post を一括作成。**Notice（お知らせ）用モデルは現状 export に含まれていないため、Contentful 側で title/slug/date/content/coverImage を持つシンプルな content type を追加するか、export を拡張する必要があります。**
2. ダミー記事を CLI で入れたい場合は、画像を `contentful-assets/dummy/` に保存して `lib/dummy-content.json` をインポート:
```bash
contentful space import \
  --space-id 20dokcvnxg6z \
  --environment-id master \
  --content-file lib/dummy-content.json \
  --skip-content-model \
  --upload-assets \
  --assets-directory contentful-assets
```
JSON には `sys.publishedVersion: 1` を含めておくと import と同時に publish される。

## 4. ローカル確認
```bash
npm run dev
```
- `/` と `/blog` / `/blog/[slug]`、`/news` / `/news/[slug]` を確認
- Draft Mode: `/api/draft?secret=CONTENTFUL_PREVIEW_SECRET&slug=cli-post-one`
- 問題なければ `npm run build` も実行

## 5. Vercel デプロイ
```bash
vercel        # 初回デプロイ
vercel --prod # 本番デプロイ
```
環境変数は `vercel env add` で投入済みであることを確認。

## 6. Webhook 設定
Contentful 管理画面 → Settings → Webhooks で以下のように登録:
- Name: `Next.js Revalidate`
- URL: `https://<vercel-domain>/api/revalidate`
- Headers: `x-vercel-reval-key: CONTENTFUL_REVALIDATE_SECRET`
- Topics: `Entry.publish`, `Entry.unpublish`, `Asset.publish`, `Asset.unpublish`

CLI から作成する場合は Management API を直接叩く:
```bash
export CONTENTFUL_MANAGEMENT_TOKEN=CFPAT-xxxxx
curl -X POST https://api.contentful.com/spaces/20dokcvnxg6z/webhook_definitions \
  -H "Authorization: Bearer $CONTENTFUL_MANAGEMENT_TOKEN" \
  -H "Content-Type: application/vnd.contentful.management.v1+json" \
  -d '{
    "name": "Next.js Revalidate",
    "url": "https://<vercel-domain>/api/revalidate",
    "topics": ["Entry.publish","Entry.unpublish","Asset.publish","Asset.unpublish"],
    "headers": [{"key": "x-vercel-reval-key", "value": "CONTENTFUL_REVALIDATE_SECRET"}]
  }'
```

## 7. 動作確認チェックリスト
- [x] `.env.local` 作成 & Vercel に同じ env を登録
- [x] `npm run setup` でモデル生成
- [x] CLI import でダミー Author/Post/Asset を publish 済み
- [x] `npm run dev` / `npm run build`
- [x] Vercel へデプロイ (`vercel`, `vercel --prod`)
- [x] Webhook で `/api/revalidate` を登録し Publish 時に動くか確認

メモ: `contentful-data.md` に CLI 実行ログ、`lib/dummy-content.json` に seed データが残っているので追加データ投入時に再利用可能。
