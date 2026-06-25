import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logUserAction } from '@/middleware/activityLogger'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { tagIds } = body

    // Update product tags
    const product = await prisma.product.update({
      where: { id },
      data: {
        tags: {
          set: tagIds.map((tagId: string) => ({ id: tagId })),
        },
      },
      include: {
        tags: true,
      },
    })

    await logUserAction('UPDATE', 'Product', product.id, {
      name: product.name,
      tags: product.tags.map(t => t.name).join(', '),
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error assigning tags:', error)
    return NextResponse.json(
      { error: 'Failed to assign tags' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        tags: true,
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(product.tags)
  } catch (error) {
    console.error('Error fetching product tags:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product tags' },
      { status: 500 }
    )
  }
}
