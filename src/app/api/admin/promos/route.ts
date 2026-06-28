import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const promos = await prisma.promo.findMany({
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(promos)
  } catch (error) {
    console.error('Error fetching promos:', error)
    return NextResponse.json({ error: 'Failed to fetch promos' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      type,
      voucherCode,
      discountValue,
      discountType,
      startDate,
      endDate,
      bannerUrl,
      isActive,
      productIds,
    } = body

    // Validasi
    if (!title || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Title, startDate, endDate are required' },
        { status: 400 }
      )
    }

    if (type === 'VOUCHER' && !voucherCode) {
      return NextResponse.json(
        { error: 'Voucher code is required for VOUCHER type' },
        { status: 400 }
      )
    }

    // Create promo
    const promo = await prisma.promo.create({
      data: {
        title,
        type,
        voucherCode: type === 'VOUCHER' ? voucherCode.toUpperCase() : null,
        discountValue: discountValue ? parseFloat(discountValue) : null,
        discountType: discountType || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        bannerUrl: bannerUrl || null,
        isActive: isActive !== undefined ? isActive : true,
        products: {
          create: productIds.map((productId: string) => ({
            productId,
          })),
        },
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    })

    return NextResponse.json(promo)
  } catch (error) {
    console.error('Error creating promo:', error)
    return NextResponse.json({ error: 'Failed to create promo' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      id,
      title,
      type,
      voucherCode,
      discountValue,
      discountType,
      startDate,
      endDate,
      bannerUrl,
      isActive,
      productIds,
    } = body

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    if (type === 'VOUCHER' && !voucherCode) {
      return NextResponse.json(
        { error: 'Voucher code is required for VOUCHER type' },
        { status: 400 }
      )
    }

    // Delete existing promo products
    await prisma.promoProduct.deleteMany({
      where: { promoId: id },
    })

    // Update promo
    const promo = await prisma.promo.update({
      where: { id },
      data: {
        title,
        type,
        voucherCode: type === 'VOUCHER' ? voucherCode.toUpperCase() : null,
        discountValue: discountValue ? parseFloat(discountValue) : null,
        discountType: discountType || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        bannerUrl: bannerUrl || null,
        isActive: isActive !== undefined ? isActive : true,
        products: {
          create: productIds.map((productId: string) => ({
            productId,
          })),
        },
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    })

    return NextResponse.json(promo)
  } catch (error) {
    console.error('Error updating promo:', error)
    return NextResponse.json({ error: 'Failed to update promo' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    // Delete promo products first
    await prisma.promoProduct.deleteMany({
      where: { promoId: id },
    })

    // Delete promo
    await prisma.promo.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting promo:', error)
    return NextResponse.json({ error: 'Failed to delete promo' }, { status: 500 })
  }
}
