import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logUserAction } from '@/middleware/activityLogger'

export async function GET() {
  try {
    const tags = await prisma.productTag.findMany({
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(tags || [])
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, slug, color } = body

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    const tag = await prisma.productTag.create({
      data: {
        name,
        slug: slug.toLowerCase().replace(/ /g, '-'),
        color: color || null,
      },
    })

    await logUserAction('CREATE', 'ProductTag', tag.id, {
      name: tag.name,
      color: tag.color,
    })

    return NextResponse.json(tag, { status: 201 })
  } catch (error) {
    console.error('Error creating tag:', error)
    return NextResponse.json(
      { error: 'Failed to create tag' },
      { status: 500 }
    )
  }
}
