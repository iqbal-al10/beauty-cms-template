import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logUserAction } from '@/middleware/activityLogger'

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(reviews || [])
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json([], { status: 200 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, customerName, rating, comment, isPublished } = body

    if (!productId || !customerName || !rating) {
      return NextResponse.json(
        { error: 'Product, customer name, and rating are required' },
        { status: 400 }
      )
    }

    const review = await prisma.review.create({
      data: {
        productId,
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

    await logUserAction('CREATE', 'Review', review.id, {
      productId: review.productId,
      customerName: review.customerName,
      rating: review.rating,
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}
