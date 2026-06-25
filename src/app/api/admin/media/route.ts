import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { logUserAction } from '@/middleware/activityLogger'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const folder = searchParams.get('folder')
    const search = searchParams.get('search')

    const where: any = {}
    if (folder) where.folder = folder
    if (search) {
      where.fileName = { contains: search }
    }

    const files = await prisma.mediaFile.findMany({
      where,
      orderBy: { uploadedAt: 'desc' },
    })

    return NextResponse.json(files || [])
  } catch (error) {
    console.error('Error fetching media:', error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || ''

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only images are allowed (JPEG, PNG, WebP, GIF, SVG)' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    // Generate filename
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const fileName = `${timestamp}-${file.name}`

    // Save file to public/uploads
    const uploadDir = join(process.cwd(), 'public', 'uploads', folder)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const filePath = join(uploadDir, fileName)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // URL to access the file
    const url = `/uploads/${folder}${folder ? '/' : ''}${fileName}`

    // Save to database
    const mediaFile = await prisma.mediaFile.create({
      data: {
        url,
        fileName: file.name,
        fileType: file.type,
        sizeBytes: file.size,
        folder: folder || null,
      },
    })

    await logUserAction('CREATE', 'MediaFile', mediaFile.id, {
      fileName: mediaFile.fileName,
      folder: mediaFile.folder,
    })

    return NextResponse.json(mediaFile, { status: 201 })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
