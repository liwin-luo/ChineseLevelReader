import { NextResponse } from 'next/server';
import { prismaStorage } from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse } from '@/utils/api';

// GET /api/articles/stats - 获取文章统计信息
export async function GET() {
  try {
    const stats = await prismaStorage.getStatistics();
    
    return NextResponse.json(
      createSuccessResponse(stats, 'Statistics retrieved successfully')
    );
  } catch (error) {
    console.error('Stats API Error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to get statistics'),
      { status: 500 }
    );
  }
}