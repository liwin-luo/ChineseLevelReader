import { NextResponse } from 'next/server';
import { rssToArticleService } from '@/lib/rssProcessor';
import { createSuccessResponse, createErrorResponse } from '@/utils/api';

// POST /api/articles/sync-rss - 同步RSS数据到文章
export async function POST() {
  try {
    const newArticles = await rssToArticleService.processRSSFeed();
    
    return NextResponse.json(
      createSuccessResponse(
        {
          newArticles: newArticles.length,
          articles: newArticles
        },
        `Successfully synced ${newArticles.length} new articles from RSS feed`
      )
    );
  } catch (error) {
    console.error('RSS Sync Error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to sync RSS data to articles'),
      { status: 500 }
    );
  }
}