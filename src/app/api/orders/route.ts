import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'
import { sendOrderNotification } from '@/lib/push/server'

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
    const session = await getServerSession()
    const body = await request.json()
    console.log('📦 Received order data:', JSON.stringify(body, null, 2))

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
    const orderNumber = generateOrderNumber()
    console.log(`📋 Creating order #${orderNumber}`)

    // Create order dengan semua field termasuk payment detail
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
        subtotal,
        discountAmount: discountAmount || 0,
        total,
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

    console.log(`✅ Order created: ${order.id}`)
    console.log(`✅ Payment Method Name: ${paymentMethodName}`)
    console.log(`✅ Email: ${email}`)

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

      try {
        await prisma.stockHistory.create({
          data: {
            productId: item.productId,
            oldStock: product?.stock || 0,
            newStock: (product?.stock || 0) - item.quantity,
            change: -item.quantity,
            reason: 'ORDER',
            note: `Order #${orderNumber}`,
            userId: session?.userId || 'system',
          },
        })
      } catch (stockError) {
        console.error('❌ Error creating stock history:', stockError)
      }
    }

    // 🔥 KIRIM PUSH NOTIFICATION KE ADMIN - PANGGIL LANGSUNG FUNGSI
    try {
      await sendOrderNotification(
        order.id,
        order.orderNumber,
        order.customerName,
        order.total
      )
      console.log('✅ Push notification sent for order:', order.id)
    } catch (pushError) {
      // Jangan gagalkan order jika notifikasi gagal
      console.error('❌ Error sending push notification:', pushError)
    }

    // Return order dengan semua data
    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('❌ Error creating order:', error)
    return NextResponse.json(
      { error: 'Gagal membuat pesanan: ' + (error as Error).message },
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

    const transformed = orders.map((order) => ({
      id: order.id,
      customerName: order.customerName,
      customerWhatsapp: order.customerWhatsapp,
      email: order.email,
      productName: order.items.length > 0 
        ? order.items[0]?.productName || order.items[0]?.product?.name || '-' 
        : '-',
      quantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
      finalPrice: order.total || 0,
      status: order.status,
      paymentStatus: order.paymentStatus,
      note: order.note,
      createdAt: order.createdAt,
      paymentMethodName: order.paymentMethodName || '',
      paymentAccountNumber: order.paymentAccountNumber || '',
      paymentAccountName: order.paymentAccountName || '',
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