import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logUserAction } from '@/middleware/activityLogger'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const tag = await prisma.productTag.findUnique({
      where: { id },
    })

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      )
    }

    await prisma.productTag.delete({
      where: { id },
    })

    await logUserAction('DELETE', 'ProductTag', id, {
      name: tag.name,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting tag:', error)
    return NextResponse.json(
      { error: 'Failed to delete tag' },
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
    const { name, slug, color } = body

    const tag = await prisma.productTag.update({
      where: { id },
      data: {
        name,
        slug: slug.toLowerCase().replace(/ /g, '-'),
        color: color || null,
      },
    })

    await logUserAction('UPDATE', 'ProductTag', tag.id, {
      name: tag.name,
      color: tag.color,
    })

    return NextResponse.json(tag)
  } catch (error) {
    console.error('Error updating tag:', error)
    return NextResponse.json(
      { error: 'Failed to update tag' },
      { status: 500 }
    )
  }
}
