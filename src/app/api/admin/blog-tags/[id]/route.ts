import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logUserAction } from '@/middleware/activityLogger'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const tag = await prisma.blogTag.findUnique({
      where: { id },
    })

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      )
    }

    await prisma.blogTag.delete({
      where: { id },
    })

    await logUserAction('DELETE', 'BlogTag', id, {
      name: tag.name,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting blog tag:', error)
    return NextResponse.json(
      { error: 'Failed to delete blog tag' },
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
    const { name, slug } = body

    const tag = await prisma.blogTag.update({
      where: { id },
      data: {
        name,
        slug: slug.toLowerCase().replace(/ /g, '-'),
      },
    })

    await logUserAction('UPDATE', 'BlogTag', tag.id, {
      name: tag.name,
      slug: tag.slug,
    })

    return NextResponse.json(tag)
  } catch (error) {
    console.error('Error updating blog tag:', error)
    return NextResponse.json(
      { error: 'Failed to update blog tag' },
      { status: 500 }
    )
  }
}
