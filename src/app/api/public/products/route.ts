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

    // Build filter
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

    // Fetch products - tanpa include promos yang kompleks
    const products = await prisma.product.findMany({
      where: filter,
      include: {
        category: true,
        tags: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    })

    const total = await prisma.product.count({ where: filter })

    // Fetch promos separately untuk menghindari error include
    const now = new Date()
    const allPromos = await prisma.promo.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    })

    // Map promo ke product
    const productWithPromos = products.map((product: any) => {
      // Cari promo yang berlaku untuk product ini
      const productPromos = allPromos.filter((promo: any) => {
        return promo.products.some((pp: any) => pp.productId === product.id) && promo.type !== 'VOUCHER'
      })

      let finalPrice = product.price
      let discountAmount = 0
      let appliedPromo = null

      if (productPromos.length > 0) {
        const promo = productPromos[0]
        appliedPromo = promo

        if (promo.discountType === 'PERCENTAGE' && promo.discountValue) {
          discountAmount = (product.price * promo.discountValue) / 100
          finalPrice = product.price - discountAmount
        } else if (promo.discountType === 'FIXED' && promo.discountValue) {
          discountAmount = promo.discountValue
          finalPrice = Math.max(0, product.price - discountAmount)
        }
      }

      return {
        ...product,
        originalPrice: product.price,
        finalPrice: Math.round(finalPrice),
        discountAmount: Math.round(discountAmount),
        appliedPromo: appliedPromo,
        promos: productPromos,
      }
    })

    return NextResponse.json({
      data: productWithPromos,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('❌ Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
