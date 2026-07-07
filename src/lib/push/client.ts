// src/lib/push/client.ts
// Client-side utility untuk Push Notification

/**
 * Cek apakah browser mendukung Push Notification
 */
export function isPushSupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
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
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    })
    console.log('✅ Service Worker registered')
    return registration
  } catch (error) {
    console.error('❌ Service Worker registration failed:', error)
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

    // Convert VAPID public key ke Uint8Array
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey)

    // 🔥 PERBAIKAN: Cast ke BufferSource
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey as BufferSource,
    })

    console.log('✅ Subscribed to push notifications')
    return subscription
  } catch (error) {
    console.error('❌ Failed to subscribe:', error)
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
      const result = await subscription.unsubscribe()
      console.log('✅ Unsubscribed from push notifications')
      return result
    }
    return false
  } catch (error) {
    console.error('❌ Failed to unsubscribe:', error)
    return false
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
      throw new Error('Failed to save subscription')
    }

    console.log('✅ Subscription saved to server')
    return true
  } catch (error) {
    console.error('❌ Failed to save subscription:', error)
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

    if (!response.ok) {
      throw new Error('Failed to delete subscription')
    }

    console.log('✅ Subscription deleted from server')
    return true
  } catch (error) {
    console.error('❌ Failed to delete subscription:', error)
    return false
  }
}

/**
 * Helper: base64 URL ke Uint8Array
 * 🔥 PERBAIKAN: Gunakan Buffer untuk kompatibilitas
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  // Tambahkan padding jika diperlukan
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  
  // Decode base64 ke string
  const rawData = atob(base64)
  
  // Konversi ke Uint8Array
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  
  return outputArray
}