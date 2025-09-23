import { NextRequest, NextResponse } from 'next/server';
import { prismaStorage } from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse, ApiError, ApiErrorType } from '@/utils/api';
import { DifficultyLevel } from '@/types';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/articles/[id] - 获取单个文章
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const article = await prismaStorage.getArticleById(params.id);
    
    if (!article) {
      return NextResponse.json(
        createErrorResponse('Article not found'),
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      createSuccessResponse(article, 'Article retrieved successfully')
    );
  } catch (error) {
    console.error('Get Article Error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to get article'),
      { status: 500 }
    );
  }
}

// PUT /api/articles/[id] - 更新文章
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json();
    
    // 检查文章是否存在
    const existingArticle = await prismaStorage.getArticleById(params.id);
    if (!existingArticle) {
      return NextResponse.json(
        createErrorResponse('Article not found'),
        { status: 404 }
      );
    }
    
    // 准备更新数据
    const updateData: any = {};
    
    if (body.title) updateData.title = body.title;
    if (body.content) updateData.content = body.content;
    if (body.originalContent) updateData.originalContent = body.originalContent;
    if (body.translatedContent) updateData.translatedContent = body.translatedContent;
    if (body.difficulty) updateData.difficulty = body.difficulty as DifficultyLevel;
    if (body.source) updateData.source = body.source;
    if (body.sourceUrl) updateData.sourceUrl = body.sourceUrl;
    if (body.publishDate) updateData.publishDate = new Date(body.publishDate);
    if (body.tags) updateData.tags = body.tags;
    if (body.readingTime) updateData.readingTime = body.readingTime;
    if (body.wordCount) updateData.wordCount = body.wordCount;
    if (body.isPublished !== undefined) updateData.isPublished = body.isPublished;
    
    const updatedArticle = await prismaStorage.updateArticle(params.id, updateData);
    
    return NextResponse.json(
      createSuccessResponse(updatedArticle, 'Article updated successfully')
    );
  } catch (error) {
    console.error('Update Article Error:', error);
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : 'Failed to update article'),
      { status: 500 }
    );
  }
}

// DELETE /api/articles/[id] - 删除文章
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const success = await prismaStorage.deleteArticle(params.id);
    
    if (!success) {
      return NextResponse.json(
        createErrorResponse('Article not found'),
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      createSuccessResponse(null, 'Article deleted successfully')
    );
  } catch (error) {
    console.error('Delete Article Error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to delete article'),
      { status: 500 }
    );
  }
}