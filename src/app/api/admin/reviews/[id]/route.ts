import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logUserAction } from '@/middleware/activityLogger'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const review = await prisma.review.findUnique({
      where: { id },
    })

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    await prisma.review.delete({
      where: { id },
    })

    await logUserAction('DELETE', 'Review', id, {
      customerName: review.customerName,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json(
      { error: 'Failed to delete review' },
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
    const { customerName, rating, comment, isPublished } = body

    const review = await prisma.review.update({
      where: { id },
      data: {
        customerName,
        rating: parseInt(rating),
        comment: comment || null,
        isPublished: isPublished !== undefined ? isPublished : false,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    await logUserAction('UPDATE', 'Review', review.id, {
      customerName: review.customerName,
      rating: review.rating,
      isPublished: review.isPublished,
    })

    return NextResponse.json(review)
  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    )
  }
}
