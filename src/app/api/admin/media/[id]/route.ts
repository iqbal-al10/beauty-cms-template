import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('🗑️ DELETE /api/admin/media/[id]')
    console.log('📦 ID:', id)

    // Get file from database
    const mediaFile = await prisma.mediaFile.findUnique({
      where: { id },
    })

    if (!mediaFile) {
      console.log('❌ File not found')
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    console.log('📄 File:', mediaFile.fileName)
    console.log('📍 URL:', mediaFile.url)

    // Delete from database first
    await prisma.mediaFile.delete({
      where: { id },
    })
    console.log('✅ Deleted from database')

    // Try to delete file from filesystem
    try {
      const filePath = join(process.cwd(), 'public', mediaFile.url)
      console.log('📁 Path:', filePath)
      
      if (existsSync(filePath)) {
        await unlink(filePath)
        console.log('✅ Deleted from filesystem')
      } else {
        console.log('⚠️ File not found on disk')
      }
    } catch (fsError) {
      console.warn('⚠️ Could not delete file from disk:', fsError)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('❌ Error:', error)
    console.error('❌ Stack:', error.stack)
    return NextResponse.json(
      { error: error.message || 'Failed to delete media' },
      { status: 500 }
    )
  }
}
