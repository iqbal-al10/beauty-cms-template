import { put, del, list } from '@vercel/blob'
import fs from 'fs'
import path from 'path'

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || ''
const BLOB_STORE_ID = process.env.BLOB_STORE_ID || ''

export interface UploadResult {
  url: string
  fileName: string
  size: number
}

export async function uploadFile(
  file: File | Buffer,
  fileName: string,
  folder: string = 'general'
): Promise<UploadResult> {
  try {
    const timestamp = Date.now()
    const ext = fileName.split('.').pop() || 'png'
    const baseName = fileName.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9]/g, '-')
    const uniqueFileName = `${folder}/${baseName}-${timestamp}.${ext}`

    let fileBuffer: Buffer
    let fileSize: number

    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer()
      fileBuffer = Buffer.from(arrayBuffer)
      fileSize = file.size
    } else {
      fileBuffer = file
      fileSize = file.length
    }

    // Upload ke Vercel Blob
    const blob = await put(uniqueFileName, fileBuffer, {
      access: 'public',
      token: BLOB_TOKEN,
      storeId: BLOB_STORE_ID || undefined,
      addRandomSuffix: false,
    })

    // KEMBALIKAN URL MENTAH, TANPA TAMBAHAN APAPUN
    return {
      url: blob.url,  // ← HANYA URL DARI BLOB, TIDAK DITAMBAH APA-APA
      fileName: uniqueFileName,
      size: fileSize,
    }
  } catch (error) {
    console.error('Error uploading file to Vercel Blob:', error)
    throw new Error('Failed to upload file to storage')
  }
}

export async function deleteFile(url: string): Promise<void> {
  try {
    if (url.startsWith('https://') && url.includes('blob.vercel-storage.com')) {
      await del(url, { token: BLOB_TOKEN })
    }
  } catch (error) {
    console.error('Error deleting file:', error)
  }
}

export async function listFiles(prefix: string = ''): Promise<string[]> {
  try {
    const result = await list({ prefix, token: BLOB_TOKEN })
    return result.blobs.map((blob: any) => blob.url)
  } catch (error) {
    console.error('Error listing files from Vercel Blob:', error)
    return []
  }
}
