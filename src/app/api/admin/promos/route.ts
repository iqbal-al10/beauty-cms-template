import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logUserAction } from '@/middleware/activityLogger'

export async function GET() {
  try {
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
    return NextResponse.json(promos || [])
  } catch (error) {
    console.error('Error fetching promos:', error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, type, discountValue, discountType, startDate, endDate, bannerUrl, isActive, productIds } = body

    const promo = await prisma.promo.create({
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

    await logUserAction('CREATE', 'Promo', promo.id, {
      title: promo.title,
      type: promo.type,
    })

    return NextResponse.json(promo, { status: 201 })
  } catch (error) {
    console.error('Error creating promo:', error)
    return NextResponse.json(
      { error: 'Failed to create promo' },
      { status: 500 }
    )
  }
}
