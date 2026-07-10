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
  console.log('🔍 Push supported:', supported)
  return supported
}

/**
 * Register Service Worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) {
    console.warn('❌ Push notification tidak didukung')
    return null
  }

  try {
    // 🔥 PERBAIKAN: Cek apakah SW sudah terdaftar
    const existingReg = await navigator.serviceWorker.getRegistration('/sw.js')
    if (existingReg) {
      console.log('✅ Service Worker already registered')
      return existingReg
    }

    // 🔥 PERBAIKAN: Register dengan scope explicit
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    })

    // 🔥 PERBAIKAN: Tunggu SW siap
    await navigator.serviceWorker.ready

    console.log('✅ Service Worker registered and ready')
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
    const subscription = await registration.pushManager.getSubscription()
    console.log('🔍 Existing subscription:', subscription ? 'YES' : 'NO')
    return subscription
  } catch (error) {
    console.error('❌ Error getting subscription:', error)
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
    // 🔥 PERBAIKAN: Tunggu SW benar-benar siap
    const registration = await navigator.serviceWorker.ready

    if (!registration) {
      console.error('❌ Service Worker not ready')
      return null
    }

    console.log('🔑 VAPID key length:', vapidPublicKey?.length || 0)

    // Convert VAPID public key ke Uint8Array
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey)

    console.log('🔑 Converted key length:', applicationServerKey.length)

    // 🔥 PERBAIKAN: Subscribe dengan error handling detail
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey,
    })

    console.log('✅ Subscribed to push notifications')
    console.log('📌 Endpoint:', subscription.endpoint.substring(0, 50) + '...')
    return subscription
  } catch (error: any) {
    console.error('❌ Failed to subscribe:', error)
    console.error('❌ Error name:', error.name)
    console.error('❌ Error message:', error.message)
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
    console.log('⚠️ No subscription to unsubscribe')
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
    console.log('💾 Saving subscription to server...')
    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ Server error:', response.status, errorData)
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
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  // 🔥 PERBAIKAN: Trim dan validasi input
  if (!base64String) {
    console.error('❌ Empty VAPID key')
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
    console.error('❌ Failed to decode VAPID key:', error)
    return new Uint8Array(0)
  }
}