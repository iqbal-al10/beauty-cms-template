// src/app/api/push/send-booking/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sendPushToAllAdmins } from '@/lib/push/server'
import { getServerSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { bookingId, customerName, serviceName, bookingDate, bookingTime } = await request.json()

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    const title = `📅 Booking Baru #${bookingId.slice(0, 8)}`
    const body = `${customerName || 'Customer'} - ${serviceName || 'Layanan'} pada ${bookingDate || ''} ${bookingTime || ''}`

    const result = await sendPushToAllAdmins({
      title,
      body,
      bookingId,
      url: `/admin/bookings/${bookingId}`,
      icon: '/icon-192x192.png',
    })

    // 🔥 PERBAIKAN: sendPushToAllAdmins mengembalikan { sent, failed }
    // Tidak ada properti 'success', jadi kita hardcode true
    // Jika error, sudah di-catch di bawah
    return NextResponse.json({
      success: true,        // ✅ Hardcoded karena fungsi hanya return {sent, failed}
      sent: result.sent,     // ✅ Jumlah notifikasi terkirim
      failed: result.failed, // ✅ Jumlah notifikasi gagal
    })
  } catch (error) {
    console.error('Error sending booking notification:', error)
    return NextResponse.json(
      { 
        error: 'Failed to send notification',
        success: false,  // ✅ Tambahkan juga di response error
        sent: 0,
        failed: 0,
      },
      { status: 500 }
    )
  }
}