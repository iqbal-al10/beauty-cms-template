import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

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
    const { name, slug, color } = body

    const tag = await prisma.bookingTag.update({
      where: { id },
      data: {
        name,
        slug,
        color: color || null,
      },
    })

    return NextResponse.json(tag)
  } catch (error) {
    console.error('Error updating booking tag:', error)
    return NextResponse.json({ error: 'Failed to update booking tag' }, { status: 500 })
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

    await prisma.bookingTag.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting booking tag:', error)
    return NextResponse.json({ error: 'Failed to delete booking tag' }, { status: 500 })
  }
}
