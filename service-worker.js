// Nama cache unik untuk versi aplikasi Anda - NAIKKAN VERSI SETIAP ADA PERUBAHAN
const CACHE_NAME = 'qm-portal-cache-v3';
// Daftar file yang perlu di-cache untuk mode offline
const urlsToCache = [
  '/Landing-page/',
  '/Landing-page/index.html',
  '/Landing-page/logo.png',
  '/Landing-page/background.jpg'
];

// Event 'install': dipicu saat service worker diinstal
self.addEventListener('install', event => {
  // Menunggu hingga proses caching selesai
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache dibuka');
        // Menambahkan semua URL yang ditentukan ke dalam cache
        return cache.addAll(urlsToCache);
      })
  );
});

// Event 'fetch': dipicu setiap kali ada permintaan resource (misal: gambar, file)
self.addEventListener('fetch', event => {
  event.respondWith(
    // Mencari resource yang diminta di dalam cache terlebih dahulu
    caches.match(event.request)
      .then(response => {
        // Jika resource ditemukan di cache, kembalikan dari cache
        if (response) {
          return response;
        }
        // Jika tidak ditemukan, lanjutkan untuk mengambil dari jaringan
        return fetch(event.request);
      }
    )
  );
});

// Event 'activate': dipicu saat service worker baru mengambil alih
// Bagian ini penting untuk membersihkan cache lama
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Hapus cache lama jika namanya tidak sesuai dengan CACHE_NAME yang baru
            console.log('Menghapus cache lama:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
