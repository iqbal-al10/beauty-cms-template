import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

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
    console.error('Error fetching before-after items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch before-after items' },
      { status: 500 }
    )
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
        { error: 'Title, Before Image, and After Image are required' },
        { status: 400 }
      )
    }

    const item = await prisma.beforeAfter.create({
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

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Error creating before-after item:', error)
    return NextResponse.json(
      { error: 'Failed to create before-after item' },
      { status: 500 }
    )
  }
}