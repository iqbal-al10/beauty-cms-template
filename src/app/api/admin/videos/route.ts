import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logUserAction } from '@/middleware/activityLogger'

export async function GET() {
  try {
    const videos = await prisma.videoContent.findMany({
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json(videos || [])
  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, sourceType, url, thumbnailUrl, sortOrder, isPublished } = body

    const video = await prisma.videoContent.create({
      data: {
        title,
        sourceType,
        url,
        thumbnailUrl: thumbnailUrl || null,
        sortOrder: parseInt(sortOrder) || 0,
        isPublished: isPublished !== undefined ? isPublished : true,
      },
    })

    await logUserAction('CREATE', 'VideoContent', video.id, {
      title: video.title,
      sourceType: video.sourceType,
    })

    return NextResponse.json(video, { status: 201 })
  } catch (error) {
    console.error('Error creating video:', error)
    return NextResponse.json(
      { error: 'Failed to create video' },
      { status: 500 }
    )
  }
}
