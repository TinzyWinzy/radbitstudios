// Radbit SME Hub — Service Worker
const CACHE_VERSION = 'v1';
const STATIC_CACHE = `radbit-static-${CACHE_VERSION}`;
const API_CACHE = `radbit-api-${CACHE_VERSION}`;

const STATIC_ASSETS = ['/offline'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== STATIC_CACHE && n !== API_CACHE).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  if (url.pathname.startsWith('/_next/static')) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (url.pathname.startsWith('/api/')) {
    if (url.pathname.includes('/api/assessment')) {
      event.respondWith(networkFirstWithTimeout(request, 5000));
      return;
    }
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      networkFirstWithTimeout(request).catch(() => caches.match('/'))
    );
    return;
  }

  event.respondWith(networkFirstWithTimeout(request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return caches.match('/');
  }
}

async function networkFirstWithTimeout(request, timeoutMs = 5000) {
  const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeoutMs));
  try {
    const response = await Promise.race([fetch(request), timeout]);
    if (response.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response(JSON.stringify({ error: 'Offline' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(API_CACHE);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) { cache.put(request, response.clone()); }
    return response;
  }).catch(() => cached);
  return cached || fetchPromise;
}

// Background Sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-assessment') event.waitUntil(syncQueue('pending-assessments', '/api/assessment/submit'));
  if (event.tag === 'sync-community-post') event.waitUntil(syncQueue('pending-posts', '/api/community/posts'));
});

async function syncQueue(storeName, endpoint) {
  const db = await openDB();
  const items = await db.getAll(storeName);
  for (const item of items) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item.data) });
      if (res.ok) await db.delete(storeName, item.id);
    } catch (e) { console.error('Sync failed', e); }
  }
}

async function openDB() {
  return new Promise((resolve) => {
    const r = indexedDB.open('radbit-sync-queue', 1);
    r.onupgradeneeded = (e) => {
      ['pending-assessments', 'pending-posts', 'pending-ai-requests'].forEach((n) => {
        if (!e.target.result.objectStoreNames.contains(n)) e.target.result.createObjectStore(n, { keyPath: 'id' });
      });
    };
    r.onsuccess = () => resolve(r.result);
  });
}
