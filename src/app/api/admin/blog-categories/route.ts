import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logUserAction } from '@/middleware/activityLogger'

export async function GET() {
  try {
    const categories = await prisma.blogCategory.findMany({
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json(categories || [])
  } catch (error) {
    console.error('Error fetching blog categories:', error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, slug, description, sortOrder } = body

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    const category = await prisma.blogCategory.create({
      data: {
        name,
        slug: slug.toLowerCase().replace(/ /g, '-'),
        description: description || null,
        sortOrder: parseInt(sortOrder) || 0,
      },
    })

    await logUserAction('CREATE', 'BlogCategory', category.id, {
      name: category.name,
      slug: category.slug,
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating blog category:', error)
    return NextResponse.json(
      { error: 'Failed to create blog category' },
      { status: 500 }
    )
  }
}
