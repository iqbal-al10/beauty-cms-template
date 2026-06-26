import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logUserAction } from '@/middleware/activityLogger'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const category = await prisma.blogCategory.findUnique({
      where: { id },
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    await prisma.blogCategory.delete({
      where: { id },
    })

    await logUserAction('DELETE', 'BlogCategory', id, {
      name: category.name,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting blog category:', error)
    return NextResponse.json(
      { error: 'Failed to delete blog category' },
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
    const { name, slug, description, sortOrder } = body

    const category = await prisma.blogCategory.update({
      where: { id },
      data: {
        name,
        slug: slug.toLowerCase().replace(/ /g, '-'),
        description: description || null,
        sortOrder: parseInt(sortOrder) || 0,
      },
    })

    await logUserAction('UPDATE', 'BlogCategory', category.id, {
      name: category.name,
      slug: category.slug,
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error updating blog category:', error)
    return NextResponse.json(
      { error: 'Failed to update blog category' },
      { status: 500 }
    )
  }
}
