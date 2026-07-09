// src/app/api/push/send-order/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sendPushToAllAdmins } from '@/lib/push/server'
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

    const { orderId, customerName, total, orderNumber } = await request.json()

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    const title = `📦 Order Baru ${orderNumber || '#' + orderId.slice(0, 8)}`
    const body = `Dari ${customerName || 'Customer'} - Total Rp ${(total || 0).toLocaleString()}`

    const result = await sendPushToAllAdmins({
      title,
      body,
      orderId,
      url: `/admin/orders/${orderId}`,
      icon: '/icon-192x192.png',
    })

    return NextResponse.json({
      success: true,        // ✅ Hardcoded — fungsi hanya return {sent, failed}
      sent: result.sent,
      failed: result.failed,
    })
  } catch (error) {
    console.error('Error sending order notification:', error)
    return NextResponse.json(
      { 
        error: 'Failed to send notification',
        success: false,
        sent: 0,
        failed: 0,
      },
      { status: 500 }
    )
  }
}