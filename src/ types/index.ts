// 难度级别枚举
export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

// 文章接口
export interface Article {
  id: string;
  title: string;
  content: string;
  originalContent: string; // 中文原文
  translatedContent: string; // 英文翻译
  difficulty: DifficultyLevel;
  source: string;
  sourceUrl: string;
  publishDate: Date;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  readingTime: number; // 预估阅读时间（分钟）
  wordCount: number; // 字数统计
  isPublished: boolean;
}
