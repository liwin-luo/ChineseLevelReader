import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_SC } from "next/font/google";
import { SEOHelper } from '@/lib/seo';
import Analytics from '@/components/Analytics';
import PerformanceOptimizer from '@/components/PerformanceOptimizer';
import { initializeCache } from '@/lib/cache';
import Script from 'next/script';
import { LanguageToggle } from '@/components/LanguageToggle';
import "./globals.css";

// 优化字体加载
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial']
});

const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  variable: '--font-noto-sans-sc',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial']
});

// 优化的viewport配置
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' }
  ]
};

// 默认SEO元数据
export const metadata: Metadata = {
  ...SEOHelper.generateHomeMeta(),
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png'
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION_ID,
    other: {
      'baidu-site-verification': process.env.BAIDU_VERIFICATION_ID || ''
    }
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${inter.variable} ${notoSansSC.variable} lang-zh`}>
      <head>
        {/* DNS Prefetch for external resources */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Preconnect to important origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        {/* 缓存初始化脚本 */}
        <Script
          id="cache-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // 早期缓存初始化
                try {
                  if (typeof Storage !== 'undefined') {
                    // 清理过期缓存
                    var keys = Object.keys(localStorage);
                    var prefix = 'chinese-reader-v1';
                    keys.forEach(function(key) {
                      if (key.startsWith(prefix)) {
                        try {
                          var item = JSON.parse(localStorage.getItem(key));
                          if (item && item.timestamp && item.ttl) {
                            if (Date.now() - item.timestamp > item.ttl) {
                              localStorage.removeItem(key);
                            }
                          }
                        } catch (e) {
                          localStorage.removeItem(key);
                        }
                      }
                    });
                  }
                } catch (e) {
                  console.warn('Cache cleanup failed:', e);
                }
              })();
            `
          }}
        />

        {/* 语言预设脚本移除，避免 Hydration Mismatch */}
        
        <Analytics />
        <PerformanceOptimizer />
        {children}

        {/* 固定的语言切换 */}
        <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
          <LanguageToggle />
        </div>
      </body>
    </html>
  );
}
