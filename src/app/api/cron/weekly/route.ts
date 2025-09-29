import { NextResponse } from 'next/server';
import { prismaStorage } from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse } from '@/utils/api';

// GET/POST /api/cron/weekly - 每周统计报告任务
export async function GET() {
  try {
    console.log(`[${new Date().toISOString()}] Starting weekly report generation`);
    
    const startTime = Date.now();
    
    // 获取一周内的统计数据
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const allArticles = await prismaStorage.getAllArticles();
    const recentArticles = allArticles.filter(
      article => new Date(article.publishDate) >= oneWeekAgo
    );
    
    const stats = await prismaStorage.getStatistics();
    
    // 生成报告内容
    const report = {
      period: 'weekly',
      startDate: oneWeekAgo.toISOString(),
      endDate: new Date().toISOString(),
      totalArticles: recentArticles.length,
      articlesByDifficulty: {
        easy: recentArticles.filter(a => a.difficulty === 'easy').length,
        medium: recentArticles.filter(a => a.difficulty === 'medium').length,
        hard: recentArticles.filter(a => a.difficulty === 'hard').length
      },
      overallStats: stats
    };
    
    // 这里可以保存报告到数据库或者发送邮件通知
    console.log(`Weekly Report:`, report);
    
    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] Weekly report generated in ${duration}ms`);
    
    return NextResponse.json(
      createSuccessResponse(report, `Weekly cron completed, report generated in ${duration}ms`)
    );
  } catch (error) {
    console.error('Weekly cron failed:', error);
    return NextResponse.json(
      createErrorResponse('Weekly cron failed'),
      { status: 500 }
    );
  }
}

export const POST = GET;