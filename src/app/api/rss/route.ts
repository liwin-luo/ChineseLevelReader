import { NextRequest, NextResponse } from 'next/server';
import { rssService } from '@/lib/rss';
import { createSuccessResponse, createErrorResponse } from '@/utils/api';

// GET /api/rss - 获取RSS数据
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');

    let rssItems;
    
    if (search) {
      // 搜索特定关键词的RSS条目
      rssItems = await rssService.searchItems(search);
    } else {
      // 获取最新的RSS条目
      rssItems = await rssService.getLatestItems(limit);
    }

    return NextResponse.json(
      createSuccessResponse(rssItems, `Successfully fetched ${rssItems.length} RSS items`)
    );
  } catch (error) {
    console.error('RSS API Error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to fetch RSS data'),
      { status: 500 }
    );
  }
}

// POST /api/rss/refresh - 强制刷新RSS缓存
export async function POST() {
  try {
    // 在实际应用中，这里可以清除缓存并重新获取数据
    const rssItems = await rssService.fetchRSSFeed();
    
    return NextResponse.json(
      createSuccessResponse(
        { count: rssItems.length },
        'RSS cache refreshed successfully'
      )
    );
  } catch (error) {
    console.error('RSS Refresh Error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to refresh RSS data'),
      { status: 500 }
    );
  }
}