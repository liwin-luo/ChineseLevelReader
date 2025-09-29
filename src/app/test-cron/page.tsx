'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function TestCronPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testCron = async (cronPath: string) => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await fetch(`/api/cron${cronPath}`, {
        method: 'POST',
      });
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Cron Jobs 测试页面</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">每日任务</h2>
          <p className="mb-4 text-gray-600">每天上午9点执行RSS同步</p>
          <Button 
            onClick={() => testCron('/daily')}
            disabled={loading}
            className="w-full"
          >
            {loading ? '执行中...' : '测试每日任务'}
          </Button>
        </div>
        
        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">每周任务</h2>
          <p className="mb-4 text-gray-600">每周一上午10点生成统计报告</p>
          <Button 
            onClick={() => testCron('/weekly')}
            disabled={loading}
            className="w-full"
          >
            {loading ? '执行中...' : '测试每周任务'}
          </Button>
        </div>
        
        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">每月任务</h2>
          <p className="mb-4 text-gray-600">每月1日上午11点清理旧文章</p>
          <Button 
            onClick={() => testCron('/monthly')}
            disabled={loading}
            className="w-full"
          >
            {loading ? '执行中...' : '测试每月任务'}
          </Button>
        </div>
        
        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">每小时任务</h2>
          <p className="mb-4 text-gray-600">每小时更新文章热度分数</p>
          <Button 
            onClick={() => testCron('/hourly')}
            disabled={loading}
            className="w-full"
          >
            {loading ? '执行中...' : '测试每小时任务'}
          </Button>
        </div>
      </div>
      
      {result && (
        <div className="mt-8 p-4 border rounded-lg bg-green-50">
          <h3 className="text-lg font-semibold mb-2">执行结果:</h3>
          <pre className="bg-white p-4 rounded overflow-auto max-h-60">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
      
      {error && (
        <div className="mt-8 p-4 border rounded-lg bg-red-50">
          <h3 className="text-lg font-semibold mb-2">错误:</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}