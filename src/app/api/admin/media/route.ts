import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'
import { uploadFile, deleteFile } from '@/lib/storage'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const folder = searchParams.get('folder') || ''

    const filter: any = {}
    if (search) {
      filter.fileName = { contains: search, mode: 'insensitive' }
    }
    if (folder) {
      filter.folder = folder
    }

    const files = await prisma.mediaFile.findMany({
      where: filter,
      orderBy: { uploadedAt: 'desc' },
    })

    return NextResponse.json(files)
  } catch (error) {
    console.error('Error fetching media files:', error)
    return NextResponse.json({ error: 'Failed to fetch media files' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'general'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })
    }

    // Upload to Vercel Blob
    const result = await uploadFile(file, file.name, folder)

    // Save to database
    const mediaFile = await prisma.mediaFile.create({
      data: {
        url: result.url,
        fileName: result.fileName,
        fileType: file.type,
        sizeBytes: result.size,
        folder: folder,
      },
    })

    console.log('✅ File uploaded to Vercel Blob:', result.url)

    return NextResponse.json(mediaFile)
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const mediaFile = await prisma.mediaFile.findUnique({
      where: { id },
    })

    if (!mediaFile) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Delete from Vercel Blob
    try {
      await deleteFile(mediaFile.url)
    } catch (error) {
      console.error('Error deleting from Vercel Blob:', error)
      // Continue to delete from database even if blob deletion fails
    }

    // Delete from database
    await prisma.mediaFile.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 })
  }
}
