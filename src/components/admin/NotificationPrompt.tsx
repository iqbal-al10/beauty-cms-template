// src/components/admin/NotificationPrompt.tsx
'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  isPushSupported,
  registerServiceWorker,
  getSubscription,
  subscribeToPush,
  unsubscribeFromPush,
  saveSubscription,
  deleteSubscription,
} from '@/lib/push/client'

export default function NotificationPrompt() {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    // Cek support
    if (isPushSupported()) {
      setIsSupported(true)
      checkSubscriptionStatus()
    }
  }, [])

  const checkSubscriptionStatus = async () => {
    try {
      // Cek permission
      setPermission(Notification.permission)

      // Register SW
      const registration = await registerServiceWorker()
      if (!registration) return

      // Cek subscription
      const subscription = await getSubscription()
      setIsSubscribed(!!subscription)

      // Cek di server
      const res = await fetch('/api/push/subscribe')
      if (res.ok) {
        const data = await res.json()
        setIsSubscribed(data.subscribed)
      }
    } catch (error) {
      console.error('Error checking subscription:', error)
    }
  }

  const handleSubscribe = async () => {
    if (!isSupported) {
      toast.error('Browser tidak mendukung notifikasi')
      return
    }

    setLoading(true)

    try {
      // 1. Minta izin notifikasi
      let permissionResult = Notification.permission

      if (permissionResult === 'default') {
        permissionResult = await Notification.requestPermission()
        setPermission(permissionResult)
      }

      if (permissionResult !== 'granted') {
        toast.error('Izin notifikasi ditolak. Silakan aktifkan di pengaturan browser.')
        return
      }

      // 2. Register Service Worker
      const registration = await registerServiceWorker()
      if (!registration) {
        toast.error('Gagal register service worker')
        return
      }

      // 3. Subscribe ke push
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!publicKey) {
        toast.error('VAPID public key tidak ditemukan')
        return
      }

      const subscription = await subscribeToPush(publicKey)
      if (!subscription) {
        toast.error('Gagal subscribe ke push notification')
        return
      }

      // 4. Simpan ke server
      const saved = await saveSubscription(subscription)
      if (!saved) {
        toast.error('Gagal menyimpan subscription')
        return
      }

      setIsSubscribed(true)
      toast.success('✅ Notifikasi berhasil diaktifkan!')

      // Kirim test notification
      await fetch('/api/push/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Notifikasi berhasil diaktifkan! 🎉' }),
      })
    } catch (error) {
      console.error('Error subscribing:', error)
      toast.error('Gagal mengaktifkan notifikasi')
    } finally {
      setLoading(false)
    }
  }

  const handleUnsubscribe = async () => {
    setLoading(true)

    try {
      // 1. Unsubscribe dari browser
      const unsubscribed = await unsubscribeFromPush()

      // 2. Hapus dari server
      await deleteSubscription()

      setIsSubscribed(false)
      toast.success('Notifikasi dinonaktifkan')
    } catch (error) {
      console.error('Error unsubscribing:', error)
      toast.error('Gagal menonaktifkan notifikasi')
    } finally {
      setLoading(false)
    }
  }

  if (!isSupported) {
    return (
      <div className="text-xs text-gray-400 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        Notifikasi tidak didukung
      </div>
    )
  }

  if (isSubscribed) {
    return (
      <button
        onClick={handleUnsubscribe}
        disabled={loading}
        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <CheckCircle className="w-4 h-4" />
        )}
        Notifikasi Aktif
      </button>
    )
  }

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition-colors disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Bell className="w-4 h-4" />
      )}
      Aktifkan Notifikasi
    </button>
  )
}