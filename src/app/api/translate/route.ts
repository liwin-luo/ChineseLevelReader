import { NextRequest, NextResponse } from 'next/server';
import { translationService } from '@/lib/translation';
import { createSuccessResponse, createErrorResponse, validateRequired } from '@/utils/api';
import { TranslationRequest } from '@/types';

// POST /api/translate - 翻译文本
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证请求参数
    validateRequired(body.text, 'text');
    validateRequired(body.fromLanguage, 'fromLanguage');
    validateRequired(body.toLanguage, 'toLanguage');
    
    const translationRequest: TranslationRequest = {
      text: body.text,
      fromLanguage: body.fromLanguage,
      toLanguage: body.toLanguage
    };
    
    // 执行翻译
    const result = await translationService.translate(translationRequest);
    
    return NextResponse.json(
      createSuccessResponse(result, 'Translation completed successfully')
    );
  } catch (error) {
    console.error('Translation API Error:', error);
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : 'Translation failed'),
      { status: 500 }
    );
  }
}

// POST /api/translate/batch - 批量翻译
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    validateRequired(body.requests, 'requests');
    
    if (!Array.isArray(body.requests)) {
      throw new Error('requests must be an array');
    }
    
    // 验证每个请求
    body.requests.forEach((req: any, index: number) => {
      validateRequired(req.text, `requests[${index}].text`);
      validateRequired(req.fromLanguage, `requests[${index}].fromLanguage`);
      validateRequired(req.toLanguage, `requests[${index}].toLanguage`);
    });
    
    // 执行批量翻译
    const results = await translationService.batchTranslate(body.requests);
    
    return NextResponse.json(
      createSuccessResponse(
        { results, count: results.length },
        `Successfully translated ${results.length} items`
      )
    );
  } catch (error) {
    console.error('Batch Translation API Error:', error);
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : 'Batch translation failed'),
      { status: 500 }
    );
  }
}