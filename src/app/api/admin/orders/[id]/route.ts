import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

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
    const { action } = body

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required (approve/reject/done)' },
        { status: 400 }
      )
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // 🔥 CEK STATUS SAAT INI
    if (action === 'approve' && order.status !== 'PENDING') {
      return NextResponse.json(
        { error: `Order already ${order.status.toLowerCase()}` },
        { status: 400 }
      )
    }

    if (action === 'done' && order.status !== 'ON_PROGRESS') {
      return NextResponse.json(
        { error: 'Order must be ON_PROGRESS to mark as done' },
        { status: 400 }
      )
    }

    let newStatus: string
    let updateData: any = {}

    if (action === 'approve') {
      newStatus = 'ON_PROGRESS'
      updateData = {
        status: newStatus,
        approvedBy: session.userId,
        approvedAt: new Date(),
      }
      
      // 🔥 KURANGI STOK PRODUK
      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        })

        // Catat history stok
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        })

        if (product) {
          await prisma.stockHistory.create({
            data: {
              productId: item.productId,
              oldStock: product.stock + item.quantity,
              newStock: product.stock,
              change: -item.quantity,
              reason: `Order ${order.orderNumber} - ${order.customerName}`,
              note: `Order approved by ${session.name}`,
              userId: session.userId,
            },
          })
        }
      }
    } else if (action === 'reject') {
      newStatus = 'REJECTED'
      updateData = { status: newStatus }
    } else if (action === 'done') {
      newStatus = 'COMPLETED'
      updateData = {
        status: newStatus,
        completedAt: new Date(),
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "approve", "reject", or "done"' },
        { status: 400 }
      )
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: action.toUpperCase(),
        entityType: 'Order',
        entityId: order.id,
        metadata: {
          orderNumber: order.orderNumber,
          status: newStatus,
          customerName: order.customerName,
        },
      },
    })

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order: ' + (error as Error).message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    await prisma.orderItem.deleteMany({
      where: { orderId: id },
    })

    await prisma.order.delete({
      where: { id },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: 'DELETE',
        entityType: 'Order',
        entityId: order.id,
        metadata: {
          orderNumber: order.orderNumber,
          customerName: order.customerName,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      { error: 'Failed to delete order: ' + (error as Error).message },
      { status: 500 }
    )
  }
}