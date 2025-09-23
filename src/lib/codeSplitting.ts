import dynamic from 'next/dynamic';

// 代码分割 - 懒加载组件
export const LazyAdvancedSearch = dynamic(
  () => import('@/components/AdvancedSearch').then(mod => ({ default: mod.AdvancedSearch })),
  {
    loading: () => null,
    ssr: false
  }
);

// 预加载组件
export const preloadComponent = (componentImporter: () => Promise<any>) => {
  if (typeof window !== 'undefined') {
    componentImporter();
  }
};

// Bundle splitting 配置辅助函数
export const bundleAnalysis = {
  // 预加载关键路由
  preloadCriticalRoutes: () => {
    if (typeof window !== 'undefined') {
      const criticalRoutes = ['/articles', '/about'];
      criticalRoutes.forEach(route => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route;
        document.head.appendChild(link);
      });
    }
  }
};