// 缓存优化策略

/**
 * 浏览器缓存管理
 */
export class CacheManager {
  private static readonly CACHE_VERSION = 'v1';
  private static readonly CACHE_PREFIX = 'chinese-reader';
  
  // 缓存键生成
  static generateCacheKey(type: string, id: string): string {
    return `${this.CACHE_PREFIX}-${this.CACHE_VERSION}-${type}-${id}`;
  }

  // localStorage 缓存
  static setLocalCache(key: string, data: any, ttl: number = 3600000): void { // 默认1小时
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        ttl
      };
      localStorage.setItem(this.generateCacheKey('local', key), JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to set local cache:', error);
    }
  }

  static getLocalCache<T>(key: string): T | null {
    try {
      const cacheItem = localStorage.getItem(this.generateCacheKey('local', key));
      if (!cacheItem) return null;

      const { data, timestamp, ttl } = JSON.parse(cacheItem);
      
      // 检查是否过期
      if (Date.now() - timestamp > ttl) {
        localStorage.removeItem(this.generateCacheKey('local', key));
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Failed to get local cache:', error);
      return null;
    }
  }

  // sessionStorage 缓存（会话级别）
  static setSessionCache(key: string, data: any): void {
    try {
      sessionStorage.setItem(this.generateCacheKey('session', key), JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to set session cache:', error);
    }
  }

  static getSessionCache<T>(key: string): T | null {
    try {
      const cacheItem = sessionStorage.getItem(this.generateCacheKey('session', key));
      return cacheItem ? JSON.parse(cacheItem) : null;
    } catch (error) {
      console.warn('Failed to get session cache:', error);
      return null;
    }
  }

  // 清理过期缓存
  static cleanExpiredCache(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(`${this.CACHE_PREFIX}-${this.CACHE_VERSION}`)) {
          try {
            const cacheItem = localStorage.getItem(key);
            if (cacheItem) {
              const { timestamp, ttl } = JSON.parse(cacheItem);
              if (Date.now() - timestamp > ttl) {
                localStorage.removeItem(key);
              }
            }
          } catch {
            // 删除损坏的缓存项
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.warn('Failed to clean expired cache:', error);
    }
  }

  // 清理所有缓存
  static clearAllCache(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(`${this.CACHE_PREFIX}-${this.CACHE_VERSION}`)) {
          localStorage.removeItem(key);
        }
      });
      
      const sessionKeys = Object.keys(sessionStorage);
      sessionKeys.forEach(key => {
        if (key.startsWith(`${this.CACHE_PREFIX}-${this.CACHE_VERSION}`)) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear all cache:', error);
    }
  }
}

/**
 * HTTP 缓存优化
 */
export class HTTPCache {
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  // 内存缓存 GET 请求
  static async cachedFetch<T>(
    url: string, 
    options: RequestInit = {}, 
    ttl: number = 300000 // 默认5分钟
  ): Promise<T> {
    const cacheKey = `${url}-${JSON.stringify(options)}`;
    
    // 检查内存缓存
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Cache-Control': 'max-age=300',
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // 缓存响应
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        ttl
      });

      return data;
    } catch (error) {
      // 如果有缓存的数据，返回缓存
      if (cached) {
        console.warn('Using stale cache due to fetch error:', error);
        return cached.data;
      }
      throw error;
    }
  }

  // 清理过期的内存缓存
  static cleanExpiredMemoryCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > value.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // 预加载资源
  static preloadResource(url: string): void {
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
    }
  }
}

/**
 * Service Worker 缓存策略
 */
export const serviceWorkerCache = {
  // 注册 Service Worker
  register: async (): Promise<void> => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
      } catch (error) {
        console.warn('Service Worker registration failed:', error);
      }
    }
  },

  // 更新缓存
  updateCache: (): void => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.update();
      });
    }
  }
};

/**
 * React Query / SWR 缓存配置
 */
export const queryConfig = {
  staleTime: 5 * 60 * 1000, // 5分钟
  cacheTime: 10 * 60 * 1000, // 10分钟
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  retry: 3,
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000)
};

/**
 * 缓存初始化和清理
 */
export const initializeCache = (): void => {
  // 清理过期缓存
  CacheManager.cleanExpiredCache();
  HTTPCache.cleanExpiredMemoryCache();
  
  // 注册 Service Worker
  serviceWorkerCache.register();
  
  // 定期清理缓存
  if (typeof window !== 'undefined') {
    setInterval(() => {
      CacheManager.cleanExpiredCache();
      HTTPCache.cleanExpiredMemoryCache();
    }, 30 * 60 * 1000); // 每30分钟清理一次
  }
};

/**
 * 缓存预热策略
 */
export const preloadCriticalData = async (): Promise<void> => {
  if (typeof window !== 'undefined') {
    try {
      // 预加载首页数据
      HTTPCache.preloadResource('/api/articles?limit=10');
      HTTPCache.preloadResource('/api/stats');
      
      // 预加载各难度级别的文章
      ['simple', 'medium', 'hard'].forEach(difficulty => {
        HTTPCache.preloadResource(`/api/articles?difficulty=${difficulty}&limit=5`);
      });
      
    } catch (error) {
      console.warn('Failed to preload critical data:', error);
    }
  }
};