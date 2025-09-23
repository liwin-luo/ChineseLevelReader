// 性能监控和分析工具

/**
 * Web Vitals 监控
 */
export class PerformanceMonitor {
  private static isInitialized = false;
  private static metrics: Record<string, number> = {};

  /**
   * 初始化性能监控
   */
  static initialize() {
    if (this.isInitialized || typeof window === 'undefined') return;
    
    this.isInitialized = true;
    
    // 导入 web-vitals 并开始监控
    this.importWebVitals();
    
    // 监控自定义指标
    this.monitorCustomMetrics();
    
    // 监控错误
    this.monitorErrors();
    
    // 监控网络状态
    this.monitorNetworkStatus();
  }

  /**
   * 动态导入 web-vitals
   */
  private static async importWebVitals() {
    try {
      const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals');
      
      // Core Web Vitals
      getCLS(this.sendMetric.bind(this, 'CLS'));
      getFID(this.sendMetric.bind(this, 'FID'));
      getLCP(this.sendMetric.bind(this, 'LCP'));
      
      // 其他有用指标
      getFCP(this.sendMetric.bind(this, 'FCP'));
      getTTFB(this.sendMetric.bind(this, 'TTFB'));
    } catch (error) {
      console.warn('Web Vitals 加载失败:', error);
    }
  }

  /**
   * 发送指标数据
   */
  private static sendMetric(name: string, metric: any) {
    const value = Math.round(metric.value);
    this.metrics[name] = value;
    
    // 发送到 Google Analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: value,
        non_interaction: true
      });
    }
    
    // 发送到自定义分析端点
    this.sendToAnalytics({
      type: 'web-vital',
      name,
      value,
      id: metric.id,
      rating: metric.rating,
      timestamp: Date.now()
    });
    
    // 开发环境日志
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 ${name}:`, value, metric.rating);
    }
  }

  /**
   * 监控自定义指标
   */
  private static monitorCustomMetrics() {
    // 页面加载时间
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      this.trackCustomMetric('page_load_time', loadTime);
    });
    
    // 用户交互延迟
    ['click', 'keydown', 'touchstart'].forEach(eventType => {
      document.addEventListener(eventType, (event) => {
        const startTime = performance.now();
        
        requestAnimationFrame(() => {
          const interactionDelay = performance.now() - startTime;
          this.trackCustomMetric('interaction_delay', interactionDelay);
        });
      }, { passive: true, once: false });
    });
    
    // 内存使用情况
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        this.trackCustomMetric('memory_used', memory.usedJSHeapSize);
        this.trackCustomMetric('memory_total', memory.totalJSHeapSize);
      }, 30000); // 每30秒检查一次
    }
  }

  /**
   * 监控错误
   */
  private static monitorErrors() {
    // JavaScript 错误
    window.addEventListener('error', (event) => {
      this.trackError({
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });
    
    // Promise 拒绝
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        type: 'promise',
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack
      });
    });
    
    // 资源加载错误
    document.addEventListener('error', (event) => {
      if (event.target && event.target !== window) {
        const target = event.target as HTMLElement;
        this.trackError({
          type: 'resource',
          message: `Failed to load: ${target.tagName}`,
          source: (target as any).src || (target as any).href,
          tagName: target.tagName
        });
      }
    }, true);
  }

  /**
   * 监控网络状态
   */
  private static monitorNetworkStatus() {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      this.trackCustomMetric('connection_type', connection.effectiveType);
      this.trackCustomMetric('connection_downlink', connection.downlink);
      
      connection.addEventListener('change', () => {
        this.trackCustomMetric('connection_type', connection.effectiveType);
        this.trackCustomMetric('connection_downlink', connection.downlink);
      });
    }
    
    // 在线/离线状态
    window.addEventListener('online', () => {
      this.trackEvent('network_status', 'online');
    });
    
    window.addEventListener('offline', () => {
      this.trackEvent('network_status', 'offline');
    });
  }

  /**
   * 跟踪自定义指标
   */
  static trackCustomMetric(name: string, value: number | string) {
    this.sendToAnalytics({
      type: 'custom-metric',
      name,
      value,
      timestamp: Date.now()
    });
  }

  /**
   * 跟踪事件
   */
  static trackEvent(category: string, action: string, label?: string, value?: number) {
    // Google Analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value
      });
    }
    
    // 自定义分析
    this.sendToAnalytics({
      type: 'event',
      category,
      action,
      label,
      value,
      timestamp: Date.now()
    });
  }

  /**
   * 跟踪错误
   */
  static trackError(errorInfo: any) {
    this.sendToAnalytics({
      type: 'error',
      ...errorInfo,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: Date.now()
    });
  }

  /**
   * 发送数据到分析端点
   */
  static async sendToAnalytics(data: any) {
    try {
      // 使用 navigator.sendBeacon 确保数据发送
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(data)], {
          type: 'application/json'
        });
        navigator.sendBeacon('/api/analytics', blob);
      } else {
        // 备用方案
        fetch('/api/analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data),
          keepalive: true
        }).catch(() => {
          // 忽略发送失败
        });
      }
    } catch (error) {
      // 忽略分析发送错误
    }
  }

  /**
   * 获取当前指标
   */
  static getMetrics() {
    return { ...this.metrics };
  }

  /**
   * 生成性能报告
   */
  static generateReport() {
    const metrics = this.getMetrics();
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    
    return {
      webVitals: metrics,
      navigation: {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        load: navigation.loadEventEnd - navigation.loadEventStart,
        domComplete: navigation.domComplete - navigation.navigationStart
      },
      paint: paint.reduce((acc, entry) => {
        acc[entry.name] = Math.round(entry.startTime);
        return acc;
      }, {} as Record<string, number>),
      resources: this.getResourceMetrics(),
      memory: this.getMemoryInfo()
    };
  }

  /**
   * 获取资源加载指标
   */
  private static getResourceMetrics() {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    const byType = resources.reduce((acc, resource) => {
      const type = this.getResourceType(resource.name);
      if (!acc[type]) acc[type] = [];
      acc[type].push({
        name: resource.name,
        duration: Math.round(resource.duration),
        size: resource.transferSize
      });
      return acc;
    }, {} as Record<string, any[]>);
    
    return byType;
  }

  /**
   * 获取资源类型
   */
  private static getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'image';
    if (url.match(/\\.(woff|woff2|ttf|eot)$/)) return 'font';
    return 'other';
  }

  /**
   * 获取内存信息
   */
  private static getMemoryInfo() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      };
    }
    return null;
  }
}

/**
 * 用户行为分析
 */
export class UserAnalytics {
  private static sessionStart = Date.now();
  private static pageViews: string[] = [];
  private static interactions: any[] = [];

  /**
   * 初始化用户分析
   */
  static initialize() {
    if (typeof window === 'undefined') return;
    
    this.trackPageView();
    this.trackScrollDepth();
    this.trackClicks();
    this.trackFormInteractions();
    this.trackReadingTime();
    
    // 页面卸载时发送会话数据
    window.addEventListener('beforeunload', () => {
      this.endSession();
    });
  }

  /**
   * 跟踪页面浏览
   */
  static trackPageView(path?: string) {
    const currentPath = path || window.location.pathname;
    this.pageViews.push(currentPath);
    
    PerformanceMonitor.trackEvent('page', 'view', currentPath);
  }

  /**
   * 跟踪滚动深度
   */
  private static trackScrollDepth() {
    let maxScroll = 0;
    const thresholds = [25, 50, 75, 90, 100];
    const tracked = new Set();
    
    const trackScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      
      maxScroll = Math.max(maxScroll, scrollPercent);
      
      thresholds.forEach(threshold => {
        if (scrollPercent >= threshold && !tracked.has(threshold)) {
          tracked.add(threshold);
          PerformanceMonitor.trackEvent('scroll', 'depth', `${threshold}%`, threshold);
        }
      });
    };
    
    window.addEventListener('scroll', trackScroll, { passive: true });
  }

  /**
   * 跟踪点击事件
   */
  private static trackClicks() {
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const className = target.className;
      const text = target.textContent?.slice(0, 50) || '';
      
      this.interactions.push({
        type: 'click',
        tagName,
        className,
        text,
        timestamp: Date.now()
      });
      
      // 跟踪重要元素
      if (tagName === 'a') {
        const href = (target as HTMLAnchorElement).href;
        PerformanceMonitor.trackEvent('link', 'click', href);
      } else if (tagName === 'button') {
        PerformanceMonitor.trackEvent('button', 'click', text);
      }
    });
  }

  /**
   * 跟踪表单交互
   */
  private static trackFormInteractions() {
    // 表单提交
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      PerformanceMonitor.trackEvent('form', 'submit', form.id || form.className);
    });
    
    // 输入字段聚焦
    document.addEventListener('focus', (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        const input = target as HTMLInputElement;
        PerformanceMonitor.trackEvent('form', 'focus', input.type || input.tagName);
      }
    }, true);
  }

  /**
   * 跟踪阅读时间
   */
  private static trackReadingTime() {
    let startTime = Date.now();
    let isVisible = true;
    
    // 页面可见性变化
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (isVisible) {
          const readingTime = Date.now() - startTime;
          PerformanceMonitor.trackEvent('reading', 'time', window.location.pathname, readingTime);
          isVisible = false;
        }
      } else {
        startTime = Date.now();
        isVisible = true;
      }
    });
  }

  /**
   * 结束会话
   */
  private static endSession() {
    const sessionDuration = Date.now() - this.sessionStart;
    
    PerformanceMonitor.sendToAnalytics({
      type: 'session',
      duration: sessionDuration,
      pageViews: this.pageViews,
      interactions: this.interactions.length,
      timestamp: Date.now()
    });
  }
}

/**
 * 初始化所有监控
 */
export const initializeMonitoring = () => {
  if (typeof window === 'undefined') return;
  
  // 延迟初始化以避免影响页面加载
  setTimeout(() => {
    PerformanceMonitor.initialize();
    UserAnalytics.initialize();
  }, 1000);
};"