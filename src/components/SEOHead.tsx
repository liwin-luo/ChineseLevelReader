'use client';

import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  noindex?: boolean;
  ogImage?: string;
}

export default function SEOHead({
  title,
  description,
  keywords,
  canonical,
  noindex = false,
  ogImage
}: SEOHeadProps) {
  useEffect(() => {
    // 动态更新页面标题
    if (title) {
      document.title = title;
    }

    // 动态更新meta标签
    const updateMeta = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    const updateProperty = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // 更新基础meta标签
    if (description) {
      updateMeta('description', description);
      updateProperty('og:description', description);
      updateMeta('twitter:description', description);
    }

    if (keywords) {
      updateMeta('keywords', keywords);
    }

    if (title) {
      updateProperty('og:title', title);
      updateMeta('twitter:title', title);
    }

    if (canonical) {
      updateProperty('og:url', canonical);
      // 更新canonical link
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = canonical;
    }

    if (ogImage) {
      updateProperty('og:image', ogImage);
      updateMeta('twitter:image', ogImage);
    }

    // robots meta
    if (noindex) {
      updateMeta('robots', 'noindex, nofollow');
    } else {
      updateMeta('robots', 'index, follow');
    }

    // 添加viewport meta（如果不存在）
    if (!document.querySelector('meta[name="viewport"]')) {
      const viewport = document.createElement('meta');
      viewport.name = 'viewport';
      viewport.content = 'width=device-width, initial-scale=1';
      document.head.appendChild(viewport);
    }

    // 添加charset meta（如果不存在）
    if (!document.querySelector('meta[charset]')) {
      const charset = document.createElement('meta');
      charset.setAttribute('charset', 'UTF-8');
      document.head.insertBefore(charset, document.head.firstChild);
    }
  }, [title, description, keywords, canonical, noindex, ogImage]);

  return null; // 这个组件不渲染任何内容
}