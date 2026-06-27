import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { action } = body // 'approve' atau 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be "approve" or "reject"' },
        { status: 400 }
      )
    }

    // Get order
    const order = await prisma.order.findUnique({
      where: { id },
      include: { product: true },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    if (order.status !== 'PENDING') {
      return NextResponse.json(
        { error: `Order already ${order.status.toLowerCase()}` },
        { status: 400 }
      )
    }

    if (action === 'reject') {
      // Reject order
      const updatedOrder = await prisma.order.update({
        where: { id },
        data: {
          status: 'REJECTED',
          approvedBy: session.userId,
          approvedAt: new Date(),
        },
      })

      console.log(`❌ Order rejected: ${order.customerName} - ${order.productName}`)
      return NextResponse.json({
        success: true,
        order: updatedOrder,
        message: 'Order rejected',
      })
    }

    // APPROVE: reduce stock
    if (order.product.stock < order.quantity) {
      return NextResponse.json(
        { error: `Stok tidak mencukupi (tersisa ${order.product.stock} unit)` },
        { status: 400 }
      )
    }

    const newStock = order.product.stock - order.quantity

    // Update stock, create stock history, update order
    const [updatedProduct, stockHistory, updatedOrder] = await prisma.$transaction([
      prisma.product.update({
        where: { id: order.productId },
        data: { stock: newStock },
      }),
      prisma.stockHistory.create({
        data: {
          productId: order.productId,
          oldStock: order.product.stock,
          newStock: newStock,
          change: -order.quantity,
          reason: `Order via WhatsApp - ${order.customerName} (${order.customerWhatsapp})`,
          note: order.note || '',
          userId: session.userId,
        },
      }),
      prisma.order.update({
        where: { id },
        data: {
          status: 'APPROVED',
          approvedBy: session.userId,
          approvedAt: new Date(),
        },
      }),
    ])

    console.log(`✅ Order approved: ${order.customerName} - ${order.productName} x${order.quantity}`)
    console.log(`📦 Stock updated: ${order.product.stock} → ${newStock}`)

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      product: updatedProduct,
      stockHistory,
      message: `Order approved, stock reduced by ${order.quantity}`,
    })
  } catch (error) {
    console.error('Error processing order:', error)
    return NextResponse.json(
      { error: 'Failed to process order' },
      { status: 500 }
    )
  }
}
