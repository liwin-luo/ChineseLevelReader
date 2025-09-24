import { notFound } from 'next/navigation';
import { DifficultyLevel } from '@/types';
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
        {/* 页面头部 */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Link href="/" className="text-2xl font-bold text-gray-900 chinese-text hover:text-blue-600 transition-colors">
                  中文分级阅读
                </Link>
                <span className="ml-3 text-sm text-gray-500 english-text">
                  Chinese Level Reader
                </span>
              </div>
              <nav className="flex space-x-6">
                <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
                  首页
                </Link>
                <Link href="/articles" className="text-gray-700 hover:text-blue-600 transition-colors">
                  所有文章
                </Link>
                <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">
                  关于我们
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 面包屑导航 */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-blue-600 transition-colors">首页</Link>
            <span>/</span>
            <Link href="/articles" className="hover:text-blue-600 transition-colors">文章</Link>
            <span>/</span>
            <Link 
              href={`/articles?difficulty=${article.difficulty}`} 
              className="hover:text-blue-600 transition-colors"
            >
              {DIFFICULTY_CONFIG[article.difficulty]?.name || ''}
            </Link>
            <span>/</span>
            <span className="text-gray-900 truncate max-w-xs">{article?.title || ''}</span>
          </nav>

          {/* 文章内容 */}
          <Card>
            {/* 文章头部 */}
            <CardHeader className="border-b px-8 py-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium difficulty-${article.difficulty}`}>
                    {DIFFICULTY_CONFIG[article.difficulty]?.name || ''}
                  </span>
                  <span className="text-sm text-gray-500">
                    {article?.readingTime || 0} 分钟阅读
                  </span>
                  <span className="text-sm text-gray-500">
                    {article?.wordCount || 0} 字
                  </span>
                </div>
                <ArticleActions article={article} />
              </div>
            
              <CardTitle className="text-3xl text-gray-900 mb-4 chinese-text leading-tight">
                {article?.title || ''}
              </CardTitle>
            
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <span>来源：{article?.source || ''}</span>
                <span>发布时间：{formatRelativeTime(article?.publishDate || new Date())}</span>
                <span>更新时间：{formatRelativeTime(article?.updatedAt || new Date())}</span>
              </div>
            
              {/* 标签 */}
              <div className="flex flex-wrap gap-2 mt-4">
                {article.tags?.map((tag) => (
                  <span 
                    key={tag}
                    className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded"
                  >
                    #{tag}
                  </span>
                )) || []}
              </div>
            </CardHeader>

            {/* 文章正文 - 中英文对照 */}
            <CardContent className="px-8 py-6">
              {/* 双语对照内容 */}
              <section className="bilingual">
                <CardTitle className="text-xl text-gray-900 mb-6 chinese-text flex items-center">
                  <span className="w-1 h-6 bg-blue-600 mr-3"></span>
                  中英文对照阅读
                </CardTitle>
                
                {/* 段落对照显示 */}
                <div className="space-y-8">
                  {article?.originalContent && article?.translatedContent && (
                    <div className="border-l-4 border-blue-100 pl-6">
                      {/* 中文段落 */}
                      <div className="mb-4">
                        <div className="flex items-center mb-2">
                          <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                          <span className="text-sm font-medium text-blue-700 chinese-text">中文原文</span>
                        </div>
                        <div className="prose prose-lg max-w-none chinese-text">
                          <p className="text-gray-800 leading-relaxed text-lg whitespace-pre-line">
                            {article.originalContent}
                          </p>
                        </div>
                      </div>
                      
                      {/* 英文翻译 */}
                      <div>
                        <div className="flex items-center mb-2">
                          <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                          <span className="text-sm font-medium text-green-700 english-text">English Translation</span>
                        </div>
                        <div className="prose prose-lg max-w-none english-text">
                          <p className="text-gray-700 leading-relaxed text-lg italic whitespace-pre-line">
                            {article.translatedContent}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* 学习提示 */}
              <section className="mt-8 bg-blue-50 rounded-lg p-6">
                <CardTitle className="text-lg text-blue-900 mb-3 chinese-text flex items-center">
                  💡 学习提示
                </CardTitle>
                <div className="space-y-2 text-sm text-blue-800">
                  <p className="chinese-text">
                    <strong>难度级别：</strong>{DIFFICULTY_CONFIG[article.difficulty]?.description || ''}
                  </p>
                  <p className="chinese-text">
                    <strong>建议学习方法：</strong>
                    {article?.difficulty === DifficultyLevel.SIMPLE && '先读中文，遇到不懂的地方再参考英文翻译。重点关注常用词汇和基本句型。'}
                    {article?.difficulty === DifficultyLevel.MEDIUM && '尝试先理解中文大意，然后对比英文翻译，注意语法结构和表达方式的差异。'}
                    {article?.difficulty === DifficultyLevel.HARD && '建议多次阅读，深入理解复杂的语法结构和专业词汇，可以做笔记记录重要表达。'}
                  </p>
                  <p className="chinese-text">
                    <strong>预计用时：</strong>{article?.readingTime || 0} 分钟（包括理解和对比翻译的时间）
                  </p>
                </div>
              </section>
            </CardContent>

            {/* 文章底部 */}
            <CardFooter className="px-8 py-6 border-t bg-gray-50">
              <div className="flex items-center justify-between w-full">
                <div className="text-sm text-gray-500">
                  <p>原文链接：<a href={article?.sourceUrl || '#'} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{article?.sourceUrl || ''}</a></p>
                </div>
                <div className="flex space-x-4">
                  <Button asChild>
                    <Link href={`/articles?difficulty=${article.difficulty}`}>
                      更多{DIFFICULTY_CONFIG[article.difficulty]?.name || ''}文章
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/articles">
                      返回文章列表
                    </Link>
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>

          {/* 相关文章推荐 */}
          {filteredRelated.length > 0 && (
            <section className="mt-12">
              <CardTitle className="text-2xl text-gray-900 mb-6 chinese-text">
                相关{DIFFICULTY_CONFIG[article.difficulty]?.name || ''}文章
              </CardTitle>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredRelated.map((related) => (
                  <Card key={related.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium difficulty-${related.difficulty}`}>
                          {DIFFICULTY_CONFIG[related.difficulty]?.name || ''}
                        </span>
                        <span className="text-xs text-gray-500">
                          {related?.readingTime || 0} 分钟
                        </span>
                      </div>
                      <CardTitle className="text-lg text-gray-900 mb-2 chinese-text line-clamp-2">
                        {related?.title || ''}
                      </CardTitle>
                      <CardDescription className="text-gray-600 text-sm line-clamp-3 chinese-text">
                        {related?.content?.substring(0, 100) || ''}...
                      </CardDescription>
                      <div className="mt-4 text-xs text-gray-500">
                        {formatRelativeTime(related?.publishDate || new Date())}
                      </div>
                    </CardContent>
                    <CardFooter className="p-0 px-6 pb-6">
                      <Button asChild variant="outline" className="w-full">
                        <Link href={`/articles/${related.id}`}>
                          阅读全文
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </main>
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