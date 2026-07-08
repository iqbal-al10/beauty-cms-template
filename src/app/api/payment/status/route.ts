import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    console.log('🔍 Checking payment status for orderId:', orderId)

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // 🔥 CEK DI ORDER
    let order = null
    let booking = null

    // Cari di Order berdasarkan midtransOrderId
    order = await prisma.order.findFirst({
      where: { midtransOrderId: orderId },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        midtransOrderId: true,
      },
    })

    if (order) {
      console.log('📦 Order found:', { id: order.id, midtransOrderId: order.midtransOrderId })
      
      let responseStatus = 'pending'
      if (order.paymentStatus === 'PAID' || order.status === 'ON_PROGRESS' || order.status === 'COMPLETED') {
        responseStatus = 'settlement'
      } else if (order.paymentStatus === 'FAILED' || order.status === 'REJECTED') {
        responseStatus = 'deny'
      }

      return NextResponse.json({
        status: responseStatus,
        paymentStatus: order.paymentStatus || 'PENDING',
        orderStatus: order.status,
        midtransOrderId: order.midtransOrderId,
      })
    }

    // 🔥 CEK DI BOOKING
    booking = await prisma.booking.findFirst({
      where: { midtransOrderId: orderId },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        midtransOrderId: true,
      },
    })

    if (booking) {
      console.log('📦 Booking found:', { id: booking.id, midtransOrderId: booking.midtransOrderId })
      
      let responseStatus = 'pending'
      if (booking.paymentStatus === 'PAID' || booking.status === 'ON_PROGRESS' || booking.status === 'COMPLETED') {
        responseStatus = 'settlement'
      } else if (booking.paymentStatus === 'FAILED' || booking.status === 'REJECTED') {
        responseStatus = 'deny'
      }

      return NextResponse.json({
        status: responseStatus,
        paymentStatus: booking.paymentStatus || 'PENDING',
        orderStatus: booking.status,
        midtransOrderId: booking.midtransOrderId,
      })
    }

    // 🔥 JIKA TIDAK DITEMUKAN, CEK DENGAN ID LANGSUNG
    // Coba cari di Order dengan id langsung
    const orderById = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        midtransOrderId: true,
      },
    })

    if (orderById) {
      console.log('📦 Order found by ID:', { id: orderById.id })
      
      let responseStatus = 'pending'
      if (orderById.paymentStatus === 'PAID' || orderById.status === 'ON_PROGRESS' || orderById.status === 'COMPLETED') {
        responseStatus = 'settlement'
      } else if (orderById.paymentStatus === 'FAILED' || orderById.status === 'REJECTED') {
        responseStatus = 'deny'
      }

      return NextResponse.json({
        status: responseStatus,
        paymentStatus: orderById.paymentStatus || 'PENDING',
        orderStatus: orderById.status,
        midtransOrderId: orderById.midtransOrderId,
      })
    }

    // Coba cari di Booking dengan id langsung
    const bookingById = await prisma.booking.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        midtransOrderId: true,
      },
    })

    if (bookingById) {
      console.log('📦 Booking found by ID:', { id: bookingById.id })
      
      let responseStatus = 'pending'
      if (bookingById.paymentStatus === 'PAID' || bookingById.status === 'ON_PROGRESS' || bookingById.status === 'COMPLETED') {
        responseStatus = 'settlement'
      } else if (bookingById.paymentStatus === 'FAILED' || bookingById.status === 'REJECTED') {
        responseStatus = 'deny'
      }

      return NextResponse.json({
        status: responseStatus,
        paymentStatus: bookingById.paymentStatus || 'PENDING',
        orderStatus: bookingById.status,
        midtransOrderId: bookingById.midtransOrderId,
      })
    }

    console.warn('⚠️ Transaction not found for orderId:', orderId)
    return NextResponse.json(
      { error: 'Transaction not found' },
      { status: 404 }
    )

  } catch (error) {
    console.error('❌ Error checking payment status:', error)
    return NextResponse.json(
      { error: 'Failed to check payment status' },
      { status: 500 }
    )
  }
}