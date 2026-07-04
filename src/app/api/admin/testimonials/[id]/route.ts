import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const testimonial = await prisma.testimonial.findUnique({
      where: { id },
      include: {
        beforeAfter: true,
      },
    })

    if (!testimonial) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(testimonial)
  } catch (error) {
    console.error('Error fetching testimonial:', error)
    return NextResponse.json(
      { error: 'Failed to fetch testimonial' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { customerName, customerPhotoUrl, rating, reviewText, isPublished, sortOrder, beforeAfterId } = body

    if (!customerName || !rating || !reviewText) {
      return NextResponse.json(
        { error: 'Customer name, rating, and review text are required' },
        { status: 400 }
      )
    }

    const existing = await prisma.testimonial.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      )
    }

    const testimonial = await prisma.testimonial.update({
      where: { id },
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

    return NextResponse.json(testimonial)
  } catch (error) {
    console.error('Error updating testimonial:', error)
    return NextResponse.json(
      { error: 'Failed to update testimonial' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const existing = await prisma.testimonial.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      )
    }

    await prisma.testimonial.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting testimonial:', error)
    return NextResponse.json(
      { error: 'Failed to delete testimonial' },
      { status: 500 }
    )
  }
}