// Service Worker 用于修改请求头
const CACHE_NAME = 'browser-cache-v1';
const UA_OVERRIDE_HEADER = 'x-ua-override';

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll([]))
    );
});

self.addEventListener('fetch', event => {
    // 检查是否有UA覆盖头
    const uaOverride = event.request.headers.get(UA_OVERRIDE_HEADER);
    
    if (uaOverride) {
        // 克隆请求以修改头信息
        const newHeaders = new Headers(event.request.headers);
        newHeaders.delete(UA_OVERRIDE_HEADER);
        newHeaders.set('User-Agent', uaOverride);
        
        const modifiedRequest = new Request(event.request, {
            headers: newHeaders,
            redirect: 'follow'
        });
        
        event.respondWith(
            fetch(modifiedRequest)
                .catch(err => {
                    console.error('Fetch失败:', err);
                    throw err;
                })
        );
    } else {
        // 正常处理请求
        event.respondWith(
            fetch(event.request)
                .catch(() => caches.match(event.request))
        );
    }
});

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SET_UA') {
        // 处理UA设置消息
        self.currentUA = event.data.ua;
    }
});

self.addEventListener('activate', event => {
    event.waitUntil(clients.claim());
});
