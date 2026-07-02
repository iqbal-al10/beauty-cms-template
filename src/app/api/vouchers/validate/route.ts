import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, productIds } = body

    console.log('🔍 Validating voucher:', { code, productIds })

    if (!code) {
      return NextResponse.json(
        { error: 'Kode voucher wajib diisi' },
        { status: 400 }
      )
    }

    const promo = await prisma.promo.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        products: {
          select: {
            productId: true,
          },
        },
      },
    })

    if (!promo) {
      console.log('❌ Voucher not found:', code)
      return NextResponse.json(
        { error: 'Kode voucher tidak ditemukan' },
        { status: 404 }
      )
    }

    const now = new Date()
    if (!promo.isActive) {
      return NextResponse.json(
        { error: 'Voucher sudah tidak aktif' },
        { status: 400 }
      )
    }

    if (now < promo.startDate) {
      return NextResponse.json(
        { error: 'Voucher belum berlaku' },
        { status: 400 }
      )
    }

    if (now > promo.endDate) {
      return NextResponse.json(
        { error: 'Voucher sudah kadaluarsa' },
        { status: 400 }
      )
    }

    // Check if promo applies to any product in cart
    if (productIds && productIds.length > 0) {
      const promoProductIds = promo.products.map((p: any) => p.productId)
      const isValid = productIds.some((id: string) => promoProductIds.includes(id))
      
      if (!isValid) {
        return NextResponse.json(
          { error: 'Voucher tidak berlaku untuk produk yang dipilih' },
          { status: 400 }
        )
      }
    }

    console.log('✅ Voucher valid:', promo.code)

    return NextResponse.json({
      valid: true,
      code: promo.code,
      discount: promo.discount,
      startDate: promo.startDate,
      endDate: promo.endDate,
    })
  } catch (error) {
    console.error('Error validating voucher:', error)
    return NextResponse.json(
      { error: 'Gagal memvalidasi voucher: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
