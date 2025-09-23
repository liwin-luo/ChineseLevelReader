'use client';

import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

interface ArticleActionsProps {
  article: {
    id: string;
    title: string;
  };
}

export default function ArticleActions({ article }: ArticleActionsProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 在客户端挂载后读取本地收藏状态，避免 SSR/CSR 不一致
    try {
      const raw = localStorage.getItem('bookmarks') || '"[]"';
      const ids: string[] = JSON.parse(raw as any);
      setBookmarked(ids.includes(article.id));
    } catch {
      setBookmarked(false);
    } finally {
      setMounted(true);
    }
  }, [article.id]);
  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('链接已复制到剪贴板');
    }
  };

  const toggleBookmark = () => {
    try {
      const raw = localStorage.getItem('bookmarks') || '[]';
      const ids: string[] = JSON.parse(raw);
      const exists = ids.includes(article.id);
      const next = exists ? ids.filter(id => id !== article.id) : [...ids, article.id];
      localStorage.setItem('bookmarks', JSON.stringify(next));
      setBookmarked(!exists);
    } catch {
      // 忽略
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <Button 
        onClick={handlePrint}
        variant="outline"
        size="icon"
        title="打印文章"
      >
        🖨️
      </Button>
      <Button 
        onClick={handleShare}
        variant="outline"
        size="icon"
        title="分享文章"
      >
        📤
      </Button>
      <Button
        onClick={toggleBookmark}
        variant={bookmarked ? 'default' : 'outline'}
        size="icon"
        title={bookmarked ? '取消收藏' : '收藏文章'}
        aria-pressed={bookmarked}
      >
        {bookmarked ? '★' : '☆'}
      </Button>
    </div>
  );
}