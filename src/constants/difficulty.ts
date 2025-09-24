import { DifficultyLevel, DifficultyInfo } from '@/types';

// 难度级别配置
export const DIFFICULTY_CONFIG: Record<DifficultyLevel, DifficultyInfo> = {
  [DifficultyLevel.SIMPLE]: {
    level: DifficultyLevel.SIMPLE,
    name: '简单',
    description: '适合中文初学者，使用常用词汇和简单句式',
    color: 'green',
    criteria: {
      vocabularyComplexity: 3, // 1-3 常用词汇
      sentenceLength: 15, // 平均15个字符
      grammarComplexity: 2, // 简单语法
      characterCount: 500 // 大约500字符
    }
  },
  [DifficultyLevel.EASY]: {
    level: DifficultyLevel.EASY,
    name: '容易',
    description: '适合有一定基础的学习者，词汇和语法相对简单',
    color: 'lightgreen',
    criteria: {
      vocabularyComplexity: 4, // 2-4 基础词汇
      sentenceLength: 20, // 平均20个字符
      grammarComplexity: 3, // 基础语法
      characterCount: 600 // 大约600字符
    }
  },
  [DifficultyLevel.MEDIUM]: {
    level: DifficultyLevel.MEDIUM,
    name: '中等',
    description: '适合有一定中文基础的学习者，包含成语和复合句',
    color: 'yellow',
    criteria: {
      vocabularyComplexity: 6, // 4-6 中等词汇
      sentenceLength: 25, // 平均25个字符
      grammarComplexity: 5, // 中等语法
      characterCount: 800 // 大约800字符
    }
  },
  [DifficultyLevel.HARD]: {
    level: DifficultyLevel.HARD,
    name: '困难',
    description: '适合高级学习者，包含专业术语和复杂语法结构',
    color: 'red',
    criteria: {
      vocabularyComplexity: 9, // 7-10 高级词汇
      sentenceLength: 35, // 平均35个字符
      grammarComplexity: 8, // 复杂语法
      characterCount: 1200 // 大约1200字符
    }
  }
};

// 获取难度级别信息
export const getDifficultyInfo = (level: DifficultyLevel): DifficultyInfo => {
  return DIFFICULTY_CONFIG[level];
};

// 获取所有难度级别
export const getAllDifficultyLevels = (): DifficultyLevel[] => {
  return Object.values(DifficultyLevel);
};

// 难度级别排序
export const DIFFICULTY_ORDER = [
  DifficultyLevel.SIMPLE,
  DifficultyLevel.EASY,
  DifficultyLevel.MEDIUM,
  DifficultyLevel.HARD
];

// 获取难度级别的数字表示（用于排序）
export const getDifficultyOrder = (level: DifficultyLevel): number => {
  return DIFFICULTY_ORDER.indexOf(level);
};

// 根据文章分析结果确定难度级别
export const calculateDifficulty = (analysis: {
  vocabularyComplexity: number;
  avgSentenceLength: number;
  grammarComplexity: number;
  characterCount: number;
}): DifficultyLevel => {
  const { vocabularyComplexity, avgSentenceLength, grammarComplexity, characterCount } = analysis;
  
  // 计算综合分数 (0-10)
  const vocabularyScore = Math.min(vocabularyComplexity, 10);
  const lengthScore = Math.min(avgSentenceLength / 5, 10); // 标准化句子长度
  const grammarScore = Math.min(grammarComplexity, 10);
  const sizeScore = Math.min(characterCount / 200, 10); // 标准化字符数
  
  const totalScore = (vocabularyScore + lengthScore + grammarScore + sizeScore) / 4;
  
  if (totalScore <= 3.5) {
    return DifficultyLevel.SIMPLE;
  } else if (totalScore <= 6.5) {
    return DifficultyLevel.MEDIUM;
  } else {
    return DifficultyLevel.HARD;
  }
};

// 默认搜索过滤器
export const DEFAULT_FILTERS = {
  page: 1,
  limit: 12,
  sortBy: 'publishDate' as const,
  sortOrder: 'desc' as const
};

// 常用标签
export const COMMON_TAGS = [
  '科技',
  '新闻',
  '文化',
  '教育',
  '健康',
  '娱乐',
  '体育',
  '财经',
  '政治',
  '社会'
];

// RSS 源配置
export const RSS_SOURCES = [
  {
    name: 'GeekPark',
    url: 'https://www.geekpark.net/rss',
    description: '极客公园 - 科技新闻',
    category: '科技'
  }
  // 可以添加更多RSS源
];