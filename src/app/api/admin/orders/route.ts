import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')

    const filter: any = {}
    if (status) {
      filter.status = status
    }

    const orders = await prisma.order.findMany({
      where: filter,
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                price: true,
                stock: true,
              },
            },
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
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    // 🔥 TRANSFORM DENGAN DATA LENGKAP
    const transformed = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerWhatsapp: order.customerWhatsapp,
      email: order.email,
      address: order.address,
      status: order.status,
      note: order.note,
      createdAt: order.createdAt,
      // 🔥 INFORMASI HARGA & VOUCHER
      subtotal: order.subtotal || 0,
      discountAmount: order.discountAmount || 0,
      voucherCode: order.voucherCode || null,
      shippingCost: order.shippingCost || 0,
      total: order.total || 0,
      items: order.items.map((item) => ({
        productName: item.productName || item.product?.name || 'Unknown',
        quantity: item.quantity,
        price: item.price,
        total: item.total || (item.price * item.quantity),
      })),
      productName: order.items.length > 0 
        ? order.items[0]?.productName || order.items[0]?.product?.name || '-' 
        : '-',
      quantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
      finalPrice: order.total || 0,
    }))

    return NextResponse.json(transformed)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders: ' + (error as Error).message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      customerName,
      customerWhatsapp,
      email,
      address,
      city,
      province,
      postalCode,
      shippingCost,
      subtotal,
      discountAmount,
      total,
      paymentMethod,
      paymentMethodName,
      paymentAccountNumber,
      paymentAccountName,
      note,
      voucherCode,
      items,
    } = body

    // Validasi
    if (!customerName || !customerWhatsapp || !address || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Data tidak lengkap. Pastikan semua field terisi.' },
        { status: 400 }
      )
    }

    // Validasi items
    for (const item of items) {
      if (!item.productId || !item.quantity || !item.price) {
        return NextResponse.json(
          { error: 'Item pesanan tidak valid.' },
          { status: 400 }
        )
      }
    }

    // Generate order number
    const orderNumber = `INV${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 1000)}`

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        customerWhatsapp,
        email: email || null,
        address,
        city: city || '',
        province: province || '',
        postalCode: postalCode || '',
        shippingCost: shippingCost || 0,
        subtotal: subtotal || 0,
        discountAmount: discountAmount || 0,
        total: total || 0,
        paymentMethod: paymentMethod || '',
        paymentMethodName: paymentMethodName || '',
        paymentAccountNumber: paymentAccountNumber || '',
        paymentAccountName: paymentAccountName || '',
        note: note || '',
        voucherCode: voucherCode || '',
        status: 'PENDING',
        paymentStatus: 'PENDING',
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
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { stock: true },
      })

      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      })

      // Catat stock history
      try {
        await prisma.stockHistory.create({
          data: {
            productId: item.productId,
            oldStock: product?.stock || 0,
            newStock: (product?.stock || 0) - item.quantity,
            change: -item.quantity,
            reason: 'ORDER',
            note: `Order #${orderNumber}`,
            userId: session.userId,
          },
        })
      } catch (stockError) {
        console.error('❌ Error creating stock history:', stockError)
      }
    }

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('❌ Error creating order:', error)
    return NextResponse.json(
      { error: 'Gagal membuat pesanan: ' + (error as Error).message },
      { status: 500 }
    )
  }
}