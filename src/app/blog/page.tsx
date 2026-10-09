import type { Metadata } from 'next';
import Link from 'next/link';
import { blogPosts } from '@/content/blog';

// ISR: 博客列表页每日再验证一次
export const revalidate = 86400;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://chinese-level-reader.vercel.app';

export const metadata: Metadata = {
  title: '博客 | 中文分级阅读 - Chinese Level Reader',
  description: '英文博客文章:中文学习方法与实用写作工具指南(含语音转手写、AI 宠物肖像等主题)。',
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面头部 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-gray-900 hover:text-blue-600 transition-colors">
            中文分级阅读
          </Link>
          <nav className="flex space-x-6 text-sm">
            <Link href="/articles" className="text-gray-700 hover:text-blue-600 transition-colors">
              文章
            </Link>
            <Link href="/blog" className="text-blue-600 font-medium">
              博客
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">
              关于我们
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">博客</h1>
        <p className="text-gray-600 mb-8">English articles on learning Chinese and writing tools.</p>

        <div className="space-y-4">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{post.title}</h2>
              <p className="text-gray-600 mb-3">{post.description}</p>
              <time className="text-sm text-gray-400">{post.publishedAt}</time>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
