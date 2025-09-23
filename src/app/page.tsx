import { DifficultyLevel } from '@/types';
import { DIFFICULTY_CONFIG } from '@/constants/difficulty';
import { prismaStorage } from '@/lib/prisma';
import { initializeSampleData } from '@/lib/initSampleData';
import { SEOHelper } from '@/lib/seo';
import Link from 'next/link';
import Script from 'next/script';
import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// ISR：首页每日再验证
export const revalidate = 86400;

// 生成首页SEO元数据
export async function generateMetadata(): Promise<Metadata> {
  return SEOHelper.generateHomeMeta();
}

// 首页组件
export default async function Home() {
  // 初始化示例数据（仅在开发阶段）
  await initializeSampleData();
  
  // 获取各难度级别的文章
  const [simpleArticles, mediumArticles, hardArticles] = await Promise.all([
    prismaStorage.getArticlesByDifficulty(DifficultyLevel.SIMPLE),
    prismaStorage.getArticlesByDifficulty(DifficultyLevel.MEDIUM),
    prismaStorage.getArticlesByDifficulty(DifficultyLevel.HARD)
  ]);

  const stats = await prismaStorage.getStatistics();

  // 生成网站结构化数据
  const websiteStructuredData = SEOHelper.generateStructuredData('website');

  return (
    <>
      {/* 结构化数据 */}
      <Script
        id="website-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteStructuredData)
        }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* 页面头部 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 chinese-text">
                中文分级阅读
              </h1>
              <span className="ml-3 text-sm text-gray-500 english-text">
                Chinese Level Reader
              </span>
            </div>
            <nav className="flex space-x-6">
              <Link href="/articles" className="text-gray-700 hover:text-blue-600 transition-colors">
                所有文章
              </Link>
              <Link href="/bookmarks" className="text-gray-700 hover:text-blue-600 transition-colors">
                我的收藏
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">
                关于我们
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 欢迎区域（中英双语受控） */}
        <section className="text-center mb-16 bilingual">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 chinese-text">
            欢迎来到中文分级阅读
          </h2>
          <p className="text-xl text-gray-600 mb-6 english-text">
            Welcome to Chinese Level Reader
          </p>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-8 chinese-text">
            为英语母语者设计的中文学习平台，通过分级阅读帮助您循序渐进地提高中文水平。
            每篇文章都配有英文翻译，让您在阅读中文的同时理解内容含义。
          </p>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-8 english-text">
            A Chinese learning platform designed for English speakers. Graded reading with English translations helps you progress step by step.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-blue-600">{stats.totalArticles}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 chinese-text">篇文章</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-green-600">{Math.round(stats.averageReadingTime)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 chinese-text">分钟平均阅读</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-purple-600">{stats.popularTags.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 chinese-text">个主题分类</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 难度级别介绍 */}
        <section className="mb-16">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12 chinese-text">
            三个难度级别
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Object.values(DIFFICULTY_CONFIG).map((config) => {
              const articles = config.level === DifficultyLevel.SIMPLE ? simpleArticles :
                              config.level === DifficultyLevel.MEDIUM ? mediumArticles : hardArticles;
              
              return (
                <Card key={config.level} className="hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4 difficulty-${config.level}`}>
                      {config.name}
                    </div>
                    <CardTitle className="text-xl text-gray-900 mb-3 chinese-text">
                      {config.level === DifficultyLevel.SIMPLE ? '适合初学者' :
                       config.level === DifficultyLevel.MEDIUM ? '适合中级学习者' : '适合高级学习者'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 mb-6 chinese-text">
                      {config.description}
                    </CardDescription>
                    <div className="space-y-2 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">文章数量</span>
                        <span className="font-medium">{articles.length} 篇</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">平均字数</span>
                        <span className="font-medium">{config.criteria.characterCount} 字</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">词汇难度</span>
                        <span className="font-medium">{config.criteria.vocabularyComplexity}/10</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      asChild
                      className={`w-full ${
                        config.level === DifficultyLevel.SIMPLE ? 'bg-green-600 hover:bg-green-700' :
                        config.level === DifficultyLevel.MEDIUM ? 'bg-yellow-600 hover:bg-yellow-700' :
                        'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      <Link href={`/articles?difficulty=${config.level}`}>
                        开始阅读
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </section>

        {/* 最新文章预览 */}
        <section>
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 chinese-text">最新文章</h3>
            <Button asChild variant="link">
              <Link href="/articles">
                查看全部 →
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...simpleArticles, ...mediumArticles, ...hardArticles]
              .sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime())
              .slice(0, 6)
              .map((article) => (
                <Card key={article.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium difficulty-${article.difficulty}`}>
                        {DIFFICULTY_CONFIG[article.difficulty].name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {article.readingTime} 分钟阅读
                      </span>
                    </div>
                    <CardTitle className="text-lg text-gray-900 mb-2 chinese-text line-clamp-2">
                      {article.title}
                    </CardTitle>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 chinese-text">
                      {article.content.substring(0, 100)}...
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{article.source}</span>
                      <span>{new Date(article.publishDate).toLocaleDateString('zh-CN')}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            }
          </div>
        </section>
      </main>

      {/* 页脚 */}
      <footer className="bg-gray-800 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h5 className="text-lg font-semibold mb-4 chinese-text">中文分级阅读</h5>
              <p className="text-gray-300 chinese-text">
                帮助英语母语者通过分级阅读学习中文
              </p>
            </div>
            <div>
              <h5 className="text-lg font-semibold mb-4 chinese-text">快速链接</h5>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/articles" className="hover:text-white transition-colors">所有文章</Link></li>
                <li><Link href="/articles?difficulty=simple" className="hover:text-white transition-colors">简单级别</Link></li>
                <li><Link href="/articles?difficulty=medium" className="hover:text-white transition-colors">中等级别</Link></li>
                <li><Link href="/articles?difficulty=hard" className="hover:text-white transition-colors">困难级别</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">关于我们</Link></li>
                <li><Link href="/bookmarks" className="hover:text-white transition-colors">我的收藏</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="text-lg font-semibold mb-4 chinese-text">关于</h5>
              <p className="text-gray-300 text-sm chinese-text">
                本网站每日更新来自极客公园的科技新闻，
                通过AI翻译和智能分级，为中文学习者提供优质内容。
              </p>
              <div className="mt-4 space-x-4 text-sm">
                <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors">隐私政策</Link>
                <Link href="/terms" className="text-gray-300 hover:text-white transition-colors">使用条款</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 中文分级阅读. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}