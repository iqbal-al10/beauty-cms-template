import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'
import { uploadFile, deleteFile } from '@/lib/storage'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const items = await prisma.beforeAfter.findMany({
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching before/after items:', error)
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, category, beforeImageUrl, afterImageUrl, description, sortOrder, isPublished } = body

    if (!title || !beforeImageUrl || !afterImageUrl) {
      return NextResponse.json(
        { error: 'Title, beforeImageUrl, afterImageUrl are required' },
        { status: 400 }
      )
    }

    const item = await prisma.beforeAfter.create({
      data: {
        title,
        category: category || 'General',
        beforeImageUrl,
        afterImageUrl,
        description: description || '',
        sortOrder: sortOrder || 0,
        isPublished: isPublished !== undefined ? isPublished : true,
      },
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error creating before/after item:', error)
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, title, category, beforeImageUrl, afterImageUrl, description, sortOrder, isPublished } = body

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const item = await prisma.beforeAfter.update({
      where: { id },
      data: {
        title,
        category: category || 'General',
        beforeImageUrl,
        afterImageUrl,
        description: description || '',
        sortOrder: sortOrder || 0,
        isPublished: isPublished !== undefined ? isPublished : true,
      },
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error updating before/after item:', error)
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 })
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
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    // Get item to get image URLs
    const item = await prisma.beforeAfter.findUnique({
      where: { id },
    })

    if (item) {
      // Delete images from Vercel Blob
      if (item.beforeImageUrl) {
        try {
          await deleteFile(item.beforeImageUrl)
        } catch (error) {
          console.error('Error deleting before image:', error)
        }
      }
      if (item.afterImageUrl) {
        try {
          await deleteFile(item.afterImageUrl)
        } catch (error) {
          console.error('Error deleting after image:', error)
        }
      }
    }

    await prisma.beforeAfter.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting before/after item:', error)
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 })
  }
}
