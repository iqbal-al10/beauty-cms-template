import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const testimonials = await prisma.testimonial.findMany({
      include: {
        beforeAfter: true,
      },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json(testimonials)
  } catch (error) {
    console.error('Error fetching testimonials:', error)
    return NextResponse.json(
      { error: 'Failed to fetch testimonials' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { customerName, customerPhotoUrl, rating, reviewText, isPublished, sortOrder, beforeAfterId } = body

    if (!customerName || !rating || !reviewText) {
      return NextResponse.json(
        { error: 'Customer name, rating, and review text are required' },
        { status: 400 }
      )
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        customerName,
        customerPhotoUrl: customerPhotoUrl || null,
        rating: parseInt(rating),
        reviewText,
        isPublished: isPublished !== undefined ? isPublished : false,
        sortOrder: sortOrder || 0,
        beforeAfterId: beforeAfterId || null,
      },
      include: {
        beforeAfter: true,
      },
    })

    return NextResponse.json(testimonial, { status: 201 })
  } catch (error) {
    console.error('Error creating testimonial:', error)
    return NextResponse.json(
      { error: 'Failed to create testimonial' },
      { status: 500 }
    )
  }
}