import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    const blogs = await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        category: true,
        tags: true,
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    })

    return NextResponse.json(blogs || [])
  } catch (error) {
    console.error('Error fetching blogs:', error)
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 })
  }
}
