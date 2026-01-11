// Service Worker v2.0 dengan Auto-Update
// PENTING: Naikkan versi setiap ada perubahan
const CACHE_VERSION = 'qm-portal-v2.0.1';
const CACHE_NAME = `${CACHE_VERSION}-static`;

// File yang di-cache
const urlsToCache = [
  '/Landing-page/',
  '/Landing-page/index.html',
  '/Landing-page/logo.png',
  '/Landing-page/background.jpg'
];

// Install - cache semua resources
self.addEventListener('install', event => {
  console.log('[SW] Installing version:', CACHE_VERSION);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Skip waiting agar SW baru langsung aktif
        return self.skipWaiting();
      })
  );
});

// Activate - bersihkan cache lama
self.addEventListener('activate', event => {
  console.log('[SW] Activating version:', CACHE_VERSION);
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // Hapus semua cache yang bukan versi sekarang
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Claim semua clients agar SW baru langsung mengontrol
        return self.clients.claim();
      })
  );
});

// Fetch - strategi Network First dengan fallback ke cache
self.addEventListener('fetch', event => {
  event.respondWith(
    // Coba ambil dari network dulu
    fetch(event.request)
      .then(response => {
        // Jika berhasil, simpan ke cache dan return
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
        }
        return response;
      })
      .catch(() => {
        // Jika network gagal, gunakan cache
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Jika tidak ada di cache, return error page sederhana
            return new Response('Offline - Content not available', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Listen untuk skip waiting message dari client
self.addEventListener('message', event => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
