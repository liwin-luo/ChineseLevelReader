import { DifficultyLevel } from '@/types';
import { DIFFICULTY_CONFIG } from '@/constants/difficulty';
import { prismaStorage } from '@/lib/prisma';
import { SEOHelper } from '@/lib/seo';
import Link from 'next/link';
import Script from 'next/script';
import { Metadata } from 'next';
import { Suspense } from 'react';
import ArticlesSkeletonComponent from '@/components/ArticlesSkeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

// ISR：列表页每日再验证
export const revalidate = 86400;

interface ArticlesPageProps {
  searchParams: Promise<{
    difficulty?: string;
    page?: string;
    search?: string;
    tag?: string;
  }>;
}

// 生成文章列表页SEO元数据
export async function generateMetadata({ searchParams }: ArticlesPageProps): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const difficulty = resolvedSearchParams.difficulty as DifficultyLevel | undefined;
  const searchTerm = resolvedSearchParams.search;
  return SEOHelper.generateArticlesListMeta(difficulty, searchTerm);
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  try {
    const resolvedSearchParams = await searchParams;
    const currentPage = parseInt(resolvedSearchParams.page || '1');
    const difficulty = resolvedSearchParams.difficulty as DifficultyLevel | undefined;
    const searchTerm = resolvedSearchParams.search;
    const tag = resolvedSearchParams.tag;
    
    const paginatedResult = await prismaStorage.getPaginatedArticles(
      currentPage,
      12,
      'publishDate',
      'desc',
      {
        difficulty,
        searchTerm,
        ...(tag ? { tags: [tag] } : {})
      }
    );

    const stats = await prismaStorage.getStatistics();

  // 生成结构化数据
    const breadcrumbs = SEOHelper.generateBreadcrumbs('/articles');
  const breadcrumbStructuredData = SEOHelper.generateStructuredData('breadcrumb', breadcrumbs);

  return (
    <>
      {/* 结构化数据 */}
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
                <Link href="/articles" className="text-blue-600 font-medium">
                  所有文章
                </Link>
                <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">
                  关于我们
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 页面标题和统计 */}
          <div className="mb-8">
            <div className="bilingual">
              <h1 className="text-3xl font-bold text-gray-900 mb-1 chinese-text">
                {difficulty ? `${DIFFICULTY_CONFIG[difficulty].name}级别文章` : '所有文章'}
              </h1>
              <h1 className="text-2xl font-semibold text-gray-900 mb-4 english-text">
                {difficulty ? `${DIFFICULTY_CONFIG[difficulty].name} Articles` : 'All Articles'}
              </h1>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <span>共 {paginatedResult.total} 篇文章</span>
              <span>第 {paginatedResult.page} 页，共 {paginatedResult.totalPages} 页</span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* 侧边栏筛选 */}
            <aside className="lg:w-64 flex-shrink-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900 chinese-text">筛选文章</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* 难度级别筛选 */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 chinese-text">难度级别</h4>
                    <div className="space-y-2">
                      <Button 
                        asChild
                        variant={!difficulty ? "default" : "outline"}
                        className="w-full justify-start"
                      >
                        <Link href="/articles">
                          全部级别
                        </Link>
                      </Button>
                      {Object.values(DifficultyLevel).map((level) => (
                        <Button
                          key={level}
                          asChild
                          variant={difficulty === level ? "default" : "outline"}
                          className="w-full justify-start"
                        >
                          <Link href={`/articles?difficulty=${level}`}>
                            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                              level === DifficultyLevel.SIMPLE ? 'bg-green-500' :
                              level === DifficultyLevel.MEDIUM ? 'bg-yellow-500' : 'bg-red-500'
                            }`}></span>
                            {DIFFICULTY_CONFIG[level].name} ({stats.articlesByDifficulty[level]})
                          </Link>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* 搜索框 */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3 chinese-text">搜索文章</h4>
                    <form method="GET" action="/articles">
                      {difficulty && (
                        <input type="hidden" name="difficulty" value={difficulty} />
                      )}
                      <div className="flex">
                        <Input
                          type="text"
                          name="search"
                          defaultValue={searchTerm || ''}
                          placeholder="输入关键词..."
                          className="flex-1 rounded-r-none"
                        />
                        <Button
                          type="submit"
                          className="rounded-l-none"
                        >
                          搜索
                        </Button>
                      </div>
                    </form>
                  </div>
                </CardContent>
              </Card>

              {/* 热门标签 */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900 chinese-text">热门标签</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {stats.popularTags.slice(0, 8).map((t) => (
                      <Link
                        key={t.tag}
                        href={`/articles?${new URLSearchParams({
                          ...(difficulty && { difficulty }),
                          ...(searchTerm && { search: searchTerm }),
                          tag: t.tag
                        }).toString()}`}
                        className={`px-2 py-1 rounded-full text-xs ${tag === t.tag ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      >
                        {t.tag} ({t.count})
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </aside>

            {/* 文章列表 */}
            <div className="flex-1">
              <Suspense fallback={<ArticlesSkeletonComponent />}>
                {paginatedResult.articles.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {paginatedResult.articles.map((article) => (
                        <Card key={article.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            {/* 文章头部信息 */}
                            <div className="flex items-center justify-between mb-3">
                              <span className={`px-2 py-1 rounded text-xs font-medium difficulty-${article.difficulty}`}>
                                {DIFFICULTY_CONFIG[article.difficulty].name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {article.readingTime} 分钟阅读
                              </span>
                            </div>

                            {/* 文章标题 - 中英文双语 */}
                            <div className="mb-3">
                              <CardTitle className="text-lg text-gray-900 mb-2 chinese-text line-clamp-2">
                                {article.title}
                              </CardTitle>
                              <CardTitle className="text-base text-gray-600 english-text line-clamp-2 italic">
                                {article.title}
                              </CardTitle>
                            </div>

                            {/* 文章摘要 - 中英文双语 */}
                            <div className="mb-4">
                              <CardDescription className="text-gray-600 text-sm mb-2 line-clamp-2 chinese-text">
                                {article.originalContent.substring(0, 80)}...
                              </CardDescription>
                              <CardDescription className="text-gray-500 text-xs line-clamp-2 english-text italic">
                                {article.translatedContent.substring(0, 100)}...
                              </CardDescription>
                            </div>

                            {/* 文章标签（可点击过滤） */}
                            <div className="flex flex-wrap gap-1 mb-4">
                              {article.tags.slice(0, 3).map((t) => (
                                <Link 
                                  key={t}
                                  href={`/articles?${new URLSearchParams({
                                    ...(difficulty && { difficulty }),
                                    ...(searchTerm && { search: searchTerm }),
                                    tag: t
                                  }).toString()}`}
                                  className={`px-2 py-1 rounded text-xs ${tag === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                  {t}
                                </Link>
                              ))}
                            </div>

                            {/* 文章底部信息 */}
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{article.source}</span>
                              <span>{new Date(article.publishDate).toLocaleDateString('zh-CN')}</span>
                            </div>
                          </CardContent>
                          <CardFooter className="p-0 px-6 pb-6">
                            <Button asChild variant="outline" className="w-full">
                              <Link href={`/articles/${article.id}`}>
                                阅读全文
                              </Link>
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>

                    {/* 分页 */}
                    {paginatedResult.totalPages > 1 && (
                      <div className="mt-12 flex justify-center">
                        <nav className="flex items-center space-x-2">
                          {paginatedResult.hasPrev && (
                            <Button asChild variant="outline">
                              <Link
                                href={`/articles?${new URLSearchParams({
                                  ...(difficulty && { difficulty }),
                                  ...(searchTerm && { search: searchTerm }),
                                  page: String(paginatedResult.page - 1)
                                }).toString()}`}
                              >
                                上一页
                              </Link>
                            </Button>
                          )}
                          
                          {Array.from({ length: Math.min(5, paginatedResult.totalPages) }, (_, i) => {
                            const pageNum = Math.max(1, paginatedResult.page - 2) + i;
                            if (pageNum > paginatedResult.totalPages) return null;
                            
                            return (
                              <Button
                                key={pageNum}
                                asChild
                                variant={pageNum === paginatedResult.page ? "default" : "outline"}
                              >
                                <Link
                                  href={`/articles?${new URLSearchParams({
                                    ...(difficulty && { difficulty }),
                                    ...(searchTerm && { search: searchTerm }),
                                    page: String(pageNum)
                                  }).toString()}`}
                                >
                                  {pageNum}
                                </Link>
                              </Button>
                            );
                          })}
                          
                          {paginatedResult.hasNext && (
                            <Button asChild variant="outline">
                              <Link
                                href={`/articles?${new URLSearchParams({
                                  ...(difficulty && { difficulty }),
                                  ...(searchTerm && { search: searchTerm }),
                                  page: String(paginatedResult.page + 1)
                                }).toString()}`}
                              >
                                下一页
                              </Link>
                            </Button>
                          )}
                        </nav>
                      </div>
                    )}
                  </>
                ) : (
                  <Card>
                    <CardContent className="text-center py-12">
                      <div className="text-gray-400 text-6xl mb-4">📄</div>
                      <CardTitle className="text-lg text-gray-900 mb-2 chinese-text">没有找到文章</CardTitle>
                      <CardDescription className="text-gray-500 chinese-text">请尝试调整筛选条件或搜索关键词</CardDescription>
                      <Button asChild className="mt-4">
                        <Link href="/articles">
                          查看所有文章
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </Suspense>
            </div>
          </div>
        </main>
      </div>
    </>
  );
  } catch (error) {
    console.error('Articles page render error:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2 chinese-text">加载文章失败</h1>
          <p className="text-gray-600 chinese-text mb-6">服务器暂时不可用，请稍后重试。</p>
          <a href="/" className="text-blue-600 hover:underline">返回首页</a>
        </div>
      </div>
    );
  }
}

// 加载骨架屏组件
function ArticlesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm p-6">
          <div className="animate-pulse">
            <div className="flex justify-between mb-3">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded mb-3"></div>
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
            <div className="flex space-x-2 mb-4">
              <div className="h-6 bg-gray-200 rounded w-12"></div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}