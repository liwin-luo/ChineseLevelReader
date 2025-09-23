// Service Worker 脚本
const CACHE_NAME = 'chinese-reader-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/articles',
  '/about',
  '/manifest.json',
  '/icon-192x192.png',
  '/og-image.svg',
  // 字体文件
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&display=swap'
];

// 动态缓存的路径模式
const CACHE_PATTERNS = [
  /^\\/api\\/articles/,
  /^\\/articles\\/\\d+/,
  /\\.(js|css|png|jpg|jpeg|svg|woff2?)$/
];

// 安装事件
self.addEventListener('install', (event) => {
  console.log('Service Worker 安装中...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('缓存静态资源...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // 跳过等待，立即激活新的 Service Worker
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('安装失败:', error);
      })
  );
});

// 激活事件
self.addEventListener('activate', (event) => {
  console.log('Service Worker 激活中...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        // 删除旧的缓存
        return Promise.all(
          cacheNames
            .filter(cacheName => {
              return cacheName !== STATIC_CACHE && 
                     cacheName !== DYNAMIC_CACHE &&
                     cacheName !== CACHE_NAME;
            })
            .map(cacheName => {
              console.log('删除旧缓存:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        // 立即接管所有客户端
        return self.clients.claim();
      })
  );
});

// 网络请求拦截
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 跳过非 GET 请求
  if (request.method !== 'GET') {
    return;
  }
  
  // 跳过外部域名请求（除了字体）
  if (url.origin !== location.origin && !url.hostname.includes('googleapis.com')) {
    return;
  }
  
  event.respondWith(
    handleRequest(request)
  );
});

// 处理网络请求
async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // 1. 静态资源策略：缓存优先
    if (isStaticAsset(request)) {
      return await cacheFirst(request, STATIC_CACHE);
    }
    
    // 2. API 请求策略：网络优先，缓存作为备用
    if (url.pathname.startsWith('/api/')) {
      return await networkFirst(request, DYNAMIC_CACHE);
    }
    
    // 3. 页面请求策略：网络优先
    if (isPageRequest(request)) {
      return await networkFirst(request, DYNAMIC_CACHE);
    }
    
    // 4. 其他资源：网络优先
    return await networkFirst(request, DYNAMIC_CACHE);
    
  } catch (error) {
    console.error('请求处理失败:', error);
    
    // 如果是页面请求失败，返回离线页面
    if (isPageRequest(request)) {
      return await caches.match('/') || new Response('离线访问不可用');
    }
    
    // 其他请求失败，返回错误响应
    return new Response('网络错误', { status: 503 });
  }
}

// 缓存优先策略
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    // 后台更新缓存
    updateCacheInBackground(request, cache);
    return cached;
  }
  
  // 缓存未命中，从网络获取
  const response = await fetch(request);
  
  if (response.ok) {
    cache.put(request, response.clone());
  }
  
  return response;
}

// 网络优先策略
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      // 缓存成功的响应
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // 网络失败，尝试从缓存获取
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    throw error;
  }
}

// 后台更新缓存
async function updateCacheInBackground(request, cache) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response);
    }
  } catch (error) {
    console.warn('后台缓存更新失败:', error);
  }
}

// 判断是否为静态资源
function isStaticAsset(request) {
  const url = new URL(request.url);
  return STATIC_ASSETS.some(asset => url.pathname === asset) ||
         /\\.(js|css|png|jpg|jpeg|svg|woff2?)$/i.test(url.pathname);
}

// 判断是否为页面请求
function isPageRequest(request) {
  return request.destination === 'document' ||
         request.headers.get('accept')?.includes('text/html');
}

// 消息监听
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CACHE_URLS':
      cacheUrls(payload.urls);
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches();
      break;
      
    default:
      console.log('未知消息类型:', type);
  }
});

// 缓存指定 URL
async function cacheUrls(urls) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        await cache.put(url, response);
      }
    } catch (error) {
      console.warn(`缓存 ${url} 失败:`, error);
    }
  }
}

// 清理所有缓存
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
  console.log('所有缓存已清理');
}"