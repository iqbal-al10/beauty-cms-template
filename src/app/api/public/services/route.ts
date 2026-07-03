import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: any = {
      isActive: true,
    }

    if (featured === 'true') {
      where.isFeatured = true
    }

    const services = await prisma.service.findMany({
      where,
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
        promos: {
          include: {
            promo: true,
          },
        },
      },
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
    })

    const transformed = services.map((service) => ({
      ...service,
      tags: service.tags?.map((st) => st.tag) || [],
      promos: service.promos?.map((sp) => sp.promo) || [],
    }))

    return NextResponse.json(transformed)
  } catch (error) {
    console.error('Error fetching public services:', error)
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    )
  }
}
