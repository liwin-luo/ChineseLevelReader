import { PrismaClient, Prisma } from '@prisma/client';
import { Article, DifficultyLevel } from '@/types';
import { calculateDifficulty } from '@/constants/difficulty';
import { countCharacters, countSentences } from '@/utils/api';

// 全局Prisma客户端实例
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Prisma数据库存储服务
export class PrismaStorage {
  /**
   * 创建文章
   */
  async createArticle(articleData: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>): Promise<Article> {
    // 使用类型断言来处理类型不匹配问题
    const data: any = {
      title: articleData.title,
      content: articleData.content,
      originalContent: articleData.originalContent,
      translatedContent: articleData.translatedContent,
      difficulty: articleData.difficulty,
      source: articleData.source,
      sourceUrl: articleData.sourceUrl,
      publishDate: articleData.publishDate,
      readingTime: articleData.readingTime,
      wordCount: articleData.wordCount,
      isPublished: articleData.isPublished,
      tags: JSON.stringify(articleData.tags),
      hotScore: articleData.hotScore ?? 0
    };

    const result = await prisma.article.create({ data });

    return this.formatArticle(result);
  }

  /**
   * 获取所有文章
   */
  async getAllArticles(): Promise<Article[]> {
    const articles = await prisma.article.findMany({
      orderBy: { publishDate: 'desc' }
    });

    return articles.map(this.formatArticle);
  }

  /**
   * 根据ID获取文章
   */
  async getArticleById(id: string): Promise<Article | null> {
    const article = await prisma.article.findUnique({
      where: { id }
    });

    return article ? this.formatArticle(article) : null;
  }

  /**
   * 根据难度级别获取文章
   */
  async getArticlesByDifficulty(difficulty: DifficultyLevel): Promise<Article[]> {
    const articles = await prisma.article.findMany({
      where: { difficulty },
      orderBy: { publishDate: 'desc' }
    });

    return articles.map(this.formatArticle);
  }

  /**
   * 搜索文章
   */
  async searchArticles(searchTerm: string): Promise<Article[]> {
    const articles = await prisma.article.findMany({
      where: {
        OR: [
          { title: { contains: searchTerm } },
          { content: { contains: searchTerm } },
          { tags: { contains: searchTerm } }
        ]
      },
      orderBy: { publishDate: 'desc' }
    });

    return articles.map(this.formatArticle);
  }

  /**
   * 获取分页文章
   */
  async getPaginatedArticles(
    page: number = 1,
    limit: number = 12,
    sortBy: 'publishDate' | 'difficulty' | 'readingTime' | 'hotScore' = 'publishDate',
    sortOrder: 'asc' | 'desc' = 'desc',
    filters?: {
      difficulty?: DifficultyLevel;
      tags?: string[];
      searchTerm?: string;
      source?: string;
      dateRange?: {
        start: Date;
        end: Date;
      };
    }
  ): Promise<{
    articles: Article[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }> {
    // 构建查询条件
    const where: any = {};
    
    if (filters) {
      if (filters.difficulty) {
        where.difficulty = filters.difficulty;
      }
      
      if (filters.source) {
        where.source = { contains: filters.source };
      }
      
      if (filters.dateRange) {
        where.publishDate = {
          gte: filters.dateRange.start,
          lte: filters.dateRange.end
        };
      }
      
      if (filters.searchTerm) {
        where.OR = [
          { title: { contains: filters.searchTerm } },
          { content: { contains: filters.searchTerm } }
        ];
      }
      
      if (filters.tags && filters.tags.length > 0) {
        where.OR = [
          ...(where.OR || []),
          ...filters.tags.map(tag => ({ tags: { contains: tag } }))
        ];
      }
    }

    // 获取总数
    const total = await prisma.article.count({ where });
    
    // 获取分页数据
    const articles = await prisma.article.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit
    });

    const totalPages = Math.ceil(total / limit);

    return {
      articles: articles.map(this.formatArticle),
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };
  }

  /**
   * 更新文章
   */
  async updateArticle(id: string, updates: Partial<Article>): Promise<Article | null> {
    // 使用类型断言来处理类型不匹配问题
    const updateData: any = {};
    
    // 只更新提供的字段
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.content !== undefined) updateData.content = updates.content;
    if (updates.originalContent !== undefined) updateData.originalContent = updates.originalContent;
    if (updates.translatedContent !== undefined) updateData.translatedContent = updates.translatedContent;
    if (updates.difficulty !== undefined) updateData.difficulty = updates.difficulty;
    if (updates.source !== undefined) updateData.source = updates.source;
    if (updates.sourceUrl !== undefined) updateData.sourceUrl = updates.sourceUrl;
    if (updates.publishDate !== undefined) updateData.publishDate = updates.publishDate;
    if (updates.readingTime !== undefined) updateData.readingTime = updates.readingTime;
    if (updates.wordCount !== undefined) updateData.wordCount = updates.wordCount;
    if (updates.isPublished !== undefined) updateData.isPublished = updates.isPublished;
    if (updates.tags !== undefined) updateData.tags = JSON.stringify(updates.tags);
    if (updates.hotScore !== undefined) updateData.hotScore = updates.hotScore;

    const article = await prisma.article.update({
      where: { id },
      data: updateData
    });

    return this.formatArticle(article);
  }

  /**
   * 删除文章
   */
  async deleteArticle(id: string): Promise<boolean> {
    try {
      await prisma.article.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取统计信息
   */
  async getStatistics(): Promise<{
    totalArticles: number;
    articlesByDifficulty: Record<DifficultyLevel, number>;
    averageReadingTime: number;
    popularTags: Array<{ tag: string; count: number }>;
  }> {
    const total = await prisma.article.count();
    
    // 按难度统计
    const [easyCount, mediumCount, hardCount] = await Promise.all([
      prisma.article.count({ where: { difficulty: DifficultyLevel.EASY } }),
      prisma.article.count({ where: { difficulty: DifficultyLevel.MEDIUM } }),
      prisma.article.count({ where: { difficulty: DifficultyLevel.HARD } })
    ]);
    
    // 平均阅读时间
    const avgResult = await prisma.article.aggregate({
      _avg: {
        readingTime: true
      }
    });
    
    // 获取所有标签并统计
    const articles = await prisma.article.findMany({
      select: { tags: true }
    });
    
    const tagCounts: Record<string, number> = {};
    articles.forEach(article => {
      const tags = JSON.parse(article.tags || '[]');
      tags.forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    const popularTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalArticles: total,
      articlesByDifficulty: {
        [DifficultyLevel.EASY]: easyCount,
        [DifficultyLevel.MEDIUM]: mediumCount,
        [DifficultyLevel.HARD]: hardCount
      },
      averageReadingTime: avgResult._avg.readingTime || 0,
      popularTags
    };
  }

  /**
   * 格式化Prisma结果为Article类型
   */
  private formatArticle(prismaArticle: any): Article {
    return {
      id: prismaArticle.id,
      title: prismaArticle.title,
      content: prismaArticle.content,
      originalContent: prismaArticle.originalContent,
      translatedContent: prismaArticle.translatedContent,
      difficulty: prismaArticle.difficulty as DifficultyLevel,
      source: prismaArticle.source,
      sourceUrl: prismaArticle.sourceUrl,
      publishDate: prismaArticle.publishDate,
      createdAt: prismaArticle.createdAt,
      updatedAt: prismaArticle.updatedAt,
      readingTime: prismaArticle.readingTime,
      wordCount: prismaArticle.wordCount,
      isPublished: prismaArticle.isPublished,
      tags: JSON.parse(prismaArticle.tags || '[]'),
      hotScore: prismaArticle.hotScore ?? 0
    };
  }

  /**
   * 保存系统设置
   */
  async saveSetting(key: string, value: string): Promise<void> {
    await prisma.settings.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
  }

  /**
   * 获取系统设置
   */
  async getSetting(key: string, defaultValue?: string): Promise<string | null> {
    const setting = await prisma.settings.findUnique({
      where: { key }
    });
    
    return setting?.value || defaultValue || null;
  }

  /**
   * 记录调度日志
   */
  async logScheduleTask(
    taskType: string,
    status: 'success' | 'error' | 'running',
    message?: string,
    newArticles: number = 0,
    duration?: number
  ): Promise<void> {
    await prisma.scheduleLog.create({
      data: {
        taskType,
        status,
        message,
        newArticles,
        duration
      }
    });
  }

  /**
   * 获取调度日志
   */
  async getScheduleLogs(limit: number = 50): Promise<any[]> {
    return prisma.scheduleLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }
}

// 创建全局实例
export const prismaStorage = new PrismaStorage();