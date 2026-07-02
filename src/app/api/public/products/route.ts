import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const featured = searchParams.get('featured') === 'true'
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const category = searchParams.get('category') || ''
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1', 10)
    const skip = (page - 1) * limit

    const now = new Date()

    const filter: any = {
      status: 'PUBLISHED',
    }

    if (featured) {
      filter.isFeatured = true
    }

    if (category) {
      filter.category = {
        slug: category,
        isActive: true,
      }
    }

    if (search) {
      filter.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const products = await prisma.product.findMany({
      where: filter,
      include: {
        category: true,
        tags: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        promos: {
          include: {
            promo: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    })

    const total = await prisma.product.count({ where: filter })

    const transformedProducts = products.map((product: any) => {
      // Filter promo aktif
      const activePromos = product.promos
        ?.map((pp: any) => pp.promo)
        .filter((p: any) => p && p.isActive)
        .filter((p: any) => {
          const start = new Date(p.startDate)
          const end = new Date(p.endDate)
          return start <= now && end >= now && p.type !== 'VOUCHER'
        }) || []

      let finalPrice = product.price
      let discountAmount = 0
      let appliedPromo = null

      if (activePromos.length > 0) {
        const promo = activePromos[0]
        appliedPromo = promo

        if (promo.discountType === 'PERCENTAGE' && promo.discountValue) {
          discountAmount = (product.price * promo.discountValue) / 100
          finalPrice = product.price - discountAmount
        } else if (promo.discountType === 'FIXED' && promo.discountValue) {
          discountAmount = promo.discountValue
          finalPrice = Math.max(0, product.price - discountAmount)
        }
      }

      // Tags sudah include color dari select
      const tags = product.tags || []

      return {
        ...product,
        originalPrice: product.price,
        finalPrice: Math.round(finalPrice),
        discountAmount: Math.round(discountAmount),
        appliedPromo: appliedPromo,
        activePromos: activePromos,
        tags: tags, // tags sudah include color
      }
    })

    return NextResponse.json({
      data: transformedProducts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('❌ Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
