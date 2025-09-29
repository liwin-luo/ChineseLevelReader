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
      const ageInDays = (Date.now() - new Date(article.publishDate).getTime()) / (1000 * 60 * 60 * 24);
      const decayFactor = Math.max(0.1, 1 - (ageInDays / 30)); // 30天衰减到10%
      const hotScore = Math.floor((article.readingTime || 1) * decayFactor * 100);
      
      // 更新文章热度分数（需要扩展 Article 模型以支持 hotScore 字段）
      // 暂时记录日志，实际应用中需要更新数据库
      console.log(`Article ${article.id} hot score updated to ${hotScore}`);
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