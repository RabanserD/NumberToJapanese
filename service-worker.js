self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open('number-to-japanese-converter').then((cache) => {
        return cache.addAll([
          '/',
          '/index.html',
          '/style.css',
          '/script.js',
          '/manifest.json',
          'ios/128.png',
          'ios/144.png',
          'ios/152.png',
          'ios/180.png',
          'ios/192.png',
          'ios/256.png',
          'ios/512.png',
          'ios/1024.png'
        ]);
      })
    );
  });
  
  self.addEventListener('fetch', (event) => {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request);
      })
    );
  });
  