import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { page, referrer } = body

    const cookieStore = await cookies()
    
    // ===== GET OR CREATE VISITOR ID =====
    let visitorId = cookieStore.get('visitorId')?.value
    let isNewVisitor = false

    if (!visitorId) {
      visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
      cookieStore.set('visitorId', visitorId, {
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/',
        sameSite: 'lax',
      })
      isNewVisitor = true
    }

    // ===== GET SESSION ID =====
    let sessionId = cookieStore.get('sessionId')?.value
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
      cookieStore.set('sessionId', sessionId, {
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
        sameSite: 'lax',
      })
    }

    // ===== GET IP ADDRESS (tanpa request.ip) =====
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               request.headers.get('x-real-ip') || 
               'unknown'

    // ===== GET USER AGENT =====
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // ===== SAVE VISITOR (HANYA JIKA BARU) =====
    if (isNewVisitor) {
      await prisma.visitor.create({
        data: {
          visitorId,
          page,
          ip,
          userAgent,
        },
      })
    }

    // ===== SAVE PAGE VIEW (SELALU DISIMPAN, TERMASUK REFRESH) =====
    await prisma.pageView.create({
      data: {
        page,
        visitorId,
        sessionId,
        referrer: referrer || request.headers.get('referer') || undefined,
      },
    })

    return NextResponse.json({ 
      success: true, 
      isNewVisitor,
      visitorId 
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to track analytics' },
      { status: 500 }
    )
  }
}
