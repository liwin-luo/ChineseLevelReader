'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function TestRSSProcessPage() {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleProcessRSS = async () => {
    setProcessing(true);
    setError('');
    setResult(null);
    
    try {
      const response = await fetch('/api/process-rss', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          limit: 3
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.message || 'Processing failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">RSS处理流程测试</h1>
      <p className="mb-4">此页面测试从RSS获取数据、翻译成英文并记录到数据库的完整流程。</p>
      
      <Button onClick={handleProcessRSS} disabled={processing}>
        {processing ? '处理中...' : '开始处理RSS数据'}
      </Button>
      
      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
          <h2 className="font-bold">错误:</h2>
          <p>{error}</p>
        </div>
      )}
      
      {result && (
        <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-md">
          <h2 className="font-bold mb-2">处理结果:</h2>
          <p>成功处理了 {result.data.processed} 篇文章</p>
          
          {result.data.articles && result.data.articles.length > 0 && (
            <div className="mt-4">
              <h3 className="font-bold">处理的文章:</h3>
              <ul className="list-disc pl-5 mt-2">
                {result.data.articles.map((article: any) => (
                  <li key={article.id} className="mb-2">
                    <strong>{article.title}</strong>
                    <br />
                    <span className="text-sm">来源: {article.source}</span>
                    <br />
                    <span className="text-sm">翻译预览: {article.translatedContent.substring(0, 100)}...</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {result.data.errors && result.data.errors.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-100 text-yellow-700 rounded-md">
              <h3 className="font-bold">处理中的错误:</h3>
              <ul className="list-disc pl-5 mt-2">
                {result.data.errors.map((err: string, index: number) => (
                  <li key={index}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">流程说明</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>从RSS源获取最新的文章数据</li>
          <li>使用Kimi翻译服务将中文内容翻译成英文</li>
          <li>将处理后的文章保存到数据库中</li>
          <li>返回处理结果和文章列表</li>
        </ol>
      </div>
    </div>
  );
}