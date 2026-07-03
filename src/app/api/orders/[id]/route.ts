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
    const { action, paymentProof } = body

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required (approve/reject/paid)' },
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

    let newStatus = order.status
    if (action === 'approve') {
      newStatus = 'APPROVED'
    } else if (action === 'reject') {
      newStatus = 'REJECTED'
    } else if (action === 'paid') {
      newStatus = 'PAID'
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "approve", "reject", or "paid"' },
        { status: 400 }
      )
    }

    const updateData: any = {
      status: newStatus,
      approvedBy: session.userId,
      approvedAt: new Date(),
    }

    if (paymentProof) {
      updateData.paymentProof = paymentProof
    }

    if (action === 'paid') {
      updateData.paidAt = new Date()
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
