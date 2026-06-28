import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'
import { deleteFile } from '@/lib/storage'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const folders = await prisma.mediaFile.findMany({
      select: { folder: true },
      distinct: ['folder'],
      orderBy: { folder: 'asc' },
    })

    const folderNames = folders
      .map((f) => f.folder)
      .filter((f): f is string => f !== null)

    return NextResponse.json(folderNames)
  } catch (error) {
    console.error('Error fetching folders:', error)
    return NextResponse.json({ error: 'Failed to fetch folders' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Folder name is required' }, { status: 400 })
    }

    // Just return success - folder will be created when files are uploaded
    return NextResponse.json({ success: true, name: name.trim() })
  } catch (error) {
    console.error('Error creating folder:', error)
    return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const folderName = searchParams.get('name')

    if (!folderName) {
      return NextResponse.json({ error: 'Folder name is required' }, { status: 400 })
    }

    // Get all files in the folder
    const files = await prisma.mediaFile.findMany({
      where: { folder: folderName },
    })

    // Delete from Vercel Blob
    for (const file of files) {
      try {
        await deleteFile(file.url)
      } catch (error) {
        console.error(`Error deleting ${file.fileName} from Vercel Blob:`, error)
      }
    }

    // Delete from database
    await prisma.mediaFile.deleteMany({
      where: { folder: folderName },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting folder:', error)
    return NextResponse.json({ error: 'Failed to delete folder' }, { status: 500 })
  }
}
