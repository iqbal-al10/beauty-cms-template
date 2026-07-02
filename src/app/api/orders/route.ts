import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

function generateOrderNumber() {
  const date = new Date()
  const prefix = 'INV'
  const year = date.getFullYear().toString().slice(2)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `${prefix}${year}${month}${day}${random}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      customerName,
      customerWhatsapp,
      address,
      city,
      province,
      postalCode,
      shippingCost,
      subtotal,
      discountAmount,
      total,
      paymentMethod,
      note,
      voucherCode,
      items,
    } = body

    // Validasi
    if (!customerName || !customerWhatsapp || !address || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      )
    }

    // Generate order number
    const orderNumber = generateOrderNumber()

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        customerWhatsapp,
        address,
        city: city || '',
        province: province || '',
        postalCode: postalCode || '',
        shippingCost: shippingCost || 0,
        subtotal,
        discountAmount: discountAmount || 0,
        total,
        paymentMethod: paymentMethod || '',
        note: note || '',
        voucherCode: voucherCode || '',
        status: 'PENDING',
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity,
          })),
        },
      },
      include: {
        items: true,
      },
    })

    // Kurangi stok produk
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      })

      // Catat stock history
      await prisma.stockHistory.create({
        data: {
          productId: item.productId,
          oldStock: 0, // tidak perlu exact
          newStock: 0, // tidak perlu exact
          change: -item.quantity,
          reason: 'ORDER',
          note: `Order #${orderNumber}`,
          userId: 'system',
        },
      })
    }

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order: ' + (error as Error).message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {}
    if (status) {
      where.status = status
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
