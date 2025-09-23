import { NextRequest, NextResponse } from 'next/server';
import { scheduleService } from '@/lib/schedule';
import { createSuccessResponse, createErrorResponse } from '@/utils/api';

// GET /api/schedule - 获取定时任务状态
export async function GET() {
  try {
    const status = scheduleService.getStatus();
    
    return NextResponse.json(
      createSuccessResponse(status, 'Schedule status retrieved successfully')
    );
  } catch (error) {
    console.error('Schedule Status Error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to get schedule status'),
      { status: 500 }
    );
  }
}

// POST /api/schedule - 管理定时任务（启动/停止/手动触发）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;
    
    switch (action) {
      case 'start':
        scheduleService.start();
        return NextResponse.json(
          createSuccessResponse(null, 'Schedule service started')
        );
        
      case 'stop':
        scheduleService.stop();
        return NextResponse.json(
          createSuccessResponse(null, 'Schedule service stopped')
        );
        
      case 'trigger':
        const result = await scheduleService.triggerRSSSync();
        if (result.success) {
          return NextResponse.json(
            createSuccessResponse(
              { newArticles: result.count },
              `RSS sync triggered successfully, ${result.count} new articles processed`
            )
          );
        } else {
          return NextResponse.json(
            createErrorResponse(result.error || 'RSS sync failed'),
            { status: 500 }
          );
        }
        
      case 'cleanup':
        const daysToKeep = body.daysToKeep || 30;
        const deletedCount = await scheduleService.cleanupOldArticles(daysToKeep);
        return NextResponse.json(
          createSuccessResponse(
            { deletedCount },
            `Cleanup completed, ${deletedCount} old articles deleted`
          )
        );
        
      default:
        return NextResponse.json(
          createErrorResponse('Invalid action. Use: start, stop, trigger, or cleanup'),
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Schedule Action Error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to execute schedule action'),
      { status: 500 }
    );
  }
}