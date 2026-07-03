import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('serviceId')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!serviceId) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      )
    }

    const reviews = await prisma.serviceReview.findMany({
      where: {
        serviceId,
        isPublished: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Error fetching service reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch service reviews' },
      { status: 500 }
    )
  }
}
