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

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: filter,
        include: {
          category: true,
          tags: true,        // ← INCLUDE TAGS
          promos: {          // ← INCLUDE PROMOS
            include: {
              promo: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.product.count({ where: filter }),
    ])

    // Transform data: ekstrak tags dan promos
    const transformedProducts = products.map((product: any) => ({
      ...product,
      tags: product.tags || [],
      promos: product.promos?.map((pp: any) => pp.promo).filter(Boolean) || [],
    }))

    console.log('✅ Products sent:', {
      count: transformedProducts.length,
      sample: transformedProducts[0] ? {
        name: transformedProducts[0].name,
        price: transformedProducts[0].price,
        compareAtPrice: transformedProducts[0].compareAtPrice,
        tagsCount: transformedProducts[0].tags?.length || 0,
        promosCount: transformedProducts[0].promos?.length || 0,
      } : 'No products'
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
