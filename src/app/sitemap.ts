import { MetadataRoute } from 'next';
import { prismaStorage } from '@/lib/prisma';
import { SEOHelper } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // 获取所有已发布的文章
    const articles = await prismaStorage.getAllArticles();
    
    // 生成sitemap URL
    const sitemapUrls = SEOHelper.generateSitemapUrls(articles);
    
    return sitemapUrls.map(url => ({
      url: url.url,
      lastModified: url.lastModified,
      changeFrequency: url.changeFrequency,
      priority: url.priority
    }));
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // 返回基础页面sitemap
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://chinese-level-reader.vercel.app';
    
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
    ];
  }
}
