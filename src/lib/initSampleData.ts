import { prismaStorage } from '@/lib/prisma';
import { DifficultyLevel } from '@/types';

// 初始化示例数据
export async function initializeSampleData(): Promise<void> {
  // 检查是否已有数据
  const existingArticles = await prismaStorage.getAllArticles();
  if (existingArticles.length > 0) {
    console.log('Sample data already exists, skipping initialization');
    return;
  }

  const now = Date.now();
  const difficulties = [
    DifficultyLevel.EASY,
    DifficultyLevel.MEDIUM,
    DifficultyLevel.HARD
  ];

  const makeArticle = (i: number) => {
    const difficulty = difficulties[i % difficulties.length];
    const baseTitle = difficulty === DifficultyLevel.EASY
      ? '基础中文阅读'
      : difficulty === DifficultyLevel.MEDIUM
      ? '科技与社会观察'
      : '深度技术与趋势分析';
    const zh = difficulty === DifficultyLevel.EASY
      ? `第${i}篇：这是为初学者准备的短文，内容简单易懂，包含常用词汇与基本句式，便于快速阅读与理解。`
      : difficulty === DifficultyLevel.MEDIUM
      ? `第${i}篇：本文围绕当下科技与社会的联系展开，包含一定数量的复合句与常见成语表达，以提升阅读理解能力。`
      : `第${i}篇：本文从系统角度讨论前沿技术与产业趋势，涉及专业术语与较复杂的语法结构，适合进阶读者研读。`;
    const en = difficulty === DifficultyLevel.EASY
      ? `No.${i}: This is a short passage for beginners with common words and simple sentences for quick reading.`
      : difficulty === DifficultyLevel.MEDIUM
      ? `No.${i}: This article discusses the relationship between technology and society, using some compound sentences and idiomatic expressions.`
      : `No.${i}: This article analyzes cutting-edge technologies and industry trends with technical terms and complex structures for advanced readers.`;

    const characterCount = zh.length;
    const readingTime = Math.max(1, Math.round(characterCount / 250));

    return {
      title: `${baseTitle} ${i}`,
      content: zh,
      originalContent: zh,
      translatedContent: en,
      difficulty,
      source: '示例数据',
      sourceUrl: `https://example.com/sample-${i}`,
      publishDate: new Date(now - i * 24 * 60 * 60 * 1000),
      tags: difficulty === DifficultyLevel.EASY
        ? ['教育', '中文']
        : difficulty === DifficultyLevel.MEDIUM
        ? ['科技', '社会']
        : ['技术', '趋势', '研究'],
      readingTime,
      wordCount: characterCount,
      isPublished: true
    };
  };

  const total = 20;
  for (let i = 1; i <= total; i++) {
    const articleData = makeArticle(i);
    try {
      await prismaStorage.createArticle(articleData);
      console.log(`Created sample article: ${articleData.title}`);
    } catch (error) {
      console.error(`Failed to create article: ${articleData.title}`, error);
    }
  }

  console.log(`Sample data initialization completed with ${total} articles`);
}