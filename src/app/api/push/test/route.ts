// src/app/api/push/test/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sendPushToAllAdmins } from '@/lib/push/server'  // ⬅️ PAKAI INI
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

    // 🔥 PAKAI sendPushToAllAdmins
    const result = await sendPushToAllAdmins({
      title: '🔔 Test Notifikasi',
      body: message || 'Ini adalah notifikasi test dari Beauty CMS',
      url: '/admin',
      icon: '/icon-192x192.png',
    })

    return NextResponse.json({
      success: result.sent > 0,
      sent: result.sent,
      failed: result.failed,
      message: result.sent > 0 ? 'Notifikasi terkirim' : 'Tidak ada admin yang subscribe',
    })
  } catch (error) {
    console.error('Error sending test notification:', error)
    return NextResponse.json(
      { error: 'Failed to send test notification' },
      { status: 500 }
    )
  }
}