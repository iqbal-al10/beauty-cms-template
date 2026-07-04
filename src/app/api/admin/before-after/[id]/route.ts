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
    console.error('Error fetching before-after item:', error)
    return NextResponse.json(
      { error: 'Failed to fetch before-after item' },
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
    const { title, category, beforeImageUrl, afterImageUrl, description, sortOrder, isPublished } = body

    if (!title || !beforeImageUrl || !afterImageUrl) {
      return NextResponse.json(
        { error: 'Title, Before Image, and After Image are required' },
        { status: 400 }
      )
    }

    const existing = await prisma.beforeAfter.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    const item = await prisma.beforeAfter.update({
      where: { id },
      data: {
        title,
        category: category || 'Other',
        beforeImageUrl,
        afterImageUrl,
        description: description || null,
        sortOrder: sortOrder || 0,
        isPublished: isPublished !== undefined ? isPublished : true,
      },
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error updating before-after item:', error)
    return NextResponse.json(
      { error: 'Failed to update before-after item' },
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

    const existing = await prisma.beforeAfter.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    await prisma.beforeAfter.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting before-after item:', error)
    return NextResponse.json(
      { error: 'Failed to delete before-after item' },
      { status: 500 }
    )
  }
}