import { TranslationRequest, TranslationResponse } from '@/types';

// 模拟的翻译服务接口
export interface ITranslationService {
  translate(request: TranslationRequest): Promise<TranslationResponse>;
}

// 模拟Kimi翻译服务
export class MockKimiTranslationService implements ITranslationService {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(apiKey: string = 'mock-api-key') {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.moonshot.cn/v1'; // Kimi API 的实际地址
  }

  /**
   * 翻译文本（模拟实现）
   */
  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    // 在开发环境中使用模拟翻译
    if (process.env.NODE_ENV === 'development' || !this.apiKey.startsWith('sk-')) {
      return this.mockTranslate(request);
    }

    // 生产环境中的实际API调用
    try {
      const response = await this.callKimiAPI(request);
      return response;
    } catch (error) {
      console.error('Translation API error:', error);
      // 如果API调用失败，回退到模拟翻译
      return this.mockTranslate(request);
    }
  }

  /**
   * 调用真实的Kimi API（生产环境）
   */
  private async callKimiAPI(request: TranslationRequest): Promise<TranslationResponse> {
    const prompt = this.buildTranslationPrompt(request);
    
    const apiResponse = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'moonshot-v1-8k',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的中英文翻译助手，专门为中文学习者提供准确、自然的翻译服务。请保持原文的语调和风格。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    if (!apiResponse.ok) {
      throw new Error(`Kimi API error: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    const translatedText = data.choices[0]?.message?.content || '';

    return {
      translatedText: this.cleanTranslatedText(translatedText),
      originalText: request.text,
      fromLanguage: request.fromLanguage,
      toLanguage: request.toLanguage,
      confidence: 0.9 // Kimi通常有较高的翻译质量
    };
  }

  /**
   * 构建翻译提示词
   */
  private buildTranslationPrompt(request: TranslationRequest): string {
    const { text, fromLanguage, toLanguage } = request;
    
    if (fromLanguage === 'zh' && toLanguage === 'en') {
      return `请将以下中文文本翻译成英文，保持原文的意思和语调：\n\n${text}`;
    } else if (fromLanguage === 'en' && toLanguage === 'zh') {
      return `请将以下英文文本翻译成中文，保持原文的意思和语调：\n\n${text}`;
    } else {
      return `请将以下文本从${fromLanguage}翻译成${toLanguage}：\n\n${text}`;
    }
  }

  /**
   * 清理翻译结果
   */
  private cleanTranslatedText(text: string): string {
    return text
      .replace(/^\\s*翻译[：:]/gm, '') // 移除开头的\"翻译：\"
      .replace(/^\\s*Translation[：:]/gm, '') // 移除开头的\"Translation:\"
      .trim();
  }

  /**
   * 模拟翻译实现
   */
  private async mockTranslate(request: TranslationRequest): Promise<TranslationResponse> {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const { text, fromLanguage, toLanguage } = request;
    let translatedText = '';
    let confidence = 0.85;

    if (fromLanguage === 'zh' && toLanguage === 'en') {
      translatedText = this.mockChineseToEnglish(text);
    } else if (fromLanguage === 'en' && toLanguage === 'zh') {
      translatedText = this.mockEnglishToChinese(text);
    } else {
      translatedText = `[Translated from ${fromLanguage} to ${toLanguage}] ${text}`;
      confidence = 0.7;
    }

    return {
      translatedText,
      originalText: text,
      fromLanguage,
      toLanguage,
      confidence
    };
  }

  /**
   * 模拟中文到英文翻译
   */
  private mockChineseToEnglish(text: string): string {
    // 简单的词汇映射表（实际应用中会使用更复杂的翻译模型）
    const translations: Record<string, string> = {
      'ChatGPT推出新功能：支持实时语音对话': 'ChatGPT Launches New Feature: Real-time Voice Conversation Support',
      '苹果发布iOS 18：AI功能全面升级': 'Apple Releases iOS 18: Comprehensive AI Feature Upgrades',
      '特斯拉机器人Optimus最新进展：已能完成复杂任务': 'Tesla Robot Optimus Latest Progress: Now Capable of Complex Tasks',
      '微软Azure AI服务新突破：多模态理解能力大幅提升': 'Microsoft Azure AI Service Breakthrough: Significant Improvement in Multimodal Understanding',
      '字节跳动发布AI绘画工具：挑战Midjourney和DALL-E': 'ByteDance Releases AI Drawing Tool: Challenging Midjourney and DALL-E',
      '人工智能': 'artificial intelligence',
      '机器学习': 'machine learning',
      '深度学习': 'deep learning',
      '技术': 'technology',
      '发展': 'development',
      '创新': 'innovation',
      '应用': 'application',
      '系统': 'system',
      '服务': 'service',
      '产品': 'product',
      '用户': 'user',
      '数据': 'data',
      '算法': 'algorithm',
      '模型': 'model',
      '平台': 'platform',
      '公司': 'company',
      '市场': 'market',
      '行业': 'industry',
      '未来': 'future',
      '智能': 'intelligent',
      '自动': 'automatic',
      '效率': 'efficiency',
      '体验': 'experience',
      '功能': 'function',
      '特性': 'feature',
      '性能': 'performance',
      '质量': 'quality',
      '安全': 'security',
      '隐私': 'privacy'
    };

    // 检查是否有完整匹配
    if (translations[text]) {
      return translations[text];
    }

    // 简单的词汇替换翻译
    let translated = text;
    Object.entries(translations).forEach(([chinese, english]) => {
      translated = translated.replace(new RegExp(chinese, 'g'), english);
    });

    // 如果没有找到翻译，生成一个通用翻译
    if (translated === text) {
      return `[English translation] ${text}`;
    }

    return translated;
  }

  /**
   * 模拟英文到中文翻译
   */
  private mockEnglishToChinese(text: string): string {
    const translations: Record<string, string> = {
      'artificial intelligence': '人工智能',
      'machine learning': '机器学习',
      'deep learning': '深度学习',
      'technology': '技术',
      'development': '发展',
      'innovation': '创新',
      'application': '应用',
      'system': '系统',
      'service': '服务',
      'product': '产品',
      'user': '用户',
      'data': '数据',
      'algorithm': '算法',
      'model': '模型',
      'platform': '平台',
      'company': '公司',
      'market': '市场',
      'industry': '行业',
      'future': '未来',
      'intelligent': '智能',
      'automatic': '自动',
      'efficiency': '效率',
      'experience': '体验',
      'function': '功能',
      'feature': '特性',
      'performance': '性能',
      'quality': '质量',
      'security': '安全',
      'privacy': '隐私'
    };

    let translated = text;
    Object.entries(translations).forEach(([english, chinese]) => {
      translated = translated.replace(new RegExp(english, 'gi'), chinese);
    });

    if (translated === text) {
      return `[中文翻译] ${text}`;
    }

    return translated;
  }

  /**
   * 批量翻译
   */
  async batchTranslate(requests: TranslationRequest[]): Promise<TranslationResponse[]> {
    const results: TranslationResponse[] = [];
    
    // 并发处理，但限制并发数量
    const batchSize = 3;
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(request => this.translate(request))
      );
      results.push(...batchResults);
    }
    
    return results;
  }

  /**
   * 检测语言
   */
  detectLanguage(text: string): 'zh' | 'en' | 'unknown' {
    // 简单的语言检测
    const chinesePattern = /[\\u4e00-\\u9fff]/;
    const englishPattern = /[a-zA-Z]/;
    
    const hasChinese = chinesePattern.test(text);
    const hasEnglish = englishPattern.test(text);
    
    if (hasChinese && !hasEnglish) {
      return 'zh';
    } else if (hasEnglish && !hasChinese) {
      return 'en';
    } else {
      return 'unknown';
    }
  }
}

// 创建全局翻译服务实例
export const translationService = new MockKimiTranslationService(
  process.env.KIMI_API_KEY || 'mock-api-key'
);