import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: List all before-after
export async function GET() {
  try {
    const items = await prisma.beforeAfter.findMany({
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching before-after:', error)
    return NextResponse.json(
      { error: 'Failed to fetch before-after' },
      { status: 500 }
    )
  }
}

// POST: Create new before-after
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, category, beforeImageUrl, afterImageUrl, description, sortOrder, isPublished } = body

    const item = await prisma.beforeAfter.create({
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

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Error creating before-after:', error)
    return NextResponse.json(
      { error: 'Failed to create before-after' },
      { status: 500 }
    )
  }
}
