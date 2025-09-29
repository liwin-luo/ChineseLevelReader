import { NextRequest, NextResponse } from 'next/server';
import { rssService } from '@/lib/rss';
import { translationService } from '@/lib/translation';
import { prismaStorage } from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse } from '@/utils/api';
import { Article, RSSFeed, DifficultyLevel } from '@/types';

// POST /api/process-rss - 从RSS获取数据，翻译成英文，然后记录到数据库
export async function POST(request: NextRequest) {
  try {
    // 获取请求参数
    let limit = 5;
    try {
      const body = await request.json();
      limit = body.limit || 5;
    } catch (parseError) {
      // 如果没有提供参数或参数解析失败，使用默认值
      console.log('No valid request body provided, using default limit of 5');
    }
    
    // 1. 从RSS获取数据
    console.log('Step 1: Fetching RSS data...');
    const rssItems = await rssService.getLatestItems(limit);
    console.log(`Fetched ${rssItems.length} RSS items`);
    
    const processedArticles: Article[] = [];
    const errors: string[] = [];
    
    // 2. 处理每个RSS条目
    for (const [index, rssItem] of rssItems.entries()) {
      try {
        console.log(`Processing item ${index + 1}/${rssItems.length}: ${rssItem.title}`);
        
        // 检查是否已经存在相同的文章
        const existingArticles = await prismaStorage.getAllArticles();
        const exists = existingArticles.some(article => 
          article.sourceUrl === rssItem.link || article.title === rssItem.title
        );
        
        if (exists) {
          console.log(`Article already exists: ${rssItem.title}`);
          continue;
        }
        
        // 3. 翻译内容成英文
        console.log('Translating content...');
        const translationResult = await translationService.translate({
          text: rssItem.content || rssItem.description,
          fromLanguage: 'zh',
          toLanguage: 'en'
        });
        
        console.log('Translation completed');
        
        // 4. 创建文章并保存到数据库
        console.log('Saving to database...');
        const article = await prismaStorage.createArticle({
          title: rssItem.title,
          content: rssItem.content || rssItem.description,
          originalContent: rssItem.content || rssItem.description,
          translatedContent: translationResult.translatedText,
          difficulty: DifficultyLevel.MEDIUM, // 初始难度，后续可以重新计算
          source: 'RSS Feed',
          sourceUrl: rssItem.link,
          publishDate: new Date(rssItem.pubDate),
          readingTime: 5, // 初始值，后续可以重新计算
          wordCount: 0, // 初始值，后续可以重新计算
          isPublished: true,
          tags: ['rss', 'imported']
        });
        
        processedArticles.push(article);
        console.log(`Successfully processed: ${rssItem.title}`);
      } catch (error) {
        const errorMessage = `Error processing "${rssItem.title}": ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(errorMessage);
        errors.push(errorMessage);
      }
    }
    
    return NextResponse.json(
      createSuccessResponse(
        {
          processed: processedArticles.length,
          articles: processedArticles,
          errors: errors.length > 0 ? errors : undefined
        },
        `Successfully processed ${processedArticles.length} articles from RSS feed${errors.length > 0 ? ` with ${errors.length} errors` : ''}`
      )
    );
  } catch (error) {
    console.error('RSS Processing Error:', error);
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : 'Failed to process RSS data'),
      { status: 500 }
    );
  }
}

// GET /api/process-rss - 获取处理状态或示例
export async function GET() {
  try {
    return NextResponse.json(
      createSuccessResponse(
        { message: 'RSS processing API is ready. Use POST method to process RSS feeds.' },
        'API endpoint information'
      )
    );
  } catch (error) {
    return NextResponse.json(
      createErrorResponse('Failed to get API status'),
      { status: 500 }
    );
  }
}