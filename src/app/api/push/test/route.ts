// src/app/api/push/test/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sendPushToAdmin } from '@/lib/push/server'
import { getServerSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { message } = await request.json()

    const result = await sendPushToAdmin({
      title: '🔔 Test Notifikasi',
      body: message || 'Ini adalah notifikasi test dari Beauty CMS',
      url: '/admin',
    })

    return NextResponse.json({
      success: result,
      message: result ? 'Notifikasi terkirim' : 'Gagal mengirim notifikasi',
    })
  } catch (error) {
    console.error('Error sending test notification:', error)
    return NextResponse.json(
      { error: 'Failed to send test notification' },
      { status: 500 }
    )
  }
}