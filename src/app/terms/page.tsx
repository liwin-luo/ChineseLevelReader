import Link from 'next/link';

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6 chinese-text">使用条款</h1>
        <div className="prose chinese-text">
          <p>使用本网站即表示您同意以下条款：</p>
          <ul>
            <li>内容仅用于学习与研究，不得用于商业用途。</li>
            <li>请遵守相关法律法规，不发布违法内容。</li>
            <li>我们可能随时更新条款，恕不另行通知。</li>
          </ul>
        </div>
      </main>
    </div>
  );
}


