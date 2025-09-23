'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface AnalyticsProps {
  googleAnalyticsId?: string;
  baiduAnalyticsId?: string;
}

export default function Analytics({ 
  googleAnalyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
  baiduAnalyticsId = process.env.NEXT_PUBLIC_BAIDU_ANALYTICS_ID
}: AnalyticsProps) {
  const pathname = usePathname();

  // 页面访问跟踪
  useEffect(() => {
    if (googleAnalyticsId && typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', googleAnalyticsId, {
        page_path: pathname,
      });
    }

    if (baiduAnalyticsId && typeof window !== 'undefined' && (window as any)._hmt) {
      (window as any)._hmt.push(['_trackPageview', pathname]);
    }
  }, [pathname, googleAnalyticsId, baiduAnalyticsId]);

  return (
    <>
      {/* Google Analytics */}
      {googleAnalyticsId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${googleAnalyticsId}', {
                page_path: window.location.pathname,
                anonymize_ip: true,
                cookie_flags: 'SameSite=None;Secure'
              });
            `}
          </Script>
        </>
      )}

      {/* 百度统计 */}
      {baiduAnalyticsId && (
        <Script id="baidu-analytics" strategy="afterInteractive">
          {`
            var _hmt = _hmt || [];
            (function() {
              var hm = document.createElement("script");
              hm.src = "https://hm.baidu.com/hm.js?${baiduAnalyticsId}";
              var s = document.getElementsByTagName("script")[0]; 
              s.parentNode.insertBefore(hm, s);
            })();
          `}
        </Script>
      )}

      {/* 自定义事件跟踪 */}
      <Script id="custom-analytics" strategy="afterInteractive">
        {`
          // 自定义事件跟踪函数
          window.trackEvent = function(action, category, label, value) {
            // Google Analytics
            if (typeof gtag !== 'undefined') {
              gtag('event', action, {
                event_category: category,
                event_label: label,
                value: value
              });
            }
            
            // 百度统计
            if (typeof _hmt !== 'undefined') {
              _hmt.push(['_trackEvent', category, action, label]);
            }
            
            console.log('Analytics Event:', { action, category, label, value });
          };

          // 阅读深度跟踪
          let maxScroll = 0;
          window.addEventListener('scroll', function() {
            const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            if (scrollPercent > maxScroll && scrollPercent % 25 === 0) {
              maxScroll = scrollPercent;
              window.trackEvent('scroll_depth', 'engagement', scrollPercent + '%');
            }
          });

          // 点击跟踪
          document.addEventListener('click', function(e) {
            const target = e.target;
            if (target.tagName === 'A') {
              const href = target.getAttribute('href');
              if (href) {
                if (href.startsWith('http') && !href.includes(window.location.hostname)) {
                  // 外部链接跟踪
                  window.trackEvent('click_external_link', 'outbound', href);
                } else if (href.includes('/articles/')) {
                  // 文章点击跟踪
                  window.trackEvent('click_article', 'content', href);
                }
              }
            }
          });
        `}
      </Script>
    </>
  );
}