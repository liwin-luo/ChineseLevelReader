// 字体优化配置和管理

/**
 * 字体预加载管理
 */
export class FontOptimizer {
  private static readonly FONT_DISPLAY_STRATEGY = 'swap';
  private static readonly PRELOAD_FONTS = [
    {
      href: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
      type: 'font/woff2',
      crossOrigin: 'anonymous'
    },
    {
      href: 'https://fonts.gstatic.com/s/notosanssc/v36/k3kCo84MPvpLmixcA63oeAL7Iu_wOBSNaefZo3l8ZPgF5DQRe_0-RA.woff2',
      type: 'font/woff2',
      crossOrigin: 'anonymous'
    }
  ];

  /**
   * 动态预加载关键字体
   */
  static preloadCriticalFonts(): void {
    if (typeof window === 'undefined') return;

    this.PRELOAD_FONTS.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = font.href;
      link.as = 'font';
      link.type = font.type;
      link.crossOrigin = font.crossOrigin;
      document.head.appendChild(link);
    });
  }

  /**
   * 字体加载状态检测
   */
  static async detectFontLoad(fontFamily: string, timeout: number = 3000): Promise<boolean> {
    if (typeof window === 'undefined' || !document.fonts) return false;

    try {
      await Promise.race([
        document.fonts.load(`16px ${fontFamily}`),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Font load timeout')), timeout)
        )
      ]);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 字体回退策略
   */
  static applyFontFallback(): void {
    if (typeof window === 'undefined') return;

    const style = document.createElement('style');
    style.textContent = `
      /* 字体回退优化 */
      .font-inter {
        font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif;
        font-display: ${this.FONT_DISPLAY_STRATEGY};
      }
      
      .font-noto-sans-sc {
        font-family: 'Noto Sans SC', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', 'STHeitiSC-Light', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
        font-display: ${this.FONT_DISPLAY_STRATEGY};
      }
      
      /* 中文文本优化 */
      .chinese-text {
        font-family: var(--font-noto-sans-sc), 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', 'STHeitiSC-Light', sans-serif;
        line-height: 1.7;
        letter-spacing: 0.05em;
      }
      
      /* 英文文本优化 */
      .english-text {
        font-family: var(--font-inter), system-ui, -apple-system, 'Segoe UI', 'Roboto', sans-serif;
        line-height: 1.6;
      }
      
      /* 字体加载期间的样式 */
      .font-loading {
        visibility: hidden;
      }
      
      .font-loaded {
        visibility: visible;
        transition: visibility 0.1s;
      }
      
      /* 减少字体闪烁 */
      @font-face {
        font-family: 'Inter-fallback';
        src: local('Arial');
        ascent-override: 90.20%;
        descent-override: 22.48%;
        line-gap-override: 0.00%;
        size-adjust: 107.40%;
      }
      
      @font-face {
        font-family: 'NotoSansSC-fallback';
        src: local('PingFang SC'), local('Microsoft YaHei');
        ascent-override: 85%;
        descent-override: 15%;
        line-gap-override: 0%;
        size-adjust: 100%;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * 字体性能监控
   */
  static monitorFontPerformance(): void {
    if (typeof window === 'undefined' || !document.fonts) return;

    let fontsLoaded = 0;
    const totalFonts = document.fonts.size;
    const startTime = performance.now();

    document.fonts.ready.then(() => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ 字体加载完成: ${loadTime.toFixed(2)}ms`);
        console.log(`📊 已加载字体数量: ${totalFonts}`);
      }

      // 发送性能数据（如果有分析工具）
      if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as any).gtag('event', 'font_load_time', {
          'event_category': 'Performance',
          'event_label': 'Font Loading',
          'value': Math.round(loadTime)
        });
      }
    });

    // 监控单个字体加载
    document.fonts.forEach(font => {
      font.loaded.then(() => {
        fontsLoaded++;
        if (process.env.NODE_ENV === 'development') {
          console.log(`📝 字体加载: ${font.family} (${fontsLoaded}/${totalFonts})`);
        }
      }).catch(error => {
        console.warn(`❌ 字体加载失败: ${font.family}`, error);
      });
    });
  }

  /**
   * 初始化字体优化
   */
  static initialize(): void {
    if (typeof window === 'undefined') return;

    // 应用字体回退策略
    this.applyFontFallback();
    
    // 预加载关键字体
    this.preloadCriticalFonts();
    
    // 监控字体性能
    this.monitorFontPerformance();
    
    // 添加字体加载状态类
    document.documentElement.classList.add('font-loading');
    
    document.fonts.ready.then(() => {
      document.documentElement.classList.remove('font-loading');
      document.documentElement.classList.add('font-loaded');
    });
  }
}

/**
 * 字体子集优化（用于构建时）
 */
export const fontSubsetConfig = {
  inter: {
    subsets: ['latin', 'latin-ext'],
    unicodeRange: 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD',
    display: 'swap'
  },
  notoSansSC: {
    subsets: ['chinese-simplified'],
    unicodeRange: 'U+4E00-9FFF,U+3400-4DBF,U+20000-2A6DF,U+2A700-2B73F,U+2B740-2B81F,U+2B820-2CEAF,U+F900-FAFF,U+3040-309F,U+30A0-30FF',
    display: 'swap'
  }
};

/**
 * 响应式字体大小
 */
export const responsiveFontSizes = {
  // 基础字体大小
  base: {
    mobile: '14px',
    tablet: '15px',
    desktop: '16px'
  },
  // 标题字体大小
  heading: {
    h1: { mobile: '24px', tablet: '28px', desktop: '32px' },
    h2: { mobile: '20px', tablet: '24px', desktop: '28px' },
    h3: { mobile: '18px', tablet: '20px', desktop: '24px' },
    h4: { mobile: '16px', tablet: '18px', desktop: '20px' }
  },
  // 内容字体大小
  content: {
    small: { mobile: '12px', tablet: '13px', desktop: '14px' },
    normal: { mobile: '14px', tablet: '15px', desktop: '16px' },
    large: { mobile: '16px', tablet: '18px', desktop: '20px' }
  }
};

/**
 * 字体优化工具函数
 */
export const fontUtils = {
  // 计算字体最优加载策略
  getOptimalLoadingStrategy: (isCritical: boolean, isAboveFold: boolean) => {
    if (isCritical && isAboveFold) return 'block';
    if (isCritical) return 'swap';
    return 'optional';
  },
  
  // 检测系统字体支持
  detectSystemFontSupport: (fontName: string): boolean => {
    if (typeof window === 'undefined') return false;
    
    const testString = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const testSize = '72px';
    const fallbackFont = 'monospace';
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return false;
    
    context.font = `${testSize} ${fallbackFont}`;
    const fallbackWidth = context.measureText(testString).width;
    
    context.font = `${testSize} ${fontName}, ${fallbackFont}`;
    const testWidth = context.measureText(testString).width;
    
    return testWidth !== fallbackWidth;
  },
  
  // 生成字体CSS变量
  generateFontVariables: () => {
    return `
      :root {
        --font-inter: 'Inter', system-ui, sans-serif;
        --font-noto-sans-sc: 'Noto Sans SC', 'PingFang SC', sans-serif;
        --font-size-xs: 0.75rem;
        --font-size-sm: 0.875rem;
        --font-size-base: 1rem;
        --font-size-lg: 1.125rem;
        --font-size-xl: 1.25rem;
        --font-size-2xl: 1.5rem;
        --font-size-3xl: 1.875rem;
        --font-size-4xl: 2.25rem;
        --line-height-tight: 1.25;
        --line-height-snug: 1.375;
        --line-height-normal: 1.5;
        --line-height-relaxed: 1.625;
        --line-height-loose: 2;
      }
    `;
  }
};