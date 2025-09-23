'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DIFFICULTY_CONFIG } from '@/constants/difficulty';
import { Article } from '@/types';

export default function BookmarksPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const raw = localStorage.getItem('bookmarks') || '[]';
        const ids: string[] = JSON.parse(raw);
        if (ids.length === 0) {
          setArticles([]);
          return;
        }
        const results = await Promise.allSettled(
          ids.map(id => fetch(`/api/articles/${id}`).then(r => r.json()))
        );
        const items: Article[] = [];
        results.forEach(res => {
          if (res.status === 'fulfilled' && res.value?.success && res.value?.data) {
            items.push(res.value.data as Article);
          }
        });
        // 保持与本地顺序一致
        items.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
        setArticles(items);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const removeBookmark = (id: string) => {
    try {
      const raw = localStorage.getItem('bookmarks') || '[]';
      const ids: string[] = JSON.parse(raw);
      const next = ids.filter(x => x !== id);
      localStorage.setItem('bookmarks', JSON.stringify(next));
      setArticles(prev => prev.filter(a => a.id !== id));
    } catch {}
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="text-2xl font-bold text-gray-900 chinese-text hover:text-blue-600 transition-colors">
              中文分级阅读
            </Link>
            <nav className="flex space-x-6">
              <Link href="/articles" className="text-gray-700 hover:text-blue-600 transition-colors">文章</Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">关于我们</Link>
              <span className="text-blue-600 font-medium">我的收藏</span>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 chinese-text">我的收藏</h1>

        {loading ? (
          <div className="text-gray-500">加载中...</div>
        ) : articles.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-6xl mb-4">📑</div>
              <CardTitle className="text-lg text-gray-900 mb-2 chinese-text">还没有收藏</CardTitle>
              <p className="text-gray-500 chinese-text">去文章页点击右上角☆即可收藏喜欢的内容</p>
              <Button asChild className="mt-6">
                <Link href="/articles">去浏览文章</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {articles.map(article => (
              <Card key={article.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded text-xs font-medium difficulty-${article.difficulty}`}>
                      {DIFFICULTY_CONFIG[article.difficulty].name}
                    </span>
                    <button
                      onClick={() => removeBookmark(article.id)}
                      className="text-yellow-600 hover:text-yellow-700 text-sm"
                      title="取消收藏"
                    >
                      ★ 取消
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg text-gray-900 mb-2 chinese-text line-clamp-2">
                    {article.title}
                  </CardTitle>
                  <p className="text-gray-600 text-sm chinese-text line-clamp-3">
                    {article.content.substring(0, 120)}...
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between items-center text-xs text-gray-500">
                  <span>{new Date(article.publishDate).toLocaleDateString('zh-CN')}</span>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/articles/${article.id}`}>阅读全文</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}


