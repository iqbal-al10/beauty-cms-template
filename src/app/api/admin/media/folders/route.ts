import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { mkdir, readdir, rm } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { logUserAction } from '@/middleware/activityLogger'

export async function GET() {
  try {
    const uploadPath = join(process.cwd(), 'public', 'uploads')
    let folders: string[] = []

    if (existsSync(uploadPath)) {
      const entries = await readdir(uploadPath, { withFileTypes: true })
      folders = entries
        .filter((entry: any) => entry.isDirectory())
        .map((entry: any) => entry.name)
        .sort()
    }

    return NextResponse.json(folders)
  } catch (error) {
    console.error('Error fetching folders:', error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name } = body

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Nama folder harus diisi' },
        { status: 400 }
      )
    }

    const folderPath = join(process.cwd(), 'public', 'uploads', name.trim())
    
    if (existsSync(folderPath)) {
      return NextResponse.json(
        { error: 'Folder sudah ada' },
        { status: 400 }
      )
    }

    await mkdir(folderPath, { recursive: true })

    await logUserAction('CREATE', 'Folder', name.trim(), {
      folder: name.trim(),
    })

    return NextResponse.json({ success: true, folder: name.trim() })
  } catch (error) {
    console.error('Error creating folder:', error)
    return NextResponse.json(
      { error: 'Gagal membuat folder' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name')

    if (!name) {
      return NextResponse.json(
        { error: 'Nama folder harus disertakan' },
        { status: 400 }
      )
    }

    const folderPath = join(process.cwd(), 'public', 'uploads', name)
    
    if (!existsSync(folderPath)) {
      return NextResponse.json(
        { error: 'Folder tidak ditemukan' },
        { status: 404 }
      )
    }

    await rm(folderPath, { recursive: true, force: true })

    await prisma.mediaFile.deleteMany({
      where: { folder: name },
    })

    await logUserAction('DELETE', 'Folder', name, {
      folder: name,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting folder:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus folder' },
      { status: 500 }
    )
  }
}
