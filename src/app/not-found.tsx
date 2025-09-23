import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="text-center">
        <div className="text-7xl mb-4">😕</div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2 chinese-text">页面未找到</h1>
        <p className="text-gray-600 mb-6 chinese-text">抱歉，您访问的页面不存在或已被移动。</p>
        <Link href="/" className="text-blue-600 hover:underline">返回首页</Link>
      </div>
    </div>
  );
}


