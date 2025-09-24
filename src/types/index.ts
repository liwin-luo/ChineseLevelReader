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

// 难度级别详细信息
export interface DifficultyInfo {
  level: DifficultyLevel;
  name: string;
  description: string;
  color: string;
  criteria: {
    vocabularyComplexity: number; // 词汇复杂度 (1-10)
    sentenceLength: number; // 平均句子长度
    grammarComplexity: number; // 语法复杂度 (1-10)
    characterCount: number; // 字符数范围
  };
}

// RSS Feed 接口
export interface RSSFeed {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  content: string;
  guid: string;
}

// 翻译服务接口
export interface TranslationService {
  translate(text: string, fromLang: string, toLang: string): Promise<string>;
}

// 翻译请求
export interface TranslationRequest {
  text: string;
  fromLanguage: 'zh' | 'en';
  toLanguage: 'zh' | 'en';
}

// 翻译响应
export interface TranslationResponse {
  translatedText: string;
  originalText: string;
  fromLanguage: string;
  toLanguage: string;
  confidence: number; // 翻译置信度 (0-1)
}

// 文章分析结果
export interface ArticleAnalysis {
  difficulty: DifficultyLevel;
  readingTime: number;
  wordCount: number;
  characterCount: number;
  sentences: number;
  avgSentenceLength: number;
  vocabularyComplexity: number;
  grammarComplexity: number;
  keywords: string[];
}

// 搜索过滤器
export interface SearchFilters {
  difficulty?: DifficultyLevel;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  source?: string;
  searchTerm?: string;
}

// 分页参数
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: 'publishDate' | 'difficulty' | 'readingTime';
  sortOrder?: 'asc' | 'desc';
}

// 分页响应
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// API 响应基础结构
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 用户偏好设置（未来扩展）
export interface UserPreferences {
  preferredDifficulty: DifficultyLevel;
  language: 'zh' | 'en';
  fontSize: 'small' | 'medium' | 'large';
  theme: 'light' | 'dark' | 'auto';
  showTranslation: boolean;
  showPinyin: boolean; // 是否显示拼音
}

// 阅读进度（未来扩展）
export interface ReadingProgress {
  articleId: string;
  userId?: string;
  progress: number; // 0-100
  lastReadAt: Date;
  completed: boolean;
}

// 统计数据
export interface Statistics {
  totalArticles: number;
  articlesByDifficulty: Record<DifficultyLevel, number>;
  averageReadingTime: number;
  totalReadingTime: number;
  popularTags: Array<{ tag: string; count: number }>;
}