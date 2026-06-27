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
    const { change, reason, note } = body

    if (!change || typeof change !== 'number') {
      return NextResponse.json(
        { error: 'Change value is required and must be a number' },
        { status: 400 }
      )
    }

    // Get current product
    const product = await prisma.product.findUnique({
      where: { id },
      select: { stock: true, name: true },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const newStock = product.stock + change

    if (newStock < 0) {
      return NextResponse.json(
        { error: 'Stock cannot be negative' },
        { status: 400 }
      )
    }

    console.log(`📦 Updating stock for ${product.name}: ${product.stock} → ${newStock}`)

    // Update stock and create history
    const [updatedProduct] = await prisma.$transaction([
      prisma.product.update({
        where: { id },
        data: { stock: newStock },
      }),
      prisma.stockHistory.create({
        data: {
          productId: id,
          oldStock: product.stock,
          newStock: newStock,
          change: change,
          reason: reason || 'Manual Update',
          note: note || '',
          userId: session.userId,
        },
      }),
    ])

    console.log(`✅ Stock updated: ${product.stock} → ${newStock}`)

    return NextResponse.json({
      success: true,
      product: updatedProduct,
      message: `Stock updated from ${product.stock} to ${newStock}`,
    })
  } catch (error) {
    console.error('❌ Error updating stock:', error)
    return NextResponse.json(
      { error: 'Failed to update stock' },
      { status: 500 }
    )
  }
}
