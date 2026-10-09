import { MetadataRoute } from 'next';
import { prismaStorage } from '@/lib/prisma';
import { SEOHelper } from '@/lib/seo';
import { blogPosts } from '@/content/blog';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://chinese-level-reader.vercel.app';

// 博客页面(静态内容,不依赖数据库)
const blogUrls: MetadataRoute.Sitemap = [
  {
    url: `${baseUrl}/blog`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  },
  ...blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  })),
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // 获取所有已发布的文章
    const articles = await prismaStorage.getAllArticles();

    // 生成sitemap URL
    const sitemapUrls = SEOHelper.generateSitemapUrls(articles);

    return [
      ...sitemapUrls.map(url => ({
        url: url.url,
        lastModified: url.lastModified,
        changeFrequency: url.changeFrequency,
        priority: url.priority
      })),
      ...blogUrls,
    ];
  } catch (error) {
    console.error('Error generating sitemap:', error);

    // 返回基础页面sitemap
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/articles`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      },
      ...blogUrls,
    ];
  }
}
