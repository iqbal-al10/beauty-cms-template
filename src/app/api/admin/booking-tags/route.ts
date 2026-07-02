import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tags = await prisma.bookingTag.findMany({
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(tags)
  } catch (error) {
    console.error('Error fetching booking tags:', error)
    return NextResponse.json({ error: 'Failed to fetch booking tags' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, slug, color } = body

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    const tag = await prisma.bookingTag.create({
      data: {
        name,
        slug,
        color: color || null,
      },
    })

    return NextResponse.json(tag)
  } catch (error) {
    console.error('Error creating booking tag:', error)
    return NextResponse.json({ error: 'Failed to create booking tag' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, slug, color } = body

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

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

    await prisma.bookingTag.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting booking tag:', error)
    return NextResponse.json({ error: 'Failed to delete booking tag' }, { status: 500 })
  }
}
