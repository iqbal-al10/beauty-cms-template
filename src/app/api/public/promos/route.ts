import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const active = searchParams.get('active') === 'true'
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    const filter: any = {}

    if (active) {
      filter.isActive = true
      filter.startDate = { lte: new Date() }
      filter.endDate = { gte: new Date() }
    }

    const promos = await prisma.promo.findMany({
      where: filter,
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json(promos || [])
  } catch (error) {
    console.error('Error fetching promos:', error)
    return NextResponse.json({ error: 'Failed to fetch promos' }, { status: 500 })
  }
}
