// Background Sync Manager for StrandPro - DISABLED FOR HOSTINGER DEPLOYMENT
class BackgroundSyncManager {
  constructor() {
    console.log('[Sync] Background sync disabled for deployment');
    // Don't initialize anything
    return;
  }

  async init() {
    // Initialize IndexedDB
    await this.initDB();
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('[Sync] Connection restored, triggering sync');
      this.triggerSync();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('[Sync] Connection lost');
    });

    // Periodic sync when online
    setInterval(() => {
      if (this.isOnline) {
        this.triggerSync();
      }
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        console.log('[Sync] IndexedDB initialized');
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object stores for different data types
        if (!db.objectStoreNames.contains('appointments')) {
          db.createObjectStore('appointments', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('inventory')) {
          db.createObjectStore('inventory', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('revenue')) {
          db.createObjectStore('revenue', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('staff')) {
          db.createObjectStore('staff', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
        }
        
        console.log('[Sync] IndexedDB schema created');
      };
    });
  }

  // Add data to sync queue
  async addToSyncQueue(dataType, data, action = 'update') {
    try {
      const transaction = this.db.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      
      const syncItem = {
        dataType,
        data,
        action,
        timestamp: Date.now(),
        retryCount: 0
      };
      
      await store.add(syncItem);
      console.log(`[Sync] Added ${dataType} to sync queue`);
      
      // Try to sync immediately if online
      if (this.isOnline) {
        this.triggerSync();
      }
    } catch (error) {
      console.error('[Sync] Failed to add to sync queue:', error);
    }
  }

  // Save data locally and mark for sync
  async saveLocal(dataType, data, action = 'update') {
    try {
      // Mark data as needing sync
      const dataWithSync = {
        ...data,
        needsSync: true,
        lastModified: Date.now()
      };

      // Save to local store
      const transaction = this.db.transaction([dataType], 'readwrite');
      const store = transaction.objectStore(dataType);
      await store.put(dataWithSync);

      // Add to sync queue
      await this.addToSyncQueue(dataType, data, action);
      
      console.log(`[Sync] Saved ${dataType} locally for sync`);
    } catch (error) {
      console.error(`[Sync] Failed to save ${dataType} locally:`, error);
    }
  }

  // Trigger background sync
  async triggerSync() {
    if (!this.isOnline) {
      console.log('[Sync] Offline, sync postponed');
      return;
    }

    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('salon-data-sync');
        console.log('[Sync] Background sync registered');
      } catch (error) {
        console.error('[Sync] Failed to register background sync:', error);
        // Fallback to immediate sync
        this.immediateSync();
      }
    } else {
      console.log('[Sync] Background sync not supported, using immediate sync');
      this.immediateSync();
    }
  }

  // Immediate sync fallback
  async immediateSync() {
    if (!this.isOnline) return;

    try {
      const syncQueue = await this.getSyncQueue();
      
      for (const item of syncQueue) {
        try {
          await this.syncItem(item);
          await this.removeFromSyncQueue(item.id);
        } catch (error) {
          console.error(`[Sync] Failed to sync item ${item.id}:`, error);
          await this.incrementRetryCount(item.id);
        }
      }
      
      console.log('[Sync] Immediate sync completed');
    } catch (error) {
      console.error('[Sync] Immediate sync failed:', error);
    }
  }

  // Sync individual item
  async syncItem(item) {
    const { dataType, data, action } = item;
    
    let url = `/api/${dataType}`;
    let method = 'POST';
    
    if (action === 'update' && data.id) {
      url += `/${data.id}`;
      method = 'PUT';
    } else if (action === 'delete' && data.id) {
      url += `/${data.id}`;
      method = 'DELETE';
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Update local data to remove sync flag
    if (action !== 'delete') {
      const dataWithoutSync = { ...data, needsSync: false };
      const transaction = this.db.transaction([dataType], 'readwrite');
      const store = transaction.objectStore(dataType);
      await store.put(dataWithoutSync);
    }

    console.log(`[Sync] Successfully synced ${dataType} item`);
  }

  // Get sync queue
  async getSyncQueue() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['syncQueue'], 'readonly');
      const store = transaction.objectStore('syncQueue');
      const request = store.getAll();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  // Remove item from sync queue
  async removeFromSyncQueue(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      const request = store.delete(id);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // Increment retry count
  async incrementRetryCount(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      
      const getRequest = store.get(id);
      getRequest.onerror = () => reject(getRequest.error);
      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          item.retryCount = (item.retryCount || 0) + 1;
          
          // Remove item if too many retries
          if (item.retryCount >= 3) {
            store.delete(id);
            console.log(`[Sync] Removed item ${id} after too many retries`);
          } else {
            store.put(item);
          }
        }
        resolve();
      };
    });
  }

  // Get local data
  async getLocalData(dataType) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([dataType], 'readonly');
      const store = transaction.objectStore(dataType);
      const request = store.getAll();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  // Check if there are pending syncs
  async hasPendingSyncs() {
    const queue = await this.getSyncQueue();
    return queue.length > 0;
  }

  // Get sync status
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      dbReady: !!this.db,
      supported: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype
    };
  }
}

// Initialize background sync manager
window.backgroundSync = new BackgroundSyncManager();

// Global functions for easy access
window.saveLocal = (dataType, data, action) => window.backgroundSync.saveLocal(dataType, data, action);
window.triggerSync = () => window.backgroundSync.triggerSync();
window.getSyncStatus = () => window.backgroundSync.getSyncStatus();

console.log('[Sync] Background sync manager loaded');
