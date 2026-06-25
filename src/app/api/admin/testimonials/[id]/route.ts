import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logUserAction } from '@/middleware/activityLogger'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const testimonial = await prisma.testimonial.findUnique({
      where: { id },
    })

    if (!testimonial) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      )
    }

    await prisma.testimonial.delete({
      where: { id },
    })

    await logUserAction('DELETE', 'Testimonial', id, {
      customerName: testimonial.customerName,
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { customerName, rating, reviewText, isPublished } = body

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        customerName,
        rating: parseInt(rating),
        reviewText,
        isPublished,
      },
    })

    await logUserAction('UPDATE', 'Testimonial', testimonial.id, {
      customerName: testimonial.customerName,
      rating: testimonial.rating,
      isPublished: testimonial.isPublished,
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
