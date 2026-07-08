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

    // Cari order berdasarkan id atau midtransOrderId
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: orderId },
          { midtransOrderId: orderId },
        ],
      },
      include: {
        items: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order detail:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order detail' },
      { status: 500 }
    )
  }
}