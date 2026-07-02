import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json(
        { error: 'Kode voucher harus diisi' },
        { status: 400 }
      )
    }

    // Cari promo berdasarkan kode
    const promo = await prisma.promo.findUnique({
      where: {
        code: code.toUpperCase(),
      },
      include: {
        products: {
          select: {
            productId: true,
          },
        },
        services: {
          select: {
            serviceId: true,
          },
        },
      },
    })

    if (!promo) {
      return NextResponse.json(
        { error: 'Kode voucher tidak ditemukan' },
        { status: 404 }
      )
    }

    // Cek apakah promo aktif dan dalam periode berlaku
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
        { error: 'Voucher sudah expired' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      valid: true,
      code: promo.code,
      discount: promo.discount,
      startDate: promo.startDate,
      endDate: promo.endDate,
      productIds: promo.products.map((p) => p.productId),
      serviceIds: promo.services.map((s) => s.serviceId),
    })
  } catch (error) {
    console.error('Error checking voucher:', error)
    return NextResponse.json(
      { error: 'Gagal memeriksa voucher' },
      { status: 500 }
    )
  }
}
