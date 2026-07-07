// src/lib/push/server.ts
// Server-side utility untuk Push Notification

import webpush from 'web-push'
import { prisma } from '../prisma'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY
const VAPID_SUBJECT = process.env.NEXT_PUBLIC_VAPID_SUBJECT

// Setup VAPID
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY && VAPID_SUBJECT) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
} else {
  console.warn('⚠️ VAPID keys not configured. Push notifications will not work.')
}

export interface PushNotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  url?: string
  orderId?: string
  bookingId?: string
}

/**
 * Dapatkan subscription dari database
 */
export async function getAdminSubscription() {
  try {
    // Cari subscription untuk admin
    // Asumsi: userId = 'admin' atau ambil dari user pertama dengan role ADMIN/SUPER_ADMIN
    const adminUser = await prisma.user.findFirst({
      where: {
        role: { in: ['SUPER_ADMIN', 'ADMIN'] },
        isActive: true,
      },
      select: { id: true },
    })

    if (!adminUser) {
      console.warn('⚠️ No admin user found')
      return null
    }

    const subscription = await prisma.pushSubscription.findUnique({
      where: { userId: adminUser.id },
    })

    if (!subscription) {
      console.warn('⚠️ No push subscription found for admin')
      return null
    }

    return {
      userId: adminUser.id,
      subscription: JSON.parse(subscription.subscription),
    }
  } catch (error) {
    console.error('Error getting admin subscription:', error)
    return null
  }
}

/**
 * Kirim push notification ke admin
 */
export async function sendPushToAdmin(
  payload: PushNotificationPayload
): Promise<boolean> {
  try {
    const adminSub = await getAdminSubscription()

    if (!adminSub) {
      console.warn('⚠️ No admin subscription available')
      return false
    }

    const subscription = adminSub.subscription

    const notificationPayload = {
      title: payload.title || 'Notifikasi',
      body: payload.body || '',
      icon: payload.icon || '/icon-192x192.png',
      badge: payload.badge || '/icon-192x192.png',
      url: payload.url || '/admin',
      orderId: payload.orderId || null,
      bookingId: payload.bookingId || null,
    }

    await webpush.sendNotification(
      subscription,
      JSON.stringify(notificationPayload)
    )

    console.log('✅ Push notification sent to admin')
    return true
  } catch (error) {
    console.error('❌ Failed to send push notification:', error)
    return false
  }
}

/**
 * Kirim push notification ke semua admin yang subscribe
 */
export async function sendPushToAllAdmins(
  payload: PushNotificationPayload
): Promise<{ success: boolean; sent: number; failed: number }> {
  try {
    // Cari semua admin
    const adminUsers = await prisma.user.findMany({
      where: {
        role: { in: ['SUPER_ADMIN', 'ADMIN'] },
        isActive: true,
      },
      select: { id: true },
    })

    let sent = 0
    let failed = 0

    for (const admin of adminUsers) {
      try {
        const subscription = await prisma.pushSubscription.findUnique({
          where: { userId: admin.id },
        })

        if (!subscription) continue

        const sub = JSON.parse(subscription.subscription)

        await webpush.sendNotification(
          sub,
          JSON.stringify({
            title: payload.title || 'Notifikasi',
            body: payload.body || '',
            icon: payload.icon || '/icon-192x192.png',
            badge: payload.badge || '/icon-192x192.png',
            url: payload.url || '/admin',
            orderId: payload.orderId || null,
            bookingId: payload.bookingId || null,
          })
        )

        sent++
      } catch (error) {
        failed++
        console.error(`Failed to send to admin ${admin.id}:`, error)
      }
    }

    return { success: true, sent, failed }
  } catch (error) {
    console.error('Error sending to all admins:', error)
    return { success: false, sent: 0, failed: 0 }
  }
}