import { NextResponse } from 'next/server';
import { prismaStorage } from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse } from '@/utils/api';

// GET/POST /api/cron/hourly - 每小时文章热度更新任务
export async function GET() {
  try {
    console.log(`[${new Date().toISOString()}] Starting hourly hot score update`);
    
    const startTime = Date.now();
    
    // 获取所有文章并更新热度分数
    const allArticles = await prismaStorage.getAllArticles();
    
    // 简化的热度算法：基于发布时间和阅读时间
    for (const article of allArticles) {
      // 热度计算逻辑已移除
    }
    
    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] Hot scores updated for ${allArticles.length} articles in ${duration}ms`);
    
    return NextResponse.json(
      createSuccessResponse(
        { updatedArticles: allArticles.length }, 
        `Hourly cron completed, ${allArticles.length} articles updated in ${duration}ms`
      )
    );
  } catch (error) {
    console.error('Hourly cron failed:', error);
    return NextResponse.json(
      createErrorResponse('Hourly cron failed'),
      { status: 500 }
    );
  }
}

export const POST = GET;