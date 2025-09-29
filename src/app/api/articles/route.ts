import { NextRequest, NextResponse } from 'next/server';
import { prismaStorage } from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse, validateRequired } from '@/utils/api';
import { DifficultyLevel } from '@/types';

// GET /api/articles - 获取文章列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const difficulty = searchParams.get('difficulty') as DifficultyLevel | undefined;
    const search = searchParams.get('search') || undefined;
    const sortBy = searchParams.get('sortBy') as 'publishDate' | 'difficulty' | 'readingTime' || 'publishDate';
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc';

    const result = await prismaStorage.getPaginatedArticles(
      page,
      limit,
      sortBy,
      sortOrder,
      {
        difficulty,
        searchTerm: search
      }
    );

    return NextResponse.json(
      createSuccessResponse(result, `Successfully fetched ${result.articles.length} articles`)
    );
  } catch (error) {
    console.error('Articles API Error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to fetch articles'),
      { status: 500 }
    );
  }
}

// POST /api/articles - 创建新文章
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证必填字段
    validateRequired(body.title, 'title');
    validateRequired(body.content, 'content');
    validateRequired(body.originalContent, 'originalContent');
    validateRequired(body.translatedContent, 'translatedContent');
    validateRequired(body.difficulty, 'difficulty');
    validateRequired(body.source, 'source');
    validateRequired(body.sourceUrl, 'sourceUrl');
    
    const articleData = {
      title: body.title,
      content: body.content,
      originalContent: body.originalContent,
      translatedContent: body.translatedContent,
      difficulty: body.difficulty as DifficultyLevel,
      source: body.source,
      sourceUrl: body.sourceUrl,
      publishDate: body.publishDate ? new Date(body.publishDate) : new Date(),
      tags: body.tags || [],
      readingTime: body.readingTime || 5,
      wordCount: body.wordCount || body.content.length,
      isPublished: body.isPublished !== undefined ? body.isPublished : true,
      hotScore: body.hotScore || 0
    };
    
    const article = await prismaStorage.createArticle(articleData);
    
    return NextResponse.json(
      createSuccessResponse(article, 'Article created successfully'),
      { status: 201 }
    );
  } catch (error) {
    console.error('Create Article Error:', error);
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : 'Failed to create article'),
      { status: 500 }
    );
  }
}