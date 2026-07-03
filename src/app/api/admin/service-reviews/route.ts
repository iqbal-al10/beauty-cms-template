import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reviews = await prisma.serviceReview.findMany({
      include: {
        service: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { serviceId, customerName, rating, comment, isPublished } = body

    if (!serviceId || !customerName.trim() || !rating) {
      return NextResponse.json(
        { error: 'Service ID, customer name, and rating are required' },
        { status: 400 }
      )
    }

    const review = await prisma.serviceReview.create({
      data: {
        serviceId,
        customerName: customerName.trim(),
        rating: parseInt(rating),
        comment: comment || null,
        isPublished: isPublished !== undefined ? isPublished : false,
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

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Error creating service review:', error)
    return NextResponse.json(
      { error: 'Failed to create service review' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, serviceId, customerName, rating, comment, isPublished } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      )
    }

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

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      )
    }

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
