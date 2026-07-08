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

    const isBooking = order_id.startsWith('B-')
    const isOrder = order_id.startsWith('O-')

    if (!isBooking && !isOrder) {
      console.warn('⚠️ Unknown order type:', order_id)
      return NextResponse.json({ status: 'OK' })
    }

    let orderId = null

    if (isBooking) {
      const booking = await prisma.booking.findFirst({
        where: { midtransOrderId: order_id },
        select: { id: true },
      })
      if (booking) {
        orderId = booking.id
        console.log('🔍 Found booking:', orderId)
      }
    } else if (isOrder) {
      const order = await prisma.order.findFirst({
        where: { midtransOrderId: order_id },
        select: { id: true },
      })
      if (order) {
        orderId = order.id
        console.log('🔍 Found order:', orderId)
      }
    }

    if (!orderId) {
      console.warn('⚠️ No record found for order_id:', order_id)
      return NextResponse.json({ status: 'OK' })
    }

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

    // 🔥 UPDATE DENGAN PAYMENT TYPE
    const methodName = payment_type || 'Midtrans'

    if (isBooking) {
      await prisma.booking.update({
        where: { id: orderId },
        data: {
          paymentStatus: paymentStatus,
          status: orderStatus,
          paymentMethodName: methodName,
        },
      })
      console.log(`✅ Booking ${orderId} updated: payment=${paymentStatus}, status=${orderStatus}, method=${methodName}`)
    } else {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: paymentStatus,
          status: orderStatus,
          paidAt: paymentStatus === 'PAID' ? new Date() : undefined,
          paymentMethodName: methodName,
        },
      })
      console.log(`✅ Order ${orderId} updated: payment=${paymentStatus}, status=${orderStatus}, method=${methodName}`)
    }

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