// src/lib/push/server.ts
import webpush from 'web-push'
import { prisma } from '@/lib/prisma'

// 🔥 SET VAPID DETAILS
if (process.env.VAPID_PRIVATE_KEY && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
  webpush.setVapidDetails(
    process.env.NEXT_PUBLIC_VAPID_SUBJECT || 'mailto:admin@beautystudio.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )
}

interface PushPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  url?: string
  bookingId?: string
  orderId?: string
}

/**
 * Kirim push notification ke semua admin
 */
export async function sendPushToAllAdmins(payload: PushPayload): Promise<{ sent: number; failed: number }> {
  try {
    // Ambil semua user dengan role admin
    const users = await prisma.user.findMany({
      where: {
        role: { in: ['SUPER_ADMIN', 'ADMIN'] },
        isActive: true,
      },
      select: { id: true },
    })

    const userIds = users.map((u) => u.id)

    if (userIds.length === 0) {
      console.log('Tidak ada admin yang ditemukan')
      return { sent: 0, failed: 0 }
    }

    // Ambil subscription untuk user-user tersebut
    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        userId: { in: userIds },
      },
    })

    if (subscriptions.length === 0) {
      console.log('Tidak ada admin yang subscribe')
      return { sent: 0, failed: 0 }
    }

    let sent = 0
    let failed = 0

    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icon-192x192.png',
      badge: payload.badge || '/icon-192x192.png',
      data: {
        url: payload.url || '/admin',
        bookingId: payload.bookingId,
        orderId: payload.orderId,
      },
      vibrate: [200, 100, 200],
    })

    for (const sub of subscriptions) {
      try {
        const subscription = JSON.parse(sub.subscription)
        
        await webpush.sendNotification(subscription, notificationPayload)
        sent++
        
        console.log(`✅ Push sent to user ${sub.userId}`)
      } catch (error: any) {
        console.error(`❌ Error sending push to user ${sub.userId}:`, error)
        failed++
        
        // Jika subscription expired, hapus dari database
        if (error.message && (error.message.includes('expired') || error.message.includes('410'))) {
          await prisma.pushSubscription.delete({
            where: { id: sub.id },
          })
          console.log(`🗑️ Deleted expired subscription for user ${sub.userId}`)
        }
      }
    }

    console.log(`✅ Push notification result: ${sent} sent, ${failed} failed`)
    return { sent, failed }
  } catch (error) {
    console.error('❌ Error sending push notifications:', error)
    return { sent: 0, failed: 0 }
  }
}

/**
 * Kirim push notification ke user tertentu
 */
export async function sendPushToAdmin(
  userId: string,
  payload: PushPayload
): Promise<boolean> {
  try {
    // Cek apakah user memiliki subscription
    const subscription = await prisma.pushSubscription.findUnique({
      where: { userId },
    })

    if (!subscription) {
      console.log(`❌ User ${userId} tidak memiliki subscription`)
      return false
    }

    const pushSub = JSON.parse(subscription.subscription)

    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icon-192x192.png',
      badge: payload.badge || '/icon-192x192.png',
      data: {
        url: payload.url || '/admin',
        bookingId: payload.bookingId,
        orderId: payload.orderId,
      },
      vibrate: [200, 100, 200],
    })

    await webpush.sendNotification(pushSub, notificationPayload)
    
    console.log(`✅ Push sent to user ${userId}`)
    return true
  } catch (error: any) {
    console.error(`❌ Error sending push to user ${userId}:`, error)
    
    // Jika subscription expired, hapus dari database
    if (error.message && (error.message.includes('expired') || error.message.includes('410'))) {
      await prisma.pushSubscription.delete({
        where: { userId },
      })
      console.log(`🗑️ Deleted expired subscription for user ${userId}`)
    }
    
    return false
  }
}

/**
 * Kirim push notification untuk booking baru
 */
export async function sendBookingNotification(
  bookingId: string,
  customerName: string,
  serviceName: string,
  bookingDate: string,
  bookingTime: string
): Promise<{ sent: number; failed: number }> {
  return sendPushToAllAdmins({
    title: `📅 Booking Baru #${bookingId.slice(0, 8)}`,
    body: `${customerName} - ${serviceName} pada ${bookingDate} ${bookingTime}`,
    bookingId: bookingId,
    url: `/admin/bookings/${bookingId}`,
    icon: '/icon-192x192.png',
  })
}

/**
 * Kirim push notification untuk order baru
 */
export async function sendOrderNotification(
  orderId: string,
  orderNumber: string,
  customerName: string,
  total: number
): Promise<{ sent: number; failed: number }> {
  return sendPushToAllAdmins({
    title: `📦 Order Baru ${orderNumber || '#' + orderId.slice(0, 8)}`,
    body: `Dari ${customerName} - Total Rp ${(total || 0).toLocaleString()}`,
    orderId: orderId,
    url: `/admin/orders/${orderId}`,
    icon: '/icon-192x192.png',
  })
}

/**
 * Kirim push notification test
 */
export async function sendTestNotification(
  userId: string,
  message: string = 'Test notification'
): Promise<boolean> {
  return sendPushToAdmin(userId, {
    title: '🔔 Test Notifikasi',
    body: message,
    url: '/admin',
    icon: '/icon-192x192.png',
  })
}