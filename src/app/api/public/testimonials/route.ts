import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    const testimonials = await prisma.testimonial.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json(testimonials || [])
  } catch (error) {
    console.error('Error fetching testimonials:', error)
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 })
  }
}
