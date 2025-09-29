import { notFound } from 'next/navigation';
import { DifficultyLevel, Article } from '@/types';
import { DIFFICULTY_CONFIG } from '@/constants/difficulty';
import { prismaStorage } from '@/lib/prisma';
import { SEOHelper } from '@/lib/seo';
import Link from 'next/link';
import Script from 'next/script';
import { Metadata } from 'next';
import { formatRelativeTime } from '@/utils/api';
import ArticleActions from '@/components/ArticleActions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import ArticleContent from './ArticleContent';

// ISR: 文章页面每日再验证一次
export const revalidate = 86400;

interface ArticlePageProps {
  params: Promise<{
    id: string;
  }>;
}

// 生成文章详情页SEO元数据
export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const article = await prismaStorage.getArticleById(resolvedParams.id);
  
  if (!article) {
    return {
      title: '文章未找到',
      description: '您访问的文章不存在或已被删除。'
    };
  }

  return SEOHelper.generateArticleMeta(article);
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const resolvedParams = await params;
  const article = await prismaStorage.getArticleById(resolvedParams.id);
  
  if (!article) {
    notFound();
  }

  // 获取相关文章（同难度级别的其他文章）
  const relatedArticles = await prismaStorage.getArticlesByDifficulty(article.difficulty);
  const filteredRelated = relatedArticles
    .filter(a => a.id !== article.id)
    .slice(0, 3);

  // 生成结构化数据
  const articleStructuredData = article ? SEOHelper.generateStructuredData('article', article) : null;
  const breadcrumbs = SEOHelper.generateBreadcrumbs(`/articles/${article?.id || ''}`, article);
  const breadcrumbStructuredData = SEOHelper.generateStructuredData('breadcrumb', breadcrumbs);

  return (
    <>
      {/* 结构化数据 */}
      {articleStructuredData && (
        <Script
          id="article-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(articleStructuredData)
          }}
        />
      )}
      <Script
        id="breadcrumb-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData)
        }}
      />
      
      <div className="min-h-screen bg-gray-50">
        <ArticleContent article={article} filteredRelated={filteredRelated} />
      </div>
    </>
  );
}

// 预渲染部分文章用于 SEO（构建时生成前100篇）
export async function generateStaticParams() {
  try {
    const articles = await prismaStorage.getAllArticles();
    return articles.slice(0, 100).map(a => ({ id: a.id }));
  } catch {
    return [];
  }
}