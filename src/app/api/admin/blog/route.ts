import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logUserAction } from '@/middleware/activityLogger'

export async function GET() {
  try {
    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(posts)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, slug, content, excerpt, status, publishedAt } = body

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        status: status || 'DRAFT',
        publishedAt: publishedAt ? new Date(publishedAt) : null,
      },
    })

    await logUserAction('CREATE', 'BlogPost', post.id, {
      title: post.title,
      status: post.status,
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('Error creating blog post:', error)
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    )
  }
}
