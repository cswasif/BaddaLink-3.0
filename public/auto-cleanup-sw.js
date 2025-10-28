// Auto-cleanup service worker
// This runs in the background and performs cleanup every 5 seconds

const CLEANUP_INTERVAL = 5000 // 5 seconds

// Listen for messages from the main thread
self.addEventListener('message', event => {
  if (event.data.type === 'START_AUTO_CLEANUP') {
    startAutoCleanup()
  } else if (event.data.type === 'STOP_AUTO_CLEANUP') {
    stopAutoCleanup()
  }
})

let cleanupInterval = null

function startAutoCleanup() {
  if (cleanupInterval) {
    clearInterval(cleanupInterval)
  }

  console.log('Auto-cleanup started - will run every', CLEANUP_INTERVAL, 'ms')

  // Perform cleanup immediately
  performCleanup()

  // Set up interval for future cleanups
  cleanupInterval = setInterval(() => {
    console.log('Running scheduled auto-cleanup...')
    performCleanup()
  }, CLEANUP_INTERVAL)

  // Notify main thread that cleanup has started
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'AUTO_CLEANUP_STARTED',
      })
    })
  })
}

function stopAutoCleanup() {
  if (cleanupInterval) {
    clearInterval(cleanupInterval)
    cleanupInterval = null

    // Notify main thread that cleanup has stopped
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'AUTO_CLEANUP_STOPPED',
        })
      })
    })
  }
}

async function performCleanup() {
  try {
    // Clear all browser storage
    const storageTypes = ['localStorage', 'sessionStorage', 'indexedDB']

    // Clear localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.clear()
    }

    // Clear sessionStorage
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear()
    }

    // Clear IndexedDB
    if (typeof indexedDB !== 'undefined') {
      try {
        const databases = await indexedDB.databases()
        for (const db of databases) {
          if (db.name) {
            indexedDB.deleteDatabase(db.name)
          }
        }
      } catch (error) {
        console.warn('IndexedDB cleanup failed:', error)
      }
    }

    // Clear cookies
    if (typeof document !== 'undefined') {
      document.cookie.split(';').forEach(cookie => {
        const eqPos = cookie.indexOf('=')
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
        document.cookie =
          name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'
      })
    }

    // Clear cache storage
    if (typeof caches !== 'undefined') {
      try {
        const cacheNames = await caches.keys()
        for (const cacheName of cacheNames) {
          await caches.delete(cacheName)
        }
      } catch (error) {
        console.warn('Cache cleanup failed:', error)
      }
    }

    // Notify main thread that cleanup was performed
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'AUTO_CLEANUP_PERFORMED',
          timestamp: Date.now(),
        })
      })
    })
  } catch (error) {
    console.error('Auto-cleanup failed:', error)

    // Notify main thread of error
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'AUTO_CLEANUP_ERROR',
          error: error.message,
        })
      })
    })
  }
}

// Handle service worker installation
self.addEventListener('install', event => {
  console.log('Auto-cleanup service worker installed')
  self.skipWaiting() // Activate immediately
})

// Handle service worker activation
self.addEventListener('activate', event => {
  console.log('Auto-cleanup service worker activated')
  event.waitUntil(self.clients.claim()) // Take control of all pages immediately
})

// Handle periodic sync (as a fallback if intervals fail)
if ('periodicSync' in self.registration) {
  self.addEventListener('periodicsync', event => {
    if (event.tag === 'auto-cleanup') {
      event.waitUntil(performCleanup())
    }
  })
}
