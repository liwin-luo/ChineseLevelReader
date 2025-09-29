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
    this.baseUrl = process.env.KIMI_API_BASE_URL || 'https://api.moonshot.cn/v1'; // Kimi API 的实际地址
  }

  /**
   * 翻译文本（模拟实现）
   */
  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    console.log('Translation request:', request);
    console.log('API Key:', this.apiKey);
    console.log('Base URL:', this.baseUrl);
    
    // 在开发环境中使用模拟翻译
    if (process.env.NODE_ENV === 'development' && !this.apiKey.startsWith('sk-')) {
      console.log('Using mock translation in development');
      return this.mockTranslate(request);
    }

    // 生产环境中的实际API调用
    try {
      console.log('Calling real Kimi API');
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
    
    console.log('Calling Kimi API with prompt:', prompt);
    
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
      const errorText = await apiResponse.text();
      console.error('Kimi API error response:', errorText);
      throw new Error(`Kimi API error: ${apiResponse.status} - ${errorText}`);
    }

    const data = await apiResponse.json();
    console.log('Kimi API response:', data);
    const translatedText = data.choices[0]?.message?.content || '';

    // 提取文章分类标签
    const categories = this.extractCategories(request.text);
    
    return {
      translatedText: this.cleanTranslatedText(translatedText),
      originalText: request.text,
      fromLanguage: request.fromLanguage,
      toLanguage: request.toLanguage,
      confidence: 0.9, // Kimi通常有较高的翻译质量
      category: categories
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
      .replace(/^\s*翻译[：:]/gm, '') // 移除开头的"翻译："
      .replace(/^\s*Translation[：:]/gm, '') // 移除开头的"Translation:"
      .trim();
  }

  /**
   * 从文本中提取分类标签
   */
  private extractCategories(text: string): string[] {
    const categories: string[] = [];
    
    // 定义关键词分类映射
    const categoryKeywords: Record<string, RegExp> = {
      '人工智能': /人工智能|AI|机器学习|深度学习|神经网络|算法|模型/g,
      '科技公司': /苹果|微软|特斯拉|字节跳动|腾讯|阿里巴巴|百度|华为|小米/g,
      '硬件技术': /芯片|半导体|处理器|手机|电脑|设备/g,
      '互联网': /云计算|云服务|服务器|网络|5G|6G/g,
      '新兴技术': /区块链|比特币|加密货币|元宇宙|VR|AR|量子/g,
      '生物科技': /生物技术|基因|医疗|健康/g,
      '新能源': /新能源|电池|充电|电动车/g,
      '机器人': /机器人|自动化|智能制造/g,
      '游戏娱乐': /游戏|电竞|娱乐/g
    };
    
    // 检查文本匹配的分类
    Object.entries(categoryKeywords).forEach(([category, pattern]) => {
      if (pattern.test(text)) {
        categories.push(category);
      }
    });
    
    // 如果没有匹配到特定分类，使用默认分类
    if (categories.length === 0) {
      categories.push('科技');
    }
    
    return categories;
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

    // 提取文章分类标签
    const categories = this.extractCategories(text);
    
    return {
      translatedText,
      originalText: text,
      fromLanguage,
      toLanguage,
      confidence,
      category: categories
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
    const chinesePattern = /[\u4e00-\u9fff]/;
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