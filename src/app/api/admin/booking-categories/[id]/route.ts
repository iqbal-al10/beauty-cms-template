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

    const category = await prisma.bookingCategory.findUnique({
      where: { id },
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error fetching booking category:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking category' },
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
    const { name, slug, description, icon, sortOrder, isActive } = body

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    const existing = await prisma.bookingCategory.findUnique({
      where: { id },
    })
    if (!existing) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    if (slug !== existing.slug) {
      const slugExists = await prisma.bookingCategory.findUnique({
        where: { slug },
      })
      if (slugExists) {
        return NextResponse.json(
          { error: 'Slug already exists' },
          { status: 400 }
        )
      }
    }

    const category = await prisma.bookingCategory.update({
      where: { id },
      data: {
        name,
        slug,
        description: description || null,
        icon: icon || '📦',
        sortOrder: sortOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error updating booking category:', error)
    return NextResponse.json(
      { error: 'Failed to update booking category' },
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

    const existing = await prisma.bookingCategory.findUnique({
      where: { id },
    })
    if (!existing) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    await prisma.bookingCategory.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting booking category:', error)
    return NextResponse.json(
      { error: 'Failed to delete booking category' },
      { status: 500 }
    )
  }
}
