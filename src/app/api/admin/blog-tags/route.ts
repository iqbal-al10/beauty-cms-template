import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logUserAction } from '@/middleware/activityLogger'

export async function GET() {
  try {
    const tags = await prisma.blogTag.findMany({
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(tags || [])
  } catch (error) {
    console.error('Error fetching blog tags:', error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, slug } = body

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    const tag = await prisma.blogTag.create({
      data: {
        name,
        slug: slug.toLowerCase().replace(/ /g, '-'),
      },
    })

    await logUserAction('CREATE', 'BlogTag', tag.id, {
      name: tag.name,
      slug: tag.slug,
    })

    return NextResponse.json(tag, { status: 201 })
  } catch (error) {
    console.error('Error creating blog tag:', error)
    return NextResponse.json(
      { error: 'Failed to create blog tag' },
      { status: 500 }
    )
  }
}
