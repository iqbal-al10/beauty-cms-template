import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Cari booking berdasarkan id atau midtransOrderId
    const booking = await prisma.booking.findFirst({
      where: {
        OR: [
          { id: orderId },
          { midtransOrderId: orderId },
        ],
      },
      include: {
        service: true,
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Error fetching booking detail:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking detail' },
      { status: 500 }
    )
  }
}