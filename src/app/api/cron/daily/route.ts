import { NextResponse } from 'next/server';
import { rssToArticleService } from '@/lib/rssProcessor';
import { createSuccessResponse, createErrorResponse } from '@/utils/api';

// GET/POST /api/cron/daily - 供 Vercel Cron 调用的每日同步任务
export async function GET() {
  try {
    const articles = await rssToArticleService.processRSSFeed();
    return NextResponse.json(
      createSuccessResponse({ newArticles: articles.length }, `Daily cron completed, ${articles.length} new articles`)
    );
  } catch (error) {
    return NextResponse.json(
      createErrorResponse('Daily cron failed'),
      { status: 500 }
    );
  }
}

export const POST = GET;


