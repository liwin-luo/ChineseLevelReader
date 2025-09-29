This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Cron Jobs

This project includes several cron jobs for automated tasks:

### Daily Task (`/api/cron/daily`)
- **Schedule**: `0 9 * * *` (每天上午9点)
- **Function**: RSS同步，获取最新文章
- **Test**: `http://localhost:3000/api/cron/daily`

### Weekly Task (`/api/cron/weekly`)
- **Schedule**: `0 10 * * 1` (每周一上午10点)
- **Function**: 生成周统计报告
- **Test**: `http://localhost:3000/api/cron/weekly`

### Monthly Task (`/api/cron/monthly`)
- **Schedule**: `0 11 1 * *` (每月1日上午11点)
- **Function**: 清理30天前的旧文章
- **Test**: `http://localhost:3000/api/cron/monthly`

### Hourly Task (`/api/cron/hourly`)
- **Schedule**: `0 * * * *` (每小时)
- **Function**: 更新文章热度分数
- **Test**: `http://localhost:3000/api/cron/hourly`

### Configure in Vercel:

1. Project Settings → Cron Jobs → Add Cron Job
2. Use the schedules and endpoints listed above
3. Method: `GET` or `POST`

### Local Testing

Visit `http://localhost:3000/test-cron` to test all cron jobs manually.

## Environment Variables

Create `.env.local` (see `.env.example`):

```
# Kimi API Key (mock by default in development)
KIMI_API_KEY=mock-api-key
```

## Bookmarks

Article detail page includes a bookmark toggle (localStorage key: `bookmarks`).

## Production Deploy

1. Set environment variables in Vercel:
   - `NEXT_PUBLIC_SITE_URL` = your domain (e.g. https://example.com)
   - `KIMI_API_KEY` (optional; dev uses mock)
2. Configure Vercel Cron to hit the cron endpoints listed above.
3. Build & Deploy. Pages use ISR (`revalidate=86400`) for home, list, and article pages.
4. Submit `sitemap.xml` to search engines after first deploy.

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