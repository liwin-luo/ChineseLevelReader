import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { blogPosts, getBlogPost } from '@/content/blog';

// ISR: 博客文章页每日再验证一次
export const revalidate = 86400;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://chinese-level-reader.vercel.app';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// 静态生成所有博客文章页
export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

// 生成文章页 SEO 元数据(canonical 指向本站,避免与源站产生重复内容问题)
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const post = getBlogPost(resolvedParams.slug);

  if (!post) {
    return {
      title: '文章未找到',
      description: '您访问的文章不存在。'
    };
  }

  const url = `${SITE_URL}/blog/${post.slug}`;

  return {
    title: `${post.title} | 中文分级阅读`,
    description: post.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: 'article',
      publishedTime: post.publishedAt,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const resolvedParams = await params;
  const post = getBlogPost(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    url: `${SITE_URL}/blog/${post.slug}`,
    inLanguage: 'en'
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-white">
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
          <div
            className="article-body"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
          <div className="mt-10 pt-6 border-t border-gray-200">
            <Link href="/blog" className="text-blue-600 hover:underline">
              ← 返回博客列表
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}
