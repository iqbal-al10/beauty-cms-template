import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logUserAction } from '@/middleware/activityLogger'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const promo = await prisma.promo.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!promo) {
      return NextResponse.json(
        { error: 'Promo not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(promo)
  } catch (error) {
    console.error('Error fetching promo:', error)
    return NextResponse.json(
      { error: 'Failed to fetch promo' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, type, discountValue, discountType, startDate, endDate, bannerUrl, isActive, productIds } = body

    // Hapus product lama
    await prisma.promoProduct.deleteMany({
      where: { promoId: id },
    })

    const promo = await prisma.promo.update({
      where: { id },
      data: {
        title,
        type,
        discountValue: discountValue ? parseFloat(discountValue) : null,
        discountType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        bannerUrl: bannerUrl || null,
        isActive: isActive !== undefined ? isActive : true,
        products: {
          create: productIds?.map((productId: string) => ({
            productId,
          })) || [],
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

    await logUserAction('UPDATE', 'Promo', promo.id, {
      title: promo.title,
      type: promo.type,
      isActive: promo.isActive,
    })

    return NextResponse.json(promo)
  } catch (error) {
    console.error('Error updating promo:', error)
    return NextResponse.json(
      { error: 'Failed to update promo' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const promo = await prisma.promo.findUnique({
      where: { id },
    })

    if (!promo) {
      return NextResponse.json(
        { error: 'Promo not found' },
        { status: 404 }
      )
    }

    // Hapus semua relasi promo-product terlebih dahulu
    await prisma.promoProduct.deleteMany({
      where: { promoId: id },
    })

    // Hapus promo
    await prisma.promo.delete({
      where: { id },
    })

    await logUserAction('DELETE', 'Promo', id, {
      title: promo.title,
      type: promo.type,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting promo:', error)
    return NextResponse.json(
      { error: 'Failed to delete promo' },
      { status: 500 }
    )
  }
}
