'use client';

import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export default function LanguageToggle() {
  const [lang, setLang] = useState<'zh' | 'en'>('zh');

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('lang', lang === 'en' ? 'en-US' : 'zh-CN');
    document.documentElement.classList.toggle('lang-en', lang === 'en');
    document.documentElement.classList.toggle('lang-zh', lang !== 'en');
    try { localStorage.setItem('lang', lang); } catch {}
  }, [lang]);

  useEffect(() => {
    // Hydration 后再读取 localStorage，避免 SSR/CSR 不一致
    try {
      const stored = (localStorage.getItem('lang') as 'zh' | 'en') || 'zh';
      setLang(stored);
    } catch {
      setLang('zh');
    }
  }, []);

  const toggle = () => setLang(prev => (prev === 'zh' ? 'en' : 'zh'));

  return (
    <Button onClick={toggle} variant="outline" size="sm" title="语言 / Language">
      {lang === 'zh' ? '中文 / EN' : 'EN / 中文'}
    </Button>
  );
}


