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

    const review = await prisma.serviceReview.findUnique({
      where: { id },
      include: {
        service: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(review)
  } catch (error) {
    console.error('Error fetching service review:', error)
    return NextResponse.json(
      { error: 'Failed to fetch service review' },
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
    const { serviceId, customerName, rating, comment, isPublished } = body

    const existing = await prisma.serviceReview.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    const review = await prisma.serviceReview.update({
      where: { id },
      data: {
        serviceId: serviceId || existing.serviceId,
        customerName: customerName || existing.customerName,
        rating: rating || existing.rating,
        comment: comment !== undefined ? comment : existing.comment,
        isPublished: isPublished !== undefined ? isPublished : existing.isPublished,
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(review)
  } catch (error) {
    console.error('Error updating service review:', error)
    return NextResponse.json(
      { error: 'Failed to update service review' },
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

    const existing = await prisma.serviceReview.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    await prisma.serviceReview.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting service review:', error)
    return NextResponse.json(
      { error: 'Failed to delete service review' },
      { status: 500 }
    )
  }
}
