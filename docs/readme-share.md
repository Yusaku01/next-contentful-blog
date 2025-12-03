# Next.js × Contentful ブログテンプレート 完全ガイド

## このテンプレートについて

このプロジェクトは、**Next.js**と**Contentful**を使ったブログサイトのサンプルです。

### 主な特徴

- **Next.js App Router** を使用した最新の構成
- **Contentful CMS** でブログ記事を管理
- **静的生成（SSG）** により高速なページ表示を実現
- **ドラフトモード** で公開前のプレビューが可能
- **自動更新機能** でCMSの変更を即座に反映

### 使用している技術

- **GraphQL**: Contentfulからデータをスムーズに取得
- **Draft Mode**: 記事を公開する前にプレビュー表示できる機能
- **On-Demand Revalidate**: CMSで記事を更新したら自動的にサイトに反映される仕組み
- **タグ付きキャッシュ**: 必要な部分だけを効率的に更新

---

## デモサイトを見る

実際の動作を確認できます:
👉 [https://app-router-contentful.vercel.app/](https://app-router-contentful.vercel.app/)

---

## すぐに始めたい方へ

下のボタンをクリックすると、自分専用のブログを簡単に作成できます。

**何が起こるの？**
1. このプロジェクトがあなたのGitHubにコピーされます
2. Vercelに自動的にデプロイされます
3. Contentful Integrationを通じて、自動的にContentfulと接続されます

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fcms-contentful&project-name=nextjs-contentful-blog&repository-name=nextjs-contentful-blog&demo-title=Next.js+Blog&demo-description=Static+blog+with+multiple+authors+using+Draft+Mode&demo-url=https%3A%2F%2Fnext-blog-contentful.vercel.app%2F&demo-image=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fv1625705016%2Ffront%2Fexamples%2FCleanShot_2021-07-07_at_19.43.15_2x.png&integration-ids=oac_aZtAZpDfT1lX3zrnWy7KT9VA&env=CONTENTFUL_PREVIEW_SECRET&envDescription=Any%20URL%20friendly%20value%20to%20secure%20Draft%20Mode)

---

## 他のCMSサンプルも見る

Next.jsは様々なCMSと連携できます:

AgilityCMS / Builder.io / ButterCMS / Contentful / Cosmic / DatoCMS / DotCMS / Drupal / Enterspeed / Ghost / GraphCMS / Kontent.ai / MakeSwift / Payload / Plasmic / Prepr / Prismic / Sanity / Sitecore XM Cloud / Sitefinity / Storyblok / TakeShape / Tina / Umbraco / Umbraco heartcore / Webiny / WordPress / Blog Starter

---

## 📦 プロジェクトのセットアップ

### ローカル環境で始める

お使いのパッケージマネージャーで、このサンプルをダウンロードできます。

**npm を使う場合:**
```bash
npx create-next-app --example cms-contentful cms-contentful-app
```

**yarn を使う場合:**
```bash
yarn create next-app --example cms-contentful cms-contentful-app
```

**pnpm を使う場合:**
```bash
pnpm create next-app --example cms-contentful cms-contentful-app
```

> 💡 **ヒント**: どれを使えばいいか迷ったら、`npx`（npm付属）を使いましょう。

---

## ⚙️ 詳細設定ガイド

このブログを動かすには、ContentfulというCMSサービスの設定が必要です。
順番に進めていきましょう！

---

### Step 1. Contentfulアカウントを作成する

**Contentfulとは？**
ブログ記事や画像を管理するための、クラウド型のCMS（コンテンツ管理システム）です。

#### 手順

1. **アカウント登録**
   [Contentful](https://www.contentful.com/sign-up/) にアクセスして、無料アカウントを作成します。

2. **Spaceを作成**
   [ダッシュボード](https://app.contentful.com/) から「空のSpace」を新規作成します。

   > 📝 **Spaceとは？**: ブログの記事や画像を保存する場所です。プロジェクトごとに1つのSpaceを作ります。

   Space名は自由に付けられます（例: `My Blog`）。

---

### Step 2. コンテンツモデルを作成する

**コンテンツモデルとは？**
ブログに必要なデータの型（設計図）を定義するものです。
このプロジェクトでは「Author（著者）」と「Post（記事）」の2種類を作ります。

作成方法は2つあります:

- **方法A**: 自動スクリプトで作成（簡単・推奨）
- **方法B**: 手動で作成（細かく理解したい方向け）

---

#### 方法A: スクリプトで自動作成（推奨）

自動的にモデルを作成してくれるので、初心者にはこちらがおすすめです。

**① Space IDとManagement Tokenを取得**

1. Contentfulの **Settings > General Settings** を開く
2. **Space ID** をコピーしておく（例: `abc123xyz`）
3. **Settings > CMA tokens** を開く
4. **Create personal access token** をクリックして新しいトークンを作成
5. トークンをコピーしておく

   > ⚠️ **注意**: Management Tokenは強力な権限を持つので、他人に見せないでください。
   > セットアップが終わったら削除しても大丈夫です。

**② コマンドを実行**

プロジェクトのフォルダで、以下のコマンドを実行します:

```bash
npx cross-env CONTENTFUL_SPACE_ID=あなたのSpace_ID CONTENTFUL_MANAGEMENT_TOKEN=あなたのToken npm run setup
```

**③ 成功すると以下のように表示されます:**

```
> cms-contentful@1.0.0 setup
> node ./contentful/setup.js

┌──────────────────────────────────────────────────┐
│ The following entities are going to be imported: │
├─────────────────────────────────┬────────────────┤
│ Content Types                   │ 2              │  ← Authorとpostが作成される
│ Editor Interfaces               │ 2              │
└──────────────────────────────────────────────────┘
```

これで「Author」と「Post」のモデルが自動的に作成されました！

→ **Step 3に進んでください**

---

#### 方法B: 手動で作成

各フィールドを自分で設定したい場合は、こちらの方法で進めます。

**① Authorモデルを作成**

1. Contentfulの **Content model** メニューを開く
2. **Add content type** ボタンをクリック
3. 以下のように設定:
   - **Name**: `Author`（著者）
   - **API Identifier**: `author`
4. **Add field** で以下の2つのフィールドを追加:

   | フィールド名 | タイプ | Field ID | 説明 |
   |------------|--------|----------|------|
   | `name` | Text（Short text） | `name` | 著者の名前 |
   | `picture` | Media（One file） | `picture` | 著者のプロフィール画像 |

5. **Save** をクリック

**② Postモデルを作成**

1. 再び **Add content type** をクリック
2. 以下のように設定:
   - **Name**: `Post`（記事）
   - **API Identifier**: `post`
3. **Add field** で以下の7つのフィールドを追加:

   | フィールド名 | タイプ | 説明 |
   |------------|--------|------|
   | `title` | Text（Short text） | 記事のタイトル |
   | `content` | Rich text | 記事の本文 |
   | `excerpt` | Text（Long text） | 記事の要約文 |
   | `coverImage` | Media（One file） | 記事のカバー画像 |
   | `date` | Date and time | 公開日時 |
   | `slug` | Text（Short text） | URLに使う文字列（例: `my-first-post`） |
   | `author` | Reference（One reference） | 著者への参照（上で作ったAuthorを選択） |

   > 💡 **slugフィールドのヒント**:
   > - Field の **Appearance** タブで「Slug」表示を選択できます
   > - `title` フィールドから自動生成する設定も可能です

4. **Save** をクリック

---

### Step 3. モデルが正しく作成されたか確認

Content modelメニューを開いて、以下のような構成になっていればOKです:

![Content model overview](https://github.com/vercel/next.js/assets/9113740/d3f76907-7046-4d94-b285-eb89b87aa223)

✅ **確認ポイント**:
- `Author` モデル: nameとpictureの2つのフィールド
- `Post` モデル: title、content、excerpt、coverImage、date、slug、authorの7つのフィールド

---

### Step 4. テスト用の記事を作成する

モデルができたので、実際にブログ記事を作ってみましょう！

#### ① 著者を作成

1. **Content** メニューを開く
2. **Add entry** → **Author** を選択
3. 以下を入力:
   - **name**: あなたの名前（例: `山田太郎`）
   - **picture**: プロフィール画像をアップロード
     > 💡 画像がない場合は [Unsplash](https://unsplash.com/) から無料でダウンロードできます

4. **Publish** ボタンをクリック

   > ⚠️ **重要**: 必ず**Publish（公開）**してください！
   > 公開しないとドラフト状態のままで、サイトに表示されません。

#### ② 記事を作成（最低2件）

1. **Add entry** → **Post** を選択
2. 各フィールドを入力:
   - **title**: `はじめての記事`
   - **slug**: `my-first-post`（URLになる部分）
   - **excerpt**: `これはテスト記事です`（要約文）
   - **content**: 本文を自由に書く
   - **coverImage**: カバー画像をアップロード
   - **date**: 今日の日付
   - **author**: 先ほど作った著者を選択

3. **Publish** をクリック

4. もう1件、同様の手順で記事を作成

これで準備完了です！

![Published content entry](https://github.com/vercel/next.js/assets/9113740/e1b4a3fe-45f4-4851-91db-8908d3ca18e9)

---

### Step 5. 環境変数を設定する

**環境変数とは？**
Next.jsアプリがContentfulと通信するための「鍵」のようなものです。
この鍵をプロジェクトに設定します。

#### ① APIキーを取得

1. Contentfulの **Settings > API keys** を開く
2. **Example Key** または **Add API key** をクリック
3. 以下の情報をメモしておく:
   - **Space ID**
   - **Content Delivery API - access token**（本番用）
   - **Content Preview API - access token**（プレビュー用）

   > 📝 **2種類のトークンの違い**:
   > - **Delivery API**: 公開済みの記事を取得
   > - **Preview API**: 下書き状態の記事もプレビュー表示できる

#### ② 環境変数ファイルを作成

1. プロジェクトのルートフォルダで以下のコマンドを実行:

   ```bash
   cp .env.local.example .env.local
   ```

   これで `.env.local` ファイルが作成されます。

2. `.env.local` を開いて、以下のように設定:

   ```bash
   # Contentful Space ID
   CONTENTFUL_SPACE_ID=あなたのSpace_ID

   # 本番用トークン（公開済み記事を取得）
   CONTENTFUL_ACCESS_TOKEN=あなたのDelivery_API_Token

   # プレビュー用トークン（下書きも表示）
   CONTENTFUL_PREVIEW_ACCESS_TOKEN=あなたのPreview_API_Token

   # Draft Mode用のパスワード（任意の文字列でOK）
   CONTENTFUL_PREVIEW_SECRET=my-secret-password

   # 自動更新用のパスワード（任意の文字列でOK）
   CONTENTFUL_REVALIDATE_SECRET=my-revalidate-secret
   ```

   > 💡 **Secretについて**:
   > `CONTENTFUL_PREVIEW_SECRET` と `CONTENTFUL_REVALIDATE_SECRET` は自分で好きな文字列を設定できます。
   > 例: `my-preview-123` や `update-webhook-456` など

3. ファイルを保存

   > ⚠️ **重要**: `.env.local` はGitにコミットしないでください！
   > このファイルには重要な認証情報が含まれています。

---

### Step 6. ローカル環境で動かしてみる

いよいよブログを起動します！

#### ① パッケージをインストール

プロジェクトフォルダで以下のコマンドを実行:

```bash
npm install
```

または

```bash
yarn install
```

これで必要なライブラリがすべてインストールされます。

#### ② 開発サーバーを起動

```bash
npm run dev
```

または

```bash
yarn dev
```

#### ③ ブラウザで確認

ブラウザで以下のURLを開く:
👉 **http://localhost:3000**

Contentfulで作成した記事が表示されれば成功です！

> ❓ **うまく表示されない場合**:
> - `.env.local` の値が正しいか確認
> - Contentfulで記事を**Publish**しているか確認
> - エラーメッセージが出ている場合は [GitHub Discussions](https://github.com/vercel/next.js/discussions) で質問できます

---

### Step 7. Draft Mode（下書きプレビュー）を試す

**Draft Modeとは？**
記事を公開する前に、どう表示されるかプレビューできる機能です。

#### ① Contentfulでプレビュー設定

1. Contentfulの **Settings > Content preview** を開く
2. **Add content preview** をクリック
3. 以下のように設定:
   - **Name**: `Development Preview`（任意の名前）
   - **Content type**: `Post` を選択
   - **URL**: 以下をコピー&ペースト

   ```
   http://localhost:3000/api/draft?secret=あなたのPREVIEW_SECRET&slug={entry.fields.slug}
   ```

   > ⚠️ `あなたのPREVIEW_SECRET` の部分は、`.env.local` で設定した `CONTENTFUL_PREVIEW_SECRET` の値に置き換えてください

4. **Save** をクリック

![Content preview setup](https://github.com/vercel/next.js/assets/9113740/f1383d68-ea2b-4adf-974f-235b8c098745)

#### ② 下書きをプレビュー

1. Contentfulの **Content** から既存のPostを開く
2. タイトルに `[Draft]` という文字を追加
3. **保存するが、Publishはしない**（状態が「CHANGED」になる）
4. 右サイドバーの **Open preview** ボタンをクリック

![Content entry overview](https://github.com/vercel/next.js/assets/9113740/cc0dff9a-c57e-4ec4-85f1-22ab74af2b6b)

すると、公開していない下書き状態の記事がブラウザで確認できます！

#### ③ Draft Modeを解除

プレビューモードを終了するには:
👉 **http://localhost:3000/api/disable-draft** にアクセス

これで通常モードに戻ります。

---

### Step 8. 本番環境にデプロイする

ローカルで動いたら、インターネット上に公開しましょう！
Vercelという無料のホスティングサービスを使います。

#### 方法A: GitHubから自動デプロイ（推奨）

**① GitHubにコードをプッシュ**

```bash
git add .
git commit -m "Initial commit"
git push
```

**② Vercelにインポート**

1. [Vercel](https://vercel.com/new) にアクセス
2. GitHubリポジトリを選択して **Import**
3. **Environment Variables** を設定:
   - `.env.local` と同じ内容をすべてコピー
   - 各変数を1つずつ追加していく

   > 📝 **追加する環境変数**:
   > - `CONTENTFUL_SPACE_ID`
   > - `CONTENTFUL_ACCESS_TOKEN`
   > - `CONTENTFUL_PREVIEW_ACCESS_TOKEN`
   > - `CONTENTFUL_PREVIEW_SECRET`
   > - `CONTENTFUL_REVALIDATE_SECRET`

4. **Deploy** をクリック

数分でデプロイが完了し、URLが発行されます！

#### 方法B: ワンクリックデプロイ

下のボタンを使うと、さらに簡単にデプロイできます:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fcms-contentful&project-name=nextjs-contentful-blog&repository-name=nextjs-contentful-blog&demo-title=Next.js+Blog&demo-description=Static+blog+with+multiple+authors+using+Draft+Mode&demo-url=https%3A%2F%2Fnext-blog-contentful.vercel.app%2F&demo-image=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fv1625705016%2Ffront%2Fexamples%2FCleanShot_2021-07-07_at_19.43.15_2x.png&integration-ids=oac_aZtAZpDfT1lX3zrnWy7KT9VA&env=CONTENTFUL_PREVIEW_SECRET,CONTENTFUL_REVALIDATE_SECRET&envDescription=Any%20URL%20friendly%20value%20to%20secure%20Your%20App)

> 💡 このボタンを使うと、Vercel Contentful Integrationが自動的にContentfulと接続してくれます。
> ただし、`CONTENTFUL_PREVIEW_SECRET` と `CONTENTFUL_REVALIDATE_SECRET` は手動で追加する必要があります。

---

### Step 9. 自動更新機能を設定する（On-Demand Revalidation）

**On-Demand Revalidationとは？**
Contentfulで記事を編集したら、自動的にサイトに反映される仕組みです。
Webhookという機能を使って、ContentfulからVercelに「更新したよ！」と通知します。

#### ① Webhookを作成

1. Contentfulの **Settings > Webhooks** を開く
2. **Add Webhook** をクリック
3. 以下のように設定:

   **基本設定:**
   - **Name**: `Vercel Deploy Hook`（任意の名前）
   - **URL**:
     ```
     https://あなたのVercelのURL/api/revalidate
     ```
     > 💡 VercelのURLは、デプロイ後のダッシュボードで確認できます
     > （例: `https://my-blog-abc123.vercel.app/api/revalidate`）

   ![Content webhook url](https://github.com/vercel/next.js/assets/9113740/c8df492a-57d6-42a1-8a3c-b0de3d6ad42f)

   **Triggers（いつ通知するか）:**
   - `Publish` と `Unpublish` にチェック
   - または「すべてのイベント」を選択

   **Headers（セキュリティ設定）:**
   - **Key**: `x-vercel-reval-key`
   - **Value**: `.env.local` の `CONTENTFUL_REVALIDATE_SECRET` と同じ値

   ![Content secret header](https://github.com/vercel/next.js/assets/9113740/574935e6-0d31-4e4f-b914-8b01bdf03d5e)

   **Content type:**
   - `application/json` を選択

   ![Content publish changes](https://github.com/vercel/next.js/assets/9113740/78bd856c-ece1-4bf3-a330-1d544abd858d)

4. **Save** をクリック

#### ② 動作確認

1. Contentfulで既存の記事のタイトルを変更
2. **Publish** をクリック
3. 数秒待ってから、Vercelのサイトを再読み込み

変更が反映されていれば成功です！

![Content publish changes](https://github.com/vercel/next.js/assets/9113740/ad96bfa7-89c1-4e46-9d9c-9067176c9769)

#### ③ トラブルシューティング

**うまく反映されない場合:**

1. **Webhookのログを確認**
   - Contentfulの Webhooks設定で、リクエストログを確認
   - ステータスコード `200` が返っていればOK

   ![Content successful request](https://github.com/vercel/next.js/assets/9113740/ed1ffbe9-4dbf-4ec6-9c1f-39c8949c4d38)

2. **環境変数を確認**
   - Vercelの環境変数 `CONTENTFUL_REVALIDATE_SECRET` が正しいか確認
   - Webhookの `x-vercel-reval-key` と一致しているか確認

3. **Vercelの関数ログを確認**
   - Vercelダッシュボードの **Functions** タブでエラーを確認

---

🎉 **おめでとうございます！**
これで、Contentful×Next.jsのブログが完成しました！

---

## 📚 技術詳細（もっと知りたい方へ）

ここからは、このプロジェクトの仕組みをもっと深く理解したい方向けの情報です。

---

### Q1. ContentfulとNext.jsはどうやって通信しているの？

**A: GraphQL APIで通信しています**

このプロジェクトでは、ContentfulのGraphQL APIを使ってデータを取得しています。

**仕組み:**
- `lib/api.ts` で GraphQL クエリを定義
- `fetch` を使って Contentful の GraphQL エンドポイントにリクエスト
- 2種類のトークンを使い分け:
  - **Delivery API**: 公開済み記事を取得（通常表示用）
  - **Preview API**: 下書きも含めて取得（Draft Mode用）

**セキュリティ:**
- APIキーは `.env.local` に保存（Gitには含めない）
- Vercelにデプロイ時も同じ環境変数を設定
- これにより、トークンの漏洩リスクを最小限に

---

### Q2. Draft ModeとOn-Demand Revalidationの仕組みは？

**Draft Mode:**
- `app/api/draft/route.ts` が Contentful からのリクエストを受け取る
- `secret` と `slug` を検証して、正しければ Next.js の draft mode を有効化
- 有効化されると、Preview API からデータを取得するようになる
- 解除は `app/api/disable-draft/route.ts` で `draftMode().disable()` を呼ぶだけ

**On-Demand Revalidation:**
- Contentful Webhook が `app/api/revalidate/route.ts` にPOSTリクエスト
- `x-vercel-reval-key` ヘッダで `CONTENTFUL_REVALIDATE_SECRET` を検証
- 検証成功したら `revalidateTag("posts")` を実行
- 関連するページのキャッシュが再生成される

---

### Q3. データ取得のコード（`lib/api.ts`）について

**主要な関数:**

1. **`fetchGraphQL(query, preview)`**
   - ContentfulのGraphQLエンドポイントにPOSTリクエスト
   - `preview` が true なら Preview API、false なら Delivery API を使用
   - キャッシュタグ `["posts"]` を設定（Revalidation用）

2. **`getAllPosts(isDraftMode)`**
   - すべての記事を日付順（新しい順）で取得
   - トップページ（`app/page.tsx`）で使用
   - ヒーロー記事 + その他の記事一覧を表示

3. **`getPostAndMorePosts(slug, preview)`**
   - 指定したslugの記事と、関連記事2件を取得
   - 記事詳細ページ（`app/posts/[slug]/page.tsx`）で使用

4. **`getPreviewPostBySlug(slug)`**
   - Draft Mode用に下書き記事を取得
   - `app/api/draft/route.ts` から呼び出される

**GraphQLクエリの構造:**
- `POST_GRAPHQL_FIELDS` で共通のフィールド定義
- slug, title, coverImage, date, author, excerpt, content などを取得
- author は Reference型なので、name と picture も同時取得

---

### Q4. 記事の更新はどういう流れで反映される？

**パターン1: 下書きをプレビュー**
1. Contentfulで記事を編集（Publishしない）
2. Contentfulの「Open preview」をクリック
3. `/api/draft?secret=...&slug=...` にアクセス
4. `draftMode().enable()` が実行される
5. そのユーザーだけ Preview API でデータを取得
6. 下書き状態の記事が表示される

**パターン2: 記事を公開・更新**
1. Contentfulで記事を編集
2. **Publish** をクリック
3. Webhook が `/api/revalidate` を呼び出す
4. Secret を検証して `revalidateTag("posts")` を実行
5. トップページと該当記事のキャッシュが再生成
6. 数秒後にサイトに反映される

---

### Q5. URLはどうやって生成されるの？

**静的生成（SSG）の仕組み:**
- `app/posts/[slug]/page.tsx` に `generateStaticParams` を実装
- ビルド時にContentfulから全記事のslugを取得
- `/posts/<slug>` というルートを自動生成
- slugを変更すれば、URLも自動的に変わる

**例:**
- slug: `my-first-post` → URL: `/posts/my-first-post`
- slug: `hello-world` → URL: `/posts/hello-world`

---

### Q6. SEO（メタタグ）はどう設定する？

**現状:**
- `app/layout.tsx` で全ページ共通の title/description を設定

**記事ごとにメタタグを設定するには:**

`app/posts/[slug]/page.tsx` に以下を追加:

```typescript
export async function generateMetadata({ params }) {
  const { post } = await getPostAndMorePosts(params.slug, false);

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage.url],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage.url],
    },
  };
}
```

これでTwitterやFacebookでシェアした時に、記事ごとの画像とテキストが表示されます！

---

### Q7. レンダリングの仕組みは？

**Next.js App Routerの構成:**

- **すべてServer Component**: クライアントではなく、サーバー側でHTMLを生成
- **Static Generation（SSG）**: ビルド時にページを事前生成
- **Draft Mode時のみSSR**: プレビュー時だけサーバー側で動的レンダリング

**各ページの役割:**

| ファイル | 説明 |
|---------|------|
| `app/page.tsx` | トップページ。ヒーロー記事＋記事一覧を表示 |
| `app/posts/[slug]/page.tsx` | 記事詳細ページ。`generateStaticParams` で静的生成 |
| `lib/markdown.tsx` | Rich Textを React コンポーネントに変換 |
| `lib/contentful-image.tsx` | Contentfulの画像を最適化して表示 |

**使用している技術:**
- **Tailwind CSS**: スタイリング
- **date-fns**: 日付のフォーマット
- **@contentful/rich-text-react-renderer**: リッチテキストのレンダリング
- **Next.js Image**: 画像の最適化（Contentful用のカスタムローダー）

---

### 新しい記事タイプ (まったく異なるレイアウト) を追加するには
1. **Contentful で新しい Content Type** を作成 (例: `CaseStudy`)。必要なフィールド (例: `heroHeadline`, `modules`, `seoDescription` 等) を定義し、`slug` も用意。
2. **GraphQL クエリを拡張**:
   - `lib/api.ts` に新しいフィールドセット (例: `CASE_STUDY_GRAPHQL_FIELDS`) と `getAllCaseStudies`/`getCaseStudyAndMore` のような関数を追加。
   - `fetchGraphQL` の `next.tags` をタイプ別タグ (例: `"case-studies"`) に分けておくと Revalidate を制御しやすくなります。
3. **ルーティング**:
   - `app/case-studies/[slug]/page.tsx` のような新ディレクトリを作り、`generateStaticParams` と `generateMetadata` (任意) を実装。
   - 既存の `app/page.tsx` とは別に `app/case-studies/page.tsx` を置くか、トップページで複数のコンテンツタイプを並列表示するように `getAllPosts` の結果と合算します。
4. **UI コンポーネント**:
   - `components` or `app` 配下にケーススタディ専用のセクションを追加し、Contentful のフィールド構造に合わせて描画。
   - `lib/markdown.tsx` のように Rich Text / Modular Content を描画する補助関数を必要に応じ追加します。
5. **プレビュー/再検証対応**:
   - Draft Mode で新タイプをプレビューする場合、Contentful の Content Preview URL を `/case-studies/api/draft?...` など新ルートに合わせて設定。
   - Webhook から `revalidateTag("case-studies")` も呼べるよう、`app/api/revalidate/route.ts` を拡張して Contentful から渡される `sys.contentType.sys.id` に応じタグを振り分ける実装にすると拡張性が高いです。

### 補足: 主なファイルと役割
- `app/page.tsx` – トップページ。`draftMode` に応じて Delivery/Preview API を切り替え、Hero + More Stories を表示。
- `app/posts/[slug]/page.tsx` – 記事詳細。`generateStaticParams` で SSG を担い、`Markdown` コンポーネントで RichText を描画。
- `app/api/draft|disable-draft|revalidate/route.ts` – Draft Mode 切り替えと Resvalidation API。
- `lib/api.ts` – GraphQL クエリ集。`next: { tags: ["posts"] }` でキャッシュタグを設定。
- `lib/markdown.tsx` – Contentful Rich Text → React への変換。Embedded Asset を `next/image` で描画。
- `lib/contentful-image.tsx` – 画像 Loader。
- `lib/setup.js` – Contentful への Content Model インポートスクリプト。
- `tailwind.config.ts` – `@tailwindcss/typography` プラグインと Inter フォント変数設定。

---

## 今後の発展アイデア
1. 記事ごとの `generateMetadata` (Open Graph/Twitter) を実装し、SNS シェア最適化を行う。
2. Contentful の Webhook から送られるイベント種別ごとに `revalidateTag` を細分化し、必要なページのみ再生成することでコスト削減を図る。
3. 異なる記事タイプを増やす際は `Contentful GraphQL` の自動生成 (codegen) や `zod` バリデーションを導入し、型の安全性を高める。
