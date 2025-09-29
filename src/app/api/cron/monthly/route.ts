import { NextResponse } from 'next/server';
import { prismaStorage } from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse } from '@/utils/api';

// GET/POST /api/cron/monthly - 每月数据清理任务
export async function GET() {
  try {
    console.log(`[${new Date().toISOString()}] Starting monthly cleanup task`);
    
    const startTime = Date.now();
    
    // 清理30天前的文章
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);
    
    const allArticles = await prismaStorage.getAllArticles();
    const articlesToDelete = allArticles.filter(
      article => new Date(article.publishDate) < cutoffDate
    );
    
    let deletedCount = 0;
    for (const article of articlesToDelete) {
      const success = await prismaStorage.deleteArticle(article.id);
      if (success) {
        deletedCount++;
      }
    }
    
    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] Monthly cleanup completed in ${duration}ms: ${deletedCount} articles deleted`);
    
    return NextResponse.json(
      createSuccessResponse(
        { deletedCount }, 
        `Monthly cron completed, ${deletedCount} old articles deleted in ${duration}ms`
      )
    );
  } catch (error) {
    console.error('Monthly cron failed:', error);
    return NextResponse.json(
      createErrorResponse('Monthly cron failed'),
      { status: 500 }
    );
  }
}

export const POST = GET;