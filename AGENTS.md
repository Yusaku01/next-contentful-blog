# Repository Guidelines

## Next.js DevTools Workflow
- Run `/init` at the start of every Next.js session to hydrate the Next.js DevTools MCP context. It resets any cached assumptions and provides the latest `llms.txt` index so future doc lookups stay authoritative.
- After `/init`, fetch official guidance through `nextjs_docs` (prefer `action: "get"` with paths from the provided index) for every Next.js concept instead of answering from memory.
- When investigating or modifying the running app, consult the Next.js runtime tools (`nextjs_runtime` to list/call diagnostics, `browser_eval` for in-browser validation) before changing code so fixes align with the current state.

## Project Structure & Module Organization
This is a Next.js App Router project. UI routes live in `app/`, with `app/page.tsx` for the listing view and `app/posts/[slug]/page.tsx` for details. Server actions, Draft Mode toggles, and ISR hooks sit under `app/api/{draft,disable-draft,revalidate}`. Shared UI and data helpers (`lib/api.ts`, `lib/markdown.tsx`, `lib/contentful-image.tsx`) contain Contentful queries, Markdown rendering, and image helpers, while `lib/setup.js` seeds a Contentful space. Styling is split between Tailwind (`tailwind.config.ts`) and `app/globals.css`.

## Build, Test, and Development Commands
- `npm run dev` – Start the Next.js dev server with server actions, draft-mode APIs, and Tailwind in watch mode.
- `npm run build` – Create the production bundle; run this before opening a PR to catch Contentful query or type issues.
- `npm run start` – Serve the production build locally; mirrors the Vercel runtime.
- `npm run setup` – Executes `lib/setup.js` to import the expected Contentful content model; requires `CONTENTFUL_SPACE_ID` and `CONTENTFUL_MANAGEMENT_TOKEN` (often run via `npx cross-env ... npm run setup`).

## Coding Style & Naming Conventions
Use TypeScript everywhere; keep server components the default and add `"use client"` only when necessary. Components and files should be PascalCase (e.g., `CoverImage.tsx`) while route segments stay lowercase (`app/posts/[slug]`). Follow the existing 2-space indentation, semicolons, and single-responsibility React components with Tailwind utility classes. Fetch data through the helpers in `lib/api.ts` so cache tags (`"posts"`) stay consistent.

## Testing Guidelines
Automated tests are not bundled yet, so run through both the index and individual post pages locally and in draft mode before pushing. When adding tests, prefer colocated `*.test.tsx` or Playwright specs that mock Contentful responses and can be triggered with a future `npm test` script. End with `npm run build` to ensure type safety and cache tags compile.

## Commit & Pull Request Guidelines
Git history follows Conventional Commits (`docs: add AGENTS guide`). Keep subjects imperative and under 72 characters, and describe the motivation in the body when needed. PRs should explain the change, list any Contentful schema/data updates, and include screenshots or recordings for UI tweaks. Link related issues or Contentful entry IDs when applicable.

## Contentful & Draft Mode Tips
Add `CONTENTFUL_SPACE_ID`, `CONTENTFUL_ACCESS_TOKEN`, `CONTENTFUL_PREVIEW_ACCESS_TOKEN`, and `CONTENTFUL_REVALIDATE_SECRET` to `.env.local`. Use `/api/draft?secret=...` to enable preview mode and `/api/disable-draft` to exit. Content invalidation happens through `app/api/revalidate` via a POST with `x-vercel-reval-key`; ping it after publishing in Contentful. Any new data fetch should tag responses with `"posts"` (or another sensible namespace) so revalidation remains targeted.
