import Link from 'next/link';
import { Metadata } from 'next';
import { SEOHelper } from '@/lib/seo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export async function generateMetadata(): Promise<Metadata> {
  return SEOHelper.generateBasicMeta({
    title: '关于我们',
    description: '中文分级阅读：为英语母语者提供清新、分级的中文阅读体验，每日更新科技新闻并提供英文对照。',
    path: '/about'
  });
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="text-2xl font-bold text-gray-900 chinese-text hover:text-blue-600 transition-colors">
              中文分级阅读
            </Link>
            <nav className="flex space-x-6">
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">首页</Link>
              <Link href="/articles" className="text-gray-700 hover:text-blue-600 transition-colors">文章</Link>
              <span className="text-blue-600 font-medium">关于我们</span>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl text-gray-900 chinese-text">我们的使命</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 leading-7 chinese-text">
                <p>
                  中文分级阅读（Chinese Level Reader）致力于帮助英语母语者通过“可理解输入”的方式高效学习中文。
                  我们每日从权威科技媒体获取最新的中文资讯，结合 AI 翻译与智能难度分级，提供简单/中等/困难三档内容，
                  让不同水平的学习者都能持续输入、稳步进阶。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900 chinese-text">我们如何分级</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 chinese-text space-y-3">
                <p>
                  我们的难度算法综合考虑：词汇复杂度（含专业术语密度）、平均句长、语法复杂度（从句/被动/转折等）与文本长度，
                  计算综合分，自动归类为“简单/中等/困难”，并给出预计阅读时间与字数统计。
                </p>
                <p>
                  同时，页面提供中文原文与英文对照，便于理解与比对学习。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900 chinese-text">内容来源与更新</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 chinese-text space-y-3">
                <p>
                  主要 RSS 来源：极客公园（GeekPark）。系统每日自动同步最新内容，并在发布前进行基础清洗与分级处理。
                </p>
                <p>
                  如果您是版权所有者，对收录有异议，请联系我们，我们将及时处理。
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-gray-900 chinese-text">联系我们</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 chinese-text space-y-2 text-sm">
                <p>邮箱：support@example.com</p>
                <p>Twitter：@ChineseLevelReader</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-gray-900 chinese-text">开源与贡献</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 chinese-text space-y-2 text-sm">
                <p>本项目基于 Next.js + TypeScript + Tailwind CSS 构建，欢迎 Issue 与 PR。</p>
                <p>建议或反馈：欢迎通过邮件或社媒联系我们。</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}


