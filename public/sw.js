// PWA Service Worker — Radbit SME Hub
// Strategy: Cache-first for shell, Stale-while-revalidate for API, Background Sync for mutations

const CACHE_VERSION = 'v1';
const STATIC_CACHE = `radbit-static-${CACHE_VERSION}`;
const API_CACHE = `radbit-api-${CACHE_VERSION}`;
const ASSET_CACHE = `radbit-assets-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/offline',
  '/_next/static/chunks/polyfills-*.js',
];

// Install: pre-cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Activate immediately without waiting for reload
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== API_CACHE && name !== ASSET_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Helper: network-first with timeout for API calls
async function networkFirstWithTimeout(request, timeoutMs = 5000) {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Network timeout')), timeoutMs)
  );

  try {
    const response = await Promise.race([fetch(request), timeoutPromise]);
    if (response.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    return cached || new Response(
      JSON.stringify({ error: 'You are offline. This data will sync when connectivity resumes.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Helper: stale-while-revalidate for reads
async function staleWhileRevalidate(request) {
  const cache = await caches.open(API_CACHE);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cached);

  return cached || fetchPromise;
}

// Helper: cache-first for static assets
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(ASSET_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return caches.match('/offline');
  }
}

// Fetch: route to appropriate strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (handled by Background Sync)
  if (request.method !== 'GET') return;

  // Skip Chrome extension requests
  if (!url.protocol.startsWith('http')) return;

  // Static assets: _next/static, fonts, icons
  if (url.pathname.startsWith('/_next/static') || url.pathname.startsWith('/fonts') || url.pathname.startsWith('/icons')) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // API data: stale-while-revalidate
  if (url.pathname.startsWith('/api/')) {
    // Assessments are user-specific: network-first with timeout
    if (url.pathname.includes('/api/assessment')) {
      event.respondWith(networkFirstWithTimeout(request, 5000));
      return;
    }

    // Tenders, Community: stale-while-revalidate
    if (url.pathname.includes('/api/tenders') || url.pathname.includes('/api/community')) {
      event.respondWith(staleWhileRevalidate(request));
      return;
    }

    // Default API: network-first
    event.respondWith(networkFirstWithTimeout(request));
    return;
  }

  // HTML pages: cache-first (app shell)
  if (request.mode === 'navigate') {
    event.respondWith(
      networkFirstWithTimeout(request).catch(() => caches.match('/offline'))
    );
    return;
  }

  // Everything else: network-first
  event.respondWith(networkFirstWithTimeout(request));
});

// Background Sync for offline mutations
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-assessment') {
    event.waitUntil(syncAssessment());
  }
  if (event.tag === 'sync-community-post') {
    event.waitUntil(syncCommunityPost());
  }
  if (event.tag === 'sync-ai-request') {
    event.waitUntil(syncAiRequest());
  }
});

async function syncAssessment() {
  const db = await openIndexedDB();
  const pending = await db.getAll('pending-assessments');

  for (const item of pending) {
    try {
      const response = await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.data),
      });
      if (response.ok) {
        await db.delete('pending-assessments', item.id);
        // Notify all clients
        const clients = await self.clients.matchAll();
        clients.forEach((client) => {
          client.postMessage({ type: 'SYNC_SUCCESS', id: item.id });
        });
      }
    } catch (error) {
      console.error('Sync failed for assessment', item.id, error);
    }
  }
}

async function syncCommunityPost() {
  const db = await openIndexedDB();
  const pending = await db.getAll('pending-posts');

  for (const item of pending) {
    try {
      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.data),
      });
      if (response.ok) {
        await db.delete('pending-posts', item.id);
      }
    } catch (error) {
      console.error('Sync failed for post', item.id, error);
    }
  }
}

async function syncAiRequest() {
  const db = await openIndexedDB();
  const pending = await db.getAll('pending-ai-requests');

  for (const item of pending) {
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.data),
      });
      if (response.ok) {
        await db.delete('pending-ai-requests', item.id);
        const result = await response.json();
        const clients = await self.clients.matchAll();
        clients.forEach((client) => {
          client.postMessage({ type: 'AI_RESULT', id: item.id, data: result });
        });
      }
    } catch (error) {
      console.error('Sync failed for AI request', item.id, error);
    }
  }
}

// IndexedDB helper within SW scope
async function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('radbit-sync-queue', 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending-assessments')) {
        db.createObjectStore('pending-assessments', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('pending-posts')) {
        db.createObjectStore('pending-posts', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('pending-ai-requests')) {
        db.createObjectStore('pending-ai-requests', { keyPath: 'id' });
      }
    };
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

// Push notification handler
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};

  const options = {
    body: data.body || 'New update from Radbit SME Hub',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' },
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Radbit SME Hub', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});
