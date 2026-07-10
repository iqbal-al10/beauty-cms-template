// src/lib/push/client.ts
// Client-side utility untuk Push Notification

/**
 * Cek apakah browser mendukung Push Notification
 */
export function isPushSupported(): boolean {
  const supported = (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
  return supported
}

/**
 * Register Service Worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) {
    console.warn('Push notification tidak didukung')
    return null
  }

  try {
    const existingReg = await navigator.serviceWorker.getRegistration('/sw.js')
    if (existingReg) {
      return existingReg
    }

    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    })

    await navigator.serviceWorker.ready

    return registration
  } catch (error) {
    console.error('Service Worker registration failed:', error)
    return null
  }
}

/**
 * Dapatkan subscription yang sudah ada
 */
export async function getSubscription(): Promise<PushSubscription | null> {
  try {
    const registration = await navigator.serviceWorker.ready
    return await registration.pushManager.getSubscription()
  } catch (error) {
    console.error('Error getting subscription:', error)
    return null
  }
}

/**
 * Subscribe ke push notification
 */
export async function subscribeToPush(
  vapidPublicKey: string
): Promise<PushSubscription | null> {
  try {
    const registration = await navigator.serviceWorker.ready

    if (!registration) {
      console.error('Service Worker not ready')
      return null
    }

    // 🔥 PERBAIKAN: Hapus subscription lama dulu (bersih-bersih)
    const existingSubscription = await registration.pushManager.getSubscription()
    if (existingSubscription) {
      await existingSubscription.unsubscribe()
      console.log('🗑️ Old subscription removed')
    }

    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey)

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey as unknown as BufferSource,
    })

    console.log('✅ Subscribed to push notifications')
    return subscription
  } catch (error: any) {
    console.error('Failed to subscribe:', error.message)
    return null
  }
}

/**
 * Unsubscribe dari push notification
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const subscription = await getSubscription()
    if (subscription) {
      await subscription.unsubscribe()
      console.log('✅ Unsubscribed from push notifications')
      return true
    }
    // 🔥 PERBAIKAN: Kalau tidak ada subscription, anggap sukses
    console.log('⚠️ No subscription to unsubscribe')
    return true
  } catch (error) {
    console.error('Failed to unsubscribe:', error)
    // 🔥 PERBAIKAN: Kalau error, tetap return true agar UI tetap sinkron
    return true
  }
}

/**
 * Simpan subscription ke server
 */
export async function saveSubscription(
  subscription: PushSubscription
): Promise<boolean> {
  try {
    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Server error:', response.status, errorData)
      return false
    }

    console.log('✅ Subscription saved to server')
    return true
  } catch (error) {
    console.error('Failed to save subscription:', error)
    return false
  }
}

/**
 * Hapus subscription dari server
 */
export async function deleteSubscription(): Promise<boolean> {
  try {
    const response = await fetch('/api/push/subscribe', {
      method: 'DELETE',
    })

    // 🔥 PERBAIKAN: Anggap sukses meskipun 404 (subscription sudah tidak ada)
    if (!response.ok && response.status !== 404) {
      console.error('Server error:', response.status)
      return false
    }

    console.log('✅ Subscription deleted from server')
    return true
  } catch (error) {
    console.error('Failed to delete subscription:', error)
    return true
  }
}

/**
 * Helper: base64 URL ke Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  if (!base64String) {
    console.error('Empty VAPID key')
    return new Uint8Array(0)
  }

  const trimmed = base64String.trim()
  const padding = '='.repeat((4 - (trimmed.length % 4)) % 4)
  const base64 = (trimmed + padding).replace(/-/g, '+').replace(/_/g, '/')

  try {
    const rawData = atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  } catch (error) {
    console.error('Failed to decode VAPID key:', error)
    return new Uint8Array(0)
  }
}