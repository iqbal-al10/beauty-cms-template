import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logUserAction } from '@/middleware/activityLogger'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const item = await prisma.beforeAfter.findUnique({
      where: { id },
    })

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error fetching before-after:', error)
    return NextResponse.json(
      { error: 'Failed to fetch item' },
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
    const { title, category, beforeImageUrl, afterImageUrl, description, sortOrder, isPublished } = body

    const item = await prisma.beforeAfter.update({
      where: { id },
      data: {
        title,
        category,
        beforeImageUrl,
        afterImageUrl,
        description,
        sortOrder: parseInt(sortOrder) || 0,
        isPublished: isPublished !== undefined ? isPublished : true,
      },
    })

    // Log activity
    await logUserAction('UPDATE', 'BeforeAfter', item.id, {
      title: item.title,
      category: item.category,
      isPublished: item.isPublished,
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error updating before-after:', error)
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const item = await prisma.beforeAfter.findUnique({
      where: { id },
    })

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    await prisma.beforeAfter.delete({
      where: { id },
    })

    // Log activity
    await logUserAction('DELETE', 'BeforeAfter', id, {
      title: item.title,
      category: item.category,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting before-after:', error)
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    )
  }
}
