'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function TestTranslatePage() {
  const [inputText, setInputText] = useState('人工智能是计算机科学的一个分支');
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTranslate = async () => {
    setLoading(true);
    setError('');
    setTranslatedText('');
    
    try {
      console.log('Sending translation request:', {
        text: inputText,
        fromLanguage: 'zh',
        toLanguage: 'en',
      });
      
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          fromLanguage: 'zh',
          toLanguage: 'en',
        }),
      });
      
      console.log('Received response:', response);
      const data = await response.json();
      console.log('Parsed data:', data);
      
      if (response.ok) {
        setTranslatedText(data.data.translatedText);
      } else {
        console.error('Translation API Error:', data);
        setError(`Translation failed: ${data.message || 'Unknown error'} (Status: ${response.status})`);
      }
    } catch (err) {
      console.error('Network error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Kimi翻译功能测试</h1>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">输入文本:</label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="w-full p-2 border rounded-md"
          rows={4}
          placeholder="请输入要翻译的文本"
        />
      </div>
      
      <Button onClick={handleTranslate} disabled={loading}>
        {loading ? '翻译中...' : '翻译'}
      </Button>
      
      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
          <h2 className="font-bold">错误:</h2>
          <p>{error}</p>
        </div>
      )}
      
      {translatedText && (
        <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-md">
          <h2 className="font-bold mb-2">翻译结果:</h2>
          <p>{translatedText}</p>
        </div>
      )}
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">测试说明</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>此页面用于测试Kimi翻译功能是否正常工作</li>
          <li>如果翻译成功，您将看到英文翻译结果</li>
          <li>如果出现错误，请检查控制台日志以获取更多信息</li>
          <li>Kimi API密钥已配置在.env.local文件中</li>
        </ul>
      </div>
    </div>
  );
}