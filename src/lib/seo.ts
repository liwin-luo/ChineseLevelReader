import { Article, DifficultyLevel } from '@/types';
import { DIFFICULTY_CONFIG } from '@/constants/difficulty';

// SEO工具类
export class SEOHelper {
  private static readonly SITE_NAME = '中文分级阅读 - Chinese Level Reader';
  private static readonly SITE_DESCRIPTION = '专为英语母语者设计的中文分级阅读平台，通过AI智能分级和双语对照，帮助您循序渐进地提高中文水平。每日更新科技新闻，支持三个难度级别。';
  private static readonly SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://chinese-level-reader.com';
  private static readonly SITE_KEYWORDS = [
    '中文学习', 'Chinese learning', '中文分级阅读', 'Chinese graded reading',
    '双语阅读', 'bilingual reading', 'HSK', '中文新闻', 'Chinese news',
    '英语学习中文', 'English to Chinese', '科技新闻', 'tech news',
    '人工智能翻译', 'AI translation', '中文练习', 'Chinese practice'
  ];

  /**
   * 生成基础SEO元数据
   */
  static generateBasicMeta({
    title,
    description,
    keywords = [],
    path = '',
    image
  }: {
    title: string;
    description: string;
    keywords?: string[];
    path?: string;
    image?: string;
  }) {
    const fullTitle = title === this.SITE_NAME ? title : `${title} - ${this.SITE_NAME}`;
    const fullUrl = `${this.SITE_URL}${path}`;
    const allKeywords = [...this.SITE_KEYWORDS, ...keywords].join(', ');
    const ogImage = image || `${this.SITE_URL}/og-image.jpg`;

    return {
      title: fullTitle,
      description,
      keywords: allKeywords,
      canonical: fullUrl,
      openGraph: {
        title: fullTitle,
        description,
        url: fullUrl,
        siteName: this.SITE_NAME,
        images: [{
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title
        }],
        locale: 'zh_CN',
        alternateLocale: 'en_US',
        type: 'website'
      },
      twitter: {
        card: 'summary_large_image',
        title: fullTitle,
        description,
        images: [ogImage],
        creator: '@ChineseLevelReader'
      },
      alternates: {
        canonical: fullUrl,
        languages: {
          'zh-CN': fullUrl,
          'en-US': fullUrl
        }
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large' as const,
          'max-snippet': -1
        }
      }
    };
  }

  /**
   * 生成首页SEO元数据
   */
  static generateHomeMeta() {
    return this.generateBasicMeta({
      title: this.SITE_NAME,
      description: this.SITE_DESCRIPTION,
      keywords: ['中文分级阅读首页', '中文学习平台', 'Chinese learning platform']
    });
  }

  /**
   * 生成文章列表页SEO元数据
   */
  static generateArticlesListMeta(difficulty?: DifficultyLevel, searchTerm?: string) {
    let title = '所有文章';
    let description = '浏览所有中文分级阅读文章，包含简单、中等、困难三个级别，帮助不同水平的学习者提高中文能力。';
    let keywords = ['中文文章列表', '分级阅读文章', 'Chinese articles'];

    if (difficulty) {
      const difficultyInfo = DIFFICULTY_CONFIG[difficulty];
      title = `${difficultyInfo.name}级别文章`;
      description = `${difficultyInfo.name}级别的中文文章列表，${difficultyInfo.description}。通过阅读这些文章提高您的中文水平。`;
      keywords.push(`${difficultyInfo.name}级别`, `${difficulty} level Chinese`);
    }

    if (searchTerm) {
      title = `搜索：${searchTerm}`;
      description = `搜索"${searchTerm}"相关的中文分级阅读文章，包含双语对照和学习提示。`;
      keywords.push(searchTerm, `${searchTerm} 中文文章`);
    }

    return this.generateBasicMeta({
      title,
      description,
      keywords,
      path: '/articles'
    });
  }

  /**
   * 生成文章详情页SEO元数据
   */
  static generateArticleMeta(article: Article) {
    const difficultyInfo = DIFFICULTY_CONFIG[article.difficulty];
    const title = article.title;
    const description = `${difficultyInfo.name}级别中文文章：${article.content.substring(0, 150)}... 包含英文翻译和学习提示，阅读时间约${article.readingTime}分钟。`;
    
    const keywords = [
      ...article.tags,
      `${difficultyInfo.name}级别`,
      `${article.difficulty} level`,
      '中英文对照',
      'bilingual reading',
      article.source
    ];

    return this.generateBasicMeta({
      title,
      description,
      keywords,
      path: `/articles/${article.id}`
    });
  }

  /**
   * 生成结构化数据 (JSON-LD)
   */
  static generateStructuredData(type: 'website' | 'article' | 'breadcrumb', data?: any) {
    const baseStructure = {
      '@context': 'https://schema.org',
      '@type': type === 'website' ? 'WebSite' : type === 'article' ? 'Article' : 'BreadcrumbList'
    };

    switch (type) {
      case 'website':
        return {
          ...baseStructure,
          name: this.SITE_NAME,
          description: this.SITE_DESCRIPTION,
          url: this.SITE_URL,
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${this.SITE_URL}/articles?search={search_term_string}`
            },
            'query-input': 'required name=search_term_string'
          },
          publisher: {
            '@type': 'Organization',
            name: this.SITE_NAME,
            url: this.SITE_URL
          },
          inLanguage: ['zh-CN', 'en-US']
        };

      case 'article':
        if (!data) return null;
        const article = data as Article;
        if (!article) return null;
        return {
          ...baseStructure,
          headline: article.title || '',
          description: article.content?.substring(0, 200) || '',
          author: {
            '@type': 'Organization',
            name: article.source || ''
          },
          publisher: {
            '@type': 'Organization',
            name: this.SITE_NAME,
            url: this.SITE_URL
          },
          datePublished: article.publishDate?.toISOString() || new Date().toISOString(),
          dateModified: article.updatedAt?.toISOString() || new Date().toISOString(),
          url: `${this.SITE_URL}/articles/${article.id || ''}`,
          mainEntityOfPage: `${this.SITE_URL}/articles/${article.id || ''}`,
          inLanguage: 'zh-CN',
          articleSection: DIFFICULTY_CONFIG[article.difficulty]?.name || '',
          keywords: article.tags?.join(', ') || '',
          wordCount: article.wordCount || 0,
          timeRequired: `PT${article.readingTime || 0}M`,
          educationalLevel: article.difficulty || 'simple',
          learningResourceType: 'Reading Material',
          audience: {
            '@type': 'EducationalAudience',
            educationalRole: 'student'
          }
        };

      case 'breadcrumb':
        if (!data) return null;
        return {
          ...baseStructure,
          itemListElement: data.map((item: any, index: number) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name || '',
            item: item.url || ''
          }))
        };

      default:
        return null;
    }
  }

  /**
   * 生成sitemap数据
   */
  static generateSitemapUrls(articles: Article[]) {
    const baseUrls = [
      {
        url: this.SITE_URL,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1.0
      },
      {
        url: `${this.SITE_URL}/articles`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9
      },
      {
        url: `${this.SITE_URL}/articles?difficulty=simple`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8
      },
      {
        url: `${this.SITE_URL}/articles?difficulty=medium`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8
      },
      {
        url: `${this.SITE_URL}/articles?difficulty=hard`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8
      }
    ];

    const articleUrls = articles.map(article => ({
      url: `${this.SITE_URL}/articles/${article.id || ''}`,
      lastModified: article.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7
    }));

    return [...baseUrls, ...articleUrls];
  }

  /**
   * 清理HTML内容用于SEO
   */
  static cleanHtmlForSEO(html: string): string {
    return html
      .replace(/<[^>]*>/g, '') // 移除HTML标签
      .replace(/\s+/g, ' ') // 合并空格
      .replace(/&[a-zA-Z0-9#]+;/g, '') // 移除HTML实体
      .trim()
      .substring(0, 160); // 限制长度适合meta description
  }

  /**
   * 生成面包屑导航
   */
  static generateBreadcrumbs(path: string, article?: Article): Array<{name: string, url: string}> {
    const breadcrumbs = [{ name: '首页', url: this.SITE_URL }];

    if (path.startsWith('/articles')) {
      breadcrumbs.push({ name: '文章列表', url: `${this.SITE_URL}/articles` });
      
      if (article) {
        const difficultyInfo = DIFFICULTY_CONFIG[article.difficulty];
        breadcrumbs.push({ 
          name: `${difficultyInfo?.name || ''}级别`, 
          url: `${this.SITE_URL}/articles?difficulty=${article.difficulty || ''}` 
        });
        breadcrumbs.push({ 
          name: article.title || '', 
          url: `${this.SITE_URL}/articles/${article.id || ''}` 
        });
      }
    }

    return breadcrumbs;
  }
}