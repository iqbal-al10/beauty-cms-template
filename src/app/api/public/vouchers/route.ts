import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code') || ''
    const productId = searchParams.get('productId') || ''

    if (!code) {
      return NextResponse.json({ error: 'Kode voucher required' }, { status: 400 })
    }

    // Cari promo dengan kode voucher yang match (case insensitive)
    const promo = await prisma.promo.findFirst({
      where: {
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
        type: 'VOUCHER',
        voucherCode: { equals: code.toUpperCase(), mode: 'insensitive' },
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!promo) {
      return NextResponse.json({ error: 'Voucher tidak ditemukan atau kadaluarsa' }, { status: 404 })
    }

    // Check if product is applicable (jika promo terbatas untuk produk tertentu)
    if (productId && promo.products.length > 0) {
      const isApplicable = promo.products.some((pp: any) => pp.productId === productId)
      if (!isApplicable) {
        return NextResponse.json({ error: 'Voucher tidak berlaku untuk produk ini' }, { status: 400 })
      }
    }

    return NextResponse.json({
      valid: true,
      promo: {
        id: promo.id,
        title: promo.title,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        type: promo.type,
        voucherCode: promo.voucherCode,
      },
    })
  } catch (error) {
    console.error('Error validating voucher:', error)
    return NextResponse.json({ error: 'Failed to validate voucher' }, { status: 500 })
  }
}
