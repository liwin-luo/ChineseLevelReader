import { Article, DifficultyLevel, RSSFeed } from '@/types';
import { rssService } from '@/lib/rss';
import { translationService } from '@/lib/translation';
import { prismaStorage } from '@/lib/prisma';
import { countCharacters, countSentences } from '@/utils/api';
import { calculateDifficulty } from '@/constants/difficulty';

// RSS到文章的转换服务
export class RSSToArticleService {
  
  /**
   * 从RSS数据创建文章
   */
  async createArticleFromRSS(rssItem: RSSFeed, translatedContent?: string): Promise<Article> {
    const content = this.processContent(rssItem.content || rssItem.description);
    const analysis = this.analyzeContent(content);
    
    // 如果没有提供翻译，则调用翻译服务
    let finalTranslatedContent = translatedContent;
    if (!finalTranslatedContent) {
      try {
        const translationResult = await translationService.translate({
          text: content,
          fromLanguage: 'zh',
          toLanguage: 'en'
        });
        finalTranslatedContent = translationResult.translatedText;
      } catch (error) {
        console.error('Translation failed:', error);
        finalTranslatedContent = this.generatePlaceholderTranslation(rssItem.title);
      }
    }
    
    const article: Omit<Article, 'id' | 'createdAt' | 'updatedAt'> = {
      title: rssItem.title,
      content: content,
      originalContent: content,
      translatedContent: finalTranslatedContent,
      difficulty: analysis.difficulty,
      source: '极客公园',
      sourceUrl: rssItem.link,
      publishDate: new Date(rssItem.pubDate),
      tags: this.extractTags(content),
      readingTime: analysis.readingTime,
      wordCount: analysis.wordCount,
      isPublished: true
    };
    
    return await prismaStorage.createArticle(article);
  }

  /**
   * 处理和清理内容
   */
  private processContent(rawContent: string): string {
    return rawContent
      .replace(/\\s+/g, ' ') // 合并空格
      .replace(/\n+/g, '\n') // 合并换行
      .trim()
      .substring(0, 1500); // 限制长度
  }

  /**
   * 分析内容特征
   */
  private analyzeContent(content: string): {
    difficulty: DifficultyLevel;
    readingTime: number;
    wordCount: number;
    characterCount: number;
    sentences: number;
    avgSentenceLength: number;
  } {
    const characterCount = countCharacters(content);
    const sentences = countSentences(content);
    const avgSentenceLength = sentences > 0 ? characterCount / sentences : 0;
    
    // 简化的词汇复杂度评估
    const vocabularyComplexity = this.assessVocabularyComplexity(content);
    
    // 语法复杂度评估
    const grammarComplexity = this.assessGrammarComplexity(content);
    
    // 计算难度级别
    const difficulty = calculateDifficulty({
      vocabularyComplexity,
      avgSentenceLength,
      grammarComplexity,
      characterCount
    });
    
    // 估算阅读时间（中文阅读速度约200-300字/分钟）
    const readingTime = Math.max(1, Math.round(characterCount / 250));
    
    return {
      difficulty,
      readingTime,
      wordCount: characterCount,
      characterCount,
      sentences,
      avgSentenceLength
    };
  }

  /**
   * 评估词汇复杂度
   */
  private assessVocabularyComplexity(content: string): number {
    // 常见词汇模式
    const commonWords = ['的', '是', '在', '有', '和', '了', '与', '也', '这', '个', '我', '你', '他', '她', '它', '们', '不', '很', '都', '还', '要', '可以', '能够', '应该', '需要', '时候', '地方', '人们', '社会', '国家', '发展', '技术', '系统', '服务', '产品', '市场', '用户', '数据', '信息', '内容', '方式', '问题', '解决', '提供', '支持', '使用', '工作', '学习', '生活'];
    
    // 复杂词汇模式（科技、专业术语等）
    const complexWords = ['人工智能', '机器学习', '深度学习', '神经网络', '算法', '模型', '架构', '框架', 'API', '接口', '数据库', '云计算', '区块链', '量子', '生物技术', '基因', '纳米', '芯片', '半导体', '处理器', '存储', '网络', '协议', '加密', '安全', '隐私', '认证', '授权', '监管', '合规', '策略', '战略', '创新', '颠覆', '转型', '升级', '优化', '整合', '融合', '协同', '生态', '平台', '终端', '设备', '硬件', '软件', '应用', '程序', '代码', '开发', '测试', '部署', '运维', '监控', '分析', '统计', '可视化', '自动化', '智能化', '数字化'];
    
    const words = content.split(/\\s+/);
    let complexWordCount = 0;
    let commonWordCount = 0;
    
    words.forEach(word => {
      if (complexWords.some(complex => word.includes(complex))) {
        complexWordCount++;
      } else if (commonWords.some(common => word.includes(common))) {
        commonWordCount++;
      }
    });
    
    const totalWords = words.length;
    const complexRatio = complexWordCount / totalWords;
    const commonRatio = commonWordCount / totalWords;
    
    // 复杂度评分 (1-10)
    return Math.min(10, Math.max(1, (complexRatio * 10) + (1 - commonRatio) * 3));
  }

  /**
   * 评估语法复杂度
   */
  private assessGrammarComplexity(content: string): number {
    let complexity = 1;
    
    // 检查复杂语法特征
    const complexPatterns = [
      /[，、；]/g, // 标点符号多样性
      /虽然.*但是/g, // 转折句
      /不仅.*而且/g, // 递进句
      /如果.*那么/g, // 条件句
      /由于.*因此/g, // 因果句
      /.*的.*的.*的/g, // 多重定语
      /被.*了/g, // 被动句
      /.*使得.*/g, // 使动句
      /通过.*实现/g, // 方式句
      /随着.*的.*发展/g, // 伴随句
    ];
    
    complexPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        complexity += matches.length * 0.5;
      }
    });
    
    return Math.min(10, complexity);
  }

  /**
   * 从内容中提取标签
   */
  private extractTags(content: string): string[] {
    const tagPatterns = [
      { pattern: /人工智能|AI|机器学习|深度学习/g, tag: '人工智能' },
      { pattern: /苹果|iPhone|iOS|Mac|iPad/g, tag: '苹果' },
      { pattern: /微软|Windows|Azure|Office/g, tag: '微软' },
      { pattern: /特斯拉|电动车|自动驾驶/g, tag: '特斯拉' },
      { pattern: /字节跳动|抖音|TikTok/g, tag: '字节跳动' },
      { pattern: /腾讯|微信|QQ/g, tag: '腾讯' },
      { pattern: /阿里巴巴|淘宝|支付宝/g, tag: '阿里巴巴' },
      { pattern: /百度|搜索|地图/g, tag: '百度' },
      { pattern: /华为|鸿蒙|手机/g, tag: '华为' },
      { pattern: /小米|雷军|MIUI/g, tag: '小米' },
      { pattern: /芯片|半导体|处理器/g, tag: '硬件' },
      { pattern: /云计算|云服务|服务器/g, tag: '云计算' },
      { pattern: /区块链|比特币|加密货币/g, tag: '区块链' },
      { pattern: /元宇宙|VR|AR|虚拟现实/g, tag: '元宇宙' },
      { pattern: /5G|6G|通信|网络/g, tag: '通信' },
      { pattern: /新能源|电池|充电/g, tag: '新能源' },
      { pattern: /机器人|自动化|智能制造/g, tag: '机器人' },
      { pattern: /生物技术|基因|医疗/g, tag: '生物技术' },
      { pattern: /量子|量子计算|量子通信/g, tag: '量子科技' },
      { pattern: /游戏|电竞|娱乐/g, tag: '游戏' }
    ];
    
    const tags = ['科技']; // 默认标签
    
    tagPatterns.forEach(({ pattern, tag }) => {
      if (pattern.test(content) && !tags.includes(tag)) {
        tags.push(tag);
      }
    });
    
    return tags.slice(0, 5); // 限制标签数量
  }

  /**
   * 生成占位符翻译（实际项目中应该调用真实的翻译API）
   */
  private generatePlaceholderTranslation(title: string): string {
    // 简单的标题翻译映射
    const translations: Record<string, string> = {
      'ChatGPT推出新功能：支持实时语音对话': 'ChatGPT Launches New Feature: Real-time Voice Conversation Support',
      '苹果发布iOS 18：AI功能全面升级': 'Apple Releases iOS 18: Comprehensive AI Feature Upgrades',
      '特斯拉机器人Optimus最新进展：已能完成复杂任务': 'Tesla Robot Optimus Latest Progress: Now Capable of Complex Tasks',
      '微软Azure AI服务新突破：多模态理解能力大幅提升': 'Microsoft Azure AI Service Breakthrough: Significant Improvement in Multimodal Understanding',
      '字节跳动发布AI绘画工具：挑战Midjourney和DALL-E': 'ByteDance Releases AI Drawing Tool: Challenging Midjourney and DALL-E'
    };
    
    return translations[title] || `English translation of: ${title}`;
  }

  /**
   * 批量处理RSS数据
   */
  async processRSSFeed(): Promise<Article[]> {
    try {
      const rssItems = await rssService.getLatestItems(5);
      const articles: Article[] = [];
      
      for (const rssItem of rssItems) {
        // 检查是否已经存在相同的文章
        const existingArticles = await prismaStorage.getAllArticles();
        const exists = existingArticles.some(article => 
          article.sourceUrl === rssItem.link || article.title === rssItem.title
        );
        
        if (!exists) {
          const article = await this.createArticleFromRSS(rssItem);
          articles.push(article);
        }
      }
      
      return articles;
    } catch (error) {
      console.error('Error processing RSS feed:', error);
      throw error;
    }
  }
}

// 创建全局实例
export const rssToArticleService = new RSSToArticleService();