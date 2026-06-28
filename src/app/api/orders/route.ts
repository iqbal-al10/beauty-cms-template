import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      customerName,
      customerWhatsapp,
      address,
      productId,
      quantity,
      note,
      voucherCode,
      discountAmount,
      finalPrice,
      paymentMethod,
      paymentProof,
    } = body

    // Validasi
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

    const price = product.price
    const discount = discountAmount || 0
    const final = finalPrice || (price * quantity - discount)

    // Simpan order
    const order = await prisma.order.create({
      data: {
        customerName,
        customerWhatsapp,
        address: address || '',
        productId,
        productName: product.name,
        quantity,
        price,
        discountAmount: discount,
        finalPrice: final,
        voucherCode: voucherCode || '',
        paymentMethod: paymentMethod || '',
        paymentProof: paymentProof || '',
        note: note || '',
        status: 'PENDING',
      },
    })

    // Kirim notifikasi ke admin
    console.log(`📦 New Order from ${customerName} (${customerWhatsapp})`)
    console.log(`📦 Product: ${product.name} x${quantity}`)
    console.log(`📦 Total: Rp ${final.toLocaleString()}`)

    // Build WhatsApp message
    const whatsappNumber = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || ''
    let message = `*ORDER BARU*%0A%0A`
    message += `📋 Data Customer:%0A`
    message += `Nama: ${customerName}%0A`
    message += `No WA: ${customerWhatsapp}%0A`
    message += `Alamat: ${address || '-'}%0A%0A`
    message += `📦 Detail Pesanan:%0A`
    message += `Produk: ${product.name}%0A`
    message += `Jumlah: ${quantity} unit%0A`
    message += `Harga: Rp ${(price * quantity).toLocaleString()}%0A`
    if (discount > 0) {
      message += `Diskon: Rp ${discount.toLocaleString()}%0A`
      message += `Kode Voucher: ${voucherCode || '-'}%0A`
    }
    message += `Total: Rp ${final.toLocaleString()}%0A%0A`
    message += `💳 Pembayaran:%0A`
    message += `Metode: ${paymentMethod || '-'}%0A`
    if (paymentProof) {
      message += `Bukti Transfer: ${paymentProof}%0A`
    }
    message += `%0A_Silakan approve di dashboard admin._`

    const whatsappUrl = whatsappNumber ? `https://wa.me/${whatsappNumber}?text=${message}` : ''

    return NextResponse.json({
      success: true,
      order,
      whatsappUrl,
      message: 'Pesanan berhasil dibuat',
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Gagal membuat pesanan' },
      { status: 500 }
    )
  }
}
