'use client';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void; }) {
  return (
    <html>
      <body className="min-h-screen flex items-center justify-center bg-red-50 px-6">
        <div className="text-center">
          <div className="text-7xl mb-4">🚨</div>
          <h1 className="text-2xl font-semibold text-red-900 mb-2 chinese-text">发生错误</h1>
          <p className="text-red-700 mb-6 chinese-text">抱歉，页面加载失败。您可以稍后重试。</p>
          <button onClick={reset} className="px-4 py-2 bg-red-600 text-white rounded">重试</button>
        </div>
      </body>
    </html>
  );
}


