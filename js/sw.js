const CACHE_NAME = 'strandpro-v1';
const STATIC_CACHE = 'strandpro-static-v1';
const DYNAMIC_CACHE = 'strandpro-dynamic-v1';

// Static assets to cache
const STATIC_ASSETS = [
  './',
  './strandpro.html',
  './strandprotx.html',
  './offline.html',
  './manifest.json',
  './sw.js',
  './i18n-translations.js',
  './pwa-install.js',
  './icons/stradpro-logo.jpeg',
  './icons/mobile-1.png',
  './icons/icon-72x72.png',
  './icons/icon-96x96.png',
  './icons/icon-128x128.png',
  './icons/icon-152x152.png',
  './icons/icon-192x192.png',
  './icons/icon-384x384.png',
  './icons/icon-512x512.png',
  './screenshots/desktop-1.png',
  './screenshots/mobile-1.png'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('[SW] Installing Service Worker');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating Service Worker');
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Strategy for static assets (cache first)
  if (STATIC_ASSETS.some(asset => url.pathname === asset.replace('./', '/')) || 
      url.pathname.startsWith('/icons/')) {
    event.respondWith(
      caches.match(request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(request)
            .then(response => {
              // Cache successful responses
              if (response.ok) {
                const responseClone = response.clone();
                caches.open(STATIC_CACHE)
                  .then(cache => cache.put(request, responseClone));
              }
              return response;
            })
            .catch(() => {
              // Return cached version if network fails
              return caches.match(request);
            });
        })
    );
    return;
  }

  // Strategy for HTML pages (network first, fallback to cache)
  if (request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then(cache => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => {
          // Fallback to cached version or offline page
          return caches.match(request) || caches.match('./offline.html');
        })
    );
    return;
  }

  // Default strategy for other requests (network first)
  event.respondWith(
    fetch(request)
      .then(response => {
        // Cache successful responses for dynamic content
        if (response.ok && request.destination === 'script' || request.destination === 'style') {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE)
            .then(cache => cache.put(request, responseClone));
        }
        return response;
      })
      .catch(() => {
        // Try cache for scripts and styles
        if (request.destination === 'script' || request.destination === 'style') {
          return caches.match(request);
        }
        // For other requests, just fail
        return Promise.reject('Network request failed');
      })
  );
});
// Push notification event
self.addEventListener('push', event => {
  console.log('[SW] Push notification received');
  const data = event.data ? event.data.json() : { 
    title: 'StrandPro', 
    body: 'You have a new notification.' 
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || './icons/icon-192x192.png',
      badge: data.badge || './icons/icon-72x72.png',
      tag: data.tag || 'strandpro',
      data: data.url || './',
      requireInteraction: false,
      silent: false
    })
  );
});

// Notification click event
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification clicked');
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then(clientList => {
        // Focus existing window if open
        for (const client of clientList) {
          if (client.url === event.notification.data && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window if none exists
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data || './');
        }
      })
  );
});

// Background Sync for Salon Data
self.addEventListener('sync', event => {
  console.log('[SW] Background sync event:', event.tag);
  
  if (event.tag === 'salon-data-sync') {
    event.waitUntil(syncSalonData());
  } else if (event.tag === 'appointments-sync') {
    event.waitUntil(syncAppointments());
  } else if (event.tag === 'inventory-sync') {
    event.waitUntil(syncInventory());
  } else if (event.tag === 'revenue-sync') {
    event.waitUntil(syncRevenue());
  }
});

// Sync salon data with server
async function syncSalonData() {
  console.log('[SW] Starting salon data sync');
  
  try {
    // Get all pending data from IndexedDB
    const pendingData = await getPendingSyncData();
    
    if (pendingData.length === 0) {
      console.log('[SW] No pending data to sync');
      return;
    }
    
    // Sync each type of data
    const syncPromises = [];
    
    if (pendingData.includes('appointments')) {
      syncPromises.push(syncAppointments());
    }
    if (pendingData.includes('inventory')) {
      syncPromises.push(syncInventory());
    }
    if (pendingData.includes('revenue')) {
      syncPromises.push(syncRevenue());
    }
    if (pendingData.includes('staff')) {
      syncPromises.push(syncStaff());
    }
    
    await Promise.all(syncPromises);
    
    // Clear synced data
    await clearSyncedData(pendingData);
    
    // Show success notification
    await showSyncNotification('All data synced successfully!', 'success');
    
    console.log('[SW] Salon data sync completed');
  } catch (error) {
    console.error('[SW] Sync failed:', error);
    await showSyncNotification('Sync failed. Will retry later.', 'error');
    
    // Retry sync later
    await retrySync();
  }
}

// Sync appointments - DISABLED FOR HOSTINGER DEPLOYMENT
async function syncAppointments() {
  console.log('[SW] Appointments sync disabled for deployment');
  return Promise.resolve();
}

// Sync inventory - DISABLED FOR HOSTINGER DEPLOYMENT
async function syncInventory() {
  console.log('[SW] Inventory sync disabled for deployment');
  return Promise.resolve();
}

// Sync revenue data - DISABLED FOR HOSTINGER DEPLOYMENT
async function syncRevenue() {
  console.log('[SW] Revenue sync disabled for deployment');
  return Promise.resolve();
}

// Sync staff data - DISABLED FOR HOSTINGER DEPLOYMENT
async function syncStaff() {
  console.log('[SW] Staff sync disabled for deployment');
  return Promise.resolve();
}

// Helper functions for IndexedDB operations
async function getOfflineData(storeName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('StrandProDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const getRequest = store.getAll();
      
      getRequest.onerror = () => reject(getRequest.error);
      getRequest.onsuccess = () => resolve(getRequest.result);
    };
  });
}

async function updateOfflineData(storeName, data) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('StrandProDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const putRequest = store.put(data);
      
      putRequest.onerror = () => reject(putRequest.error);
      putRequest.onsuccess = () => resolve(putRequest.result);
    };
  });
}

async function getPendingSyncData() {
  // This would check what data needs syncing
  // For now, return all data types
  return ['appointments', 'inventory', 'revenue', 'staff'];
}

async function clearSyncedData(dataTypes) {
  // Clear sync flags for synced data
  console.log('[SW] Cleared sync flags for:', dataTypes);
}

async function showSyncNotification(message, type = 'info') {
  const icon = type === 'success' ? './icons/icon-192x192.png' : './icons/icon-192x192.png';
  
  return self.registration.showNotification('StrandPro Sync', {
    body: message,
    icon: icon,
    badge: './icons/icon-72x72.png',
    tag: 'sync-notification',
    data: './strandpro.html'
  });
}

async function retrySync() {
  // Register a new sync event to retry later
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    try {
      const registration = await self.registration.sync.register('salon-data-sync');
      console.log('[SW] Retry sync registered');
    } catch (error) {
      console.error('[SW] Failed to register retry sync:', error);
    }
  }
}
