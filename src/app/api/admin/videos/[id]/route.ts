import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logUserAction } from '@/middleware/activityLogger'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const video = await prisma.videoContent.findUnique({
      where: { id },
    })

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    await prisma.videoContent.delete({
      where: { id },
    })

    await logUserAction('DELETE', 'VideoContent', id, {
      title: video.title,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting video:', error)
    return NextResponse.json(
      { error: 'Failed to delete video' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, url, thumbnailUrl, sortOrder, isPublished } = body

    // Validasi URL YouTube
    const isYoutube = url.includes('youtube.com') || url.includes('youtu.be')
    if (!isYoutube) {
      return NextResponse.json(
        { error: 'Hanya URL YouTube yang didukung' },
        { status: 400 }
      )
    }

    const video = await prisma.videoContent.update({
      where: { id },
      data: {
        title,
        url,
        thumbnailUrl: thumbnailUrl || null,
        sortOrder: parseInt(sortOrder) || 0,
        isPublished: isPublished !== undefined ? isPublished : true,
      },
    })

    await logUserAction('UPDATE', 'VideoContent', video.id, {
      title: video.title,
    })

    return NextResponse.json(video)
  } catch (error) {
    console.error('Error updating video:', error)
    return NextResponse.json(
      { error: 'Failed to update video' },
      { status: 500 }
    )
  }
}
