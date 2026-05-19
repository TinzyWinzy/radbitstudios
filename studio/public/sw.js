const CACHE_NAME = 'radbit-sme-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/badge-72x72.png',
];

/// Install: precache shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

/// Activate: prune old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/// Fetch: cache-first for static, network-first for API
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET
  if (request.method !== 'GET') return;
  // Skip cross-origin
  if (url.origin !== location.origin) return;

  // API routes: network-first with offline fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static assets & pages: cache-first, stale-while-revalidate
  event.respondWith(cacheFirstStaleRevalidate(request));
});

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function cacheFirstStaleRevalidate(request) {
  const cached = await caches.match(request);
  if (cached) {
    fetch(request)
      .then((response) => {
        if (response.ok) caches.open(CACHE_NAME).then((c) => c.put(request, response));
      })
      .catch(() => {});
    return cached;
  }
  return fetch(request).then((response) => {
    if (response.ok) caches.open(CACHE_NAME).then((c) => c.put(request, response.clone()));
    return response;
  });
}

/// Background Sync: retry queued requests on reconnect
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-queued') {
    event.waitUntil(syncQueuedRequests());
  }
});

async function syncQueuedRequests() {
  const db = await openIndexedDB();
  const tx = db.transaction('queuedRequests', 'readonly');
  const store = tx.objectStore('queuedRequests');
  const requests = await store.getAll();

  for (const req of requests) {
    try {
      const response = await fetch(req.url, {
        method: req.method,
        headers: req.headers,
        body: req.body,
      });
      if (response.ok) {
        await store.delete(req.id);
      }
    } catch {
      // Will retry on next sync event
      break;
    }
  }
}

function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('RadbitSW', 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('queuedRequests')) {
        db.createObjectStore('queuedRequests', { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/// Push notification handler
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();

  event.waitUntil(
    self.registration.showNotification(data.title || 'Radbit SME Hub', {
      body: data.body || '',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: data.url ? { url: data.url } : undefined,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
