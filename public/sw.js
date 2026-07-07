// public/sw.js
// Service Worker untuk Push Notification

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim())
})

// 🔥 TERIMA PUSH NOTIFICATION
self.addEventListener('push', (event) => {
  let data = {}
  
  try {
    if (event.data) {
      data = event.data.json()
    }
  } catch (e) {
    data = {
      title: 'Notifikasi',
      body: 'Ada notifikasi baru',
      icon: '/icon-192x192.png',
    }
  }

  const options = {
    body: data.body || 'Ada notifikasi baru',
    icon: data.icon || '/icon-192x192.png',
    badge: data.badge || '/icon-192x192.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/admin',
      orderId: data.orderId || null,
      bookingId: data.bookingId || null,
    },
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'Lihat Detail',
      },
      {
        action: 'close',
        title: 'Tutup',
      },
    ],
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Notifikasi', options)
  )
})

// 🔥 KLIK NOTIFICATION
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const url = event.notification.data?.url || '/admin'
  const orderId = event.notification.data?.orderId
  const bookingId = event.notification.data?.bookingId

  let targetUrl = url
  if (orderId) {
    targetUrl = `/admin/orders/${orderId}`
  } else if (bookingId) {
    targetUrl = `/admin/bookings/${bookingId}`
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Jika sudah ada tab yang terbuka, fokus ke tab itu
        for (const client of clientList) {
          if (client.url.includes(targetUrl) && 'focus' in client) {
            return client.focus()
          }
        }
        // Jika tidak ada, buka tab baru
        if (clients.openWindow) {
          return clients.openWindow(targetUrl)
        }
      })
  )
})