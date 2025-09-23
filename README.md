This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Cron (Daily RSS Sync)

An endpoint `GET /api/cron/daily` is available for Vercel Cron to trigger daily RSS → Article sync.

Configure in Vercel:

1. Project Settings → Cron Jobs → Add Cron Job
2. Schedule: `0 0 * * *` (daily 00:00 UTC)
3. Endpoint: `/api/cron/daily`
4. Method: `GET`

Local test: `http://localhost:3000/api/cron/daily`

## Environment Variables

Create `.env.local` (see `.env.example`):

```
# Kimi API Key (mock by default in development)
KIMI_API_KEY=mock-api-key
```

## Bookmarks
## Production Deploy

1. Set environment variables in Vercel:
   - `NEXT_PUBLIC_SITE_URL` = your domain (e.g. https://example.com)
   - `KIMI_API_KEY` (optional; dev uses mock)
2. Configure Vercel Cron to hit `/api/cron/daily` daily.
3. Build & Deploy. Pages use ISR (`revalidate=86400`) for home, list, and article pages.
4. Submit `sitemap.xml` to search engines after first deploy.


Article detail page includes a bookmark toggle (localStorage key: `bookmarks`).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

### Run tests

```bash
npm test
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
