import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📥 Webhook received:', body)

    const {
      order_id,
      transaction_status,
      fraud_status,
      gross_amount,
      payment_type,
    } = body

    // Parse order_id untuk mendapatkan orderId asli
    const isBooking = order_id.startsWith('BOOKING')
    const orderId = order_id.replace(/^(ORDER|BOOKING)-/, '').split('-')[0]

    // Update status berdasarkan transaction_status
    let paymentStatus = 'PENDING'
    let orderStatus = 'PENDING'

    if (transaction_status === 'settlement' || 
        (transaction_status === 'capture' && fraud_status === 'accept')) {
      paymentStatus = 'PAID'
      orderStatus = 'ON_PROGRESS'
    } else if (transaction_status === 'deny' || 
               transaction_status === 'expire' || 
               transaction_status === 'cancel') {
      paymentStatus = 'FAILED'
      orderStatus = 'REJECTED'
    } else if (transaction_status === 'pending') {
      paymentStatus = 'PENDING'
      orderStatus = 'PENDING'
    }

    // Update database
    if (isBooking) {
      await prisma.booking.update({
        where: { id: orderId },
        data: {
          paymentStatus: paymentStatus,
          status: orderStatus,
        },
      })
      console.log(`✅ Booking ${orderId} updated: payment=${paymentStatus}, status=${orderStatus}`)
    } else {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: paymentStatus,
          status: orderStatus,
          paidAt: paymentStatus === 'PAID' ? new Date() : undefined,
        },
      })
      console.log(`✅ Order ${orderId} updated: payment=${paymentStatus}, status=${orderStatus}`)
    }

    // 🔥 Kirim push notification jika pembayaran berhasil
    if (paymentStatus === 'PAID') {
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL
        await fetch(`${appUrl}/api/push/send-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderId,
            orderNumber: `#${orderId.slice(0, 8)}`,
            customerName: 'Customer',
            total: gross_amount || 0,
          }),
        })
        console.log('✅ Push notification sent for order:', orderId)
      } catch (pushError) {
        console.error('Push notification error:', pushError)
      }
    }

    return NextResponse.json({ status: 'OK' })
  } catch (error) {
    console.error('❌ Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}