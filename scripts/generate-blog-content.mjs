// 从 seo-articles/ 目录的 HTML 文件生成 src/content/blog.ts
// 新增文章:在 seo-articles/ 放好 HTML 后,在下方 POSTS 列表登记,然后运行 `node scripts/generate-blog-content.mjs`
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const POSTS = [
  {
    file: 'seo-articles/voicetohandwriting/article-1-voice-to-handwriting.html',
    slug: 'voice-to-handwriting',
    publishedAt: '2026-10-09',
  },
  {
    file: 'seo-articles/voicetohandwriting/article-2-chinese-handwriting.html',
    slug: 'chinese-handwriting',
    publishedAt: '2026-10-09',
  },
  {
    file: 'seo-articles/petsdaily/article-1-ai-pet-portrait.html',
    slug: 'ai-pet-portrait',
    publishedAt: '2026-10-09',
  },
];

const posts = POSTS.map(({ file, slug, publishedAt }) => {
  const html = readFileSync(join(root, file), 'utf8');
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
  const body = html.match(/<article>([\s\S]*)<\/article>/)?.[1];
  if (!title || !description || !body) {
    throw new Error(`无法从 ${file} 提取 title/description/article 正文`);
  }
  return { slug, title, description, publishedAt, html: body.trim() };
});

const ts = `// 本文件由 scripts/generate-blog-content.mjs 自动生成,请勿手动编辑
// 源文件在 seo-articles/ 目录,修改后重新运行:node scripts/generate-blog-content.mjs

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  html: string;
}

export const blogPosts: BlogPost[] = ${JSON.stringify(posts, null, 2)};

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}
`;

mkdirSync(join(root, 'src/content'), { recursive: true });
writeFileSync(join(root, 'src/content/blog.ts'), ts);
console.log(`已生成 src/content/blog.ts,共 ${posts.length} 篇: ${posts.map((p) => p.slug).join(', ')}`);
