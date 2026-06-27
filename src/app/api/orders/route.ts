import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerName, customerWhatsapp, productId, quantity, note } = body

    if (!customerName || !customerWhatsapp || !productId || !quantity) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi' },
        { status: 400 }
      )
    }

    // Get product
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { name: true, price: true, stock: true },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 404 }
      )
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { error: `Stok tidak mencukupi (tersisa ${product.stock} unit)` },
        { status: 400 }
      )
    }

    const totalPrice = product.price * quantity

    const order = await prisma.order.create({
      data: {
        customerName,
        customerWhatsapp,
        productId,
        productName: product.name,
        quantity,
        totalPrice,
        note: note || '',
        status: 'PENDING',
      },
    })

    // Kirim notifikasi ke admin (via console log, nanti bisa ditambah WhatsApp)
    console.log(`📦 New Order from ${customerName} (${customerWhatsapp}): ${product.name} x${quantity}`)

    return NextResponse.json({
      success: true,
      order,
      message: 'Pesanan berhasil dibuat, tunggu konfirmasi admin',
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Gagal membuat pesanan' },
      { status: 500 }
    )
  }
}
