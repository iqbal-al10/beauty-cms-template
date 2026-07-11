import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    let totalVisitors = 0
    let visitorsByDay: any[] = []
    let pageViews: any[] = []
    let topPages: any[] = []
    let topReferrers: any[] = []
    let devices: any[] = []

    // ===== TOTAL UNIQUE VISITORS =====
    try {
      const result = await prisma.$queryRaw`
        SELECT COUNT(DISTINCT "visitorId") as total
        FROM "Visitor"
        WHERE "createdAt" >= ${startDate}
      `
      totalVisitors = Number((result as any[])[0]?.total || 0)
    } catch (e) {
      console.error('Error fetching total visitors:', e)
    }

    // ===== VISITORS BY DAY =====
    try {
      visitorsByDay = await prisma.$queryRaw`
        SELECT DATE("createdAt") as date, COUNT(DISTINCT "visitorId") as visitors
        FROM "Visitor"
        WHERE "createdAt" >= ${startDate}
        GROUP BY DATE("createdAt")
        ORDER BY DATE("createdAt") DESC
      `
    } catch (e) {
      console.error('Error fetching visitors by day:', e)
    }

    // ===== PAGE VIEWS BY DAY =====
    try {
      pageViews = await prisma.$queryRaw`
        SELECT DATE("createdAt") as date, COUNT(*) as views
        FROM "PageView"
        WHERE "createdAt" >= ${startDate}
        GROUP BY DATE("createdAt")
        ORDER BY DATE("createdAt") DESC
      `
    } catch (e) {
      console.error('Error fetching page views:', e)
    }

    // ===== TOP PAGES =====
    try {
      topPages = await prisma.$queryRaw`
        SELECT "page", COUNT(*) as views
        FROM "PageView"
        WHERE "createdAt" >= ${startDate}
        GROUP BY "page"
        ORDER BY views DESC
        LIMIT 10
      `
    } catch (e) {
      console.error('Error fetching top pages:', e)
    }

    // ===== TOP REFERRERS =====
    try {
      topReferrers = await prisma.$queryRaw`
        SELECT "referrer", COUNT(*) as count
        FROM "PageView"
        WHERE "createdAt" >= ${startDate} AND "referrer" IS NOT NULL AND "referrer" != ''
        GROUP BY "referrer"
        ORDER BY count DESC
        LIMIT 5
      `
    } catch (e) {
      console.error('Error fetching referrers:', e)
    }

    // ===== DEVICE TYPE =====
    try {
      devices = await prisma.$queryRaw`
        SELECT 
          CASE 
            WHEN "userAgent" LIKE '%Mobile%' OR "userAgent" LIKE '%Android%' OR "userAgent" LIKE '%iPhone%' THEN 'Mobile'
            WHEN "userAgent" LIKE '%Tablet%' OR "userAgent" LIKE '%iPad%' THEN 'Tablet'
            ELSE 'Desktop'
          END as "deviceType",
          COUNT(DISTINCT "visitorId") as visitors
        FROM "Visitor"
        WHERE "createdAt" >= ${startDate}
        GROUP BY "deviceType"
      `
    } catch (e) {
      console.error('Error fetching devices:', e)
    }

    const formattedVisitorsByDay = (Array.isArray(visitorsByDay) ? visitorsByDay : []).map((row: any) => ({
      date: row.date,
      visitors: Number(row.visitors || 0),
    }))

    const formattedPageViews = (Array.isArray(pageViews) ? pageViews : []).map((row: any) => ({
      date: row.date,
      views: Number(row.views || 0),
    }))

    const formattedTopPages = (Array.isArray(topPages) ? topPages : []).map((row: any) => ({
      page: row.page || '/',
      views: Number(row.views || 0),
    }))

    const formattedTopReferrers = (Array.isArray(topReferrers) ? topReferrers : []).map((row: any) => ({
      referrer: row.referrer || 'Direct',
      count: Number(row.count || 0),
    }))

    const formattedDevices = (Array.isArray(devices) ? devices : []).map((row: any) => ({
      device: row.deviceType || 'Unknown',
      visitors: Number(row.visitors || 0),
    }))

    return NextResponse.json({
      totalVisitors,
      visitorsByDay: formattedVisitorsByDay,
      pageViews: formattedPageViews,
      topPages: formattedTopPages,
      topReferrers: formattedTopReferrers,
      devices: formattedDevices,
      days,
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch analytics',
        totalVisitors: 0,
        visitorsByDay: [],
        pageViews: [],
        topPages: [],
        topReferrers: [],
        devices: [],
        days: 7,
      },
      { status: 200 }
    )
  }
}