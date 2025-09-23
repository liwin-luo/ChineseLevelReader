import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/" className="text-2xl font-bold text-gray-900 chinese-text hover:text-blue-600 transition-colors">
            中文分级阅读
          </Link>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 chinese-text">隐私政策</h1>
        <div className="prose chinese-text">
          <p>我们非常重视您的隐私。本网站仅收集运行所需的最小数据，不会出售或共享您的个人信息。</p>
          <ul>
            <li>本地存储：用于保存您的语言偏好与收藏列表。</li>
            <li>日志：用于故障排查的匿名访问日志。</li>
          </ul>
          <p>如有疑问，请联系：support@example.com</p>
        </div>
      </main>
    </div>
  );
}


