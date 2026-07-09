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

    // ===== TOTAL UNIQUE VISITORS =====
    const totalVisitorsResult = await prisma.$queryRaw`
      SELECT COUNT(DISTINCT visitorId) as total
      FROM Visitor
      WHERE createdAt >= ${startDate}
    `
    const totalVisitors = Number((totalVisitorsResult as any[])[0]?.total || 0)

    // ===== VISITORS BY DAY =====
    const visitorsByDayRaw = await prisma.$queryRaw`
      SELECT DATE(createdAt) as date, COUNT(DISTINCT visitorId) as visitors
      FROM Visitor
      WHERE createdAt >= ${startDate}
      GROUP BY DATE(createdAt)
      ORDER BY DATE(createdAt) DESC
    `

    // ===== PAGE VIEWS BY DAY =====
    const pageViewsRaw = await prisma.$queryRaw`
      SELECT DATE(createdAt) as date, COUNT(*) as views
      FROM PageView
      WHERE createdAt >= ${startDate}
      GROUP BY DATE(createdAt)
      ORDER BY DATE(createdAt) DESC
    `

    // ===== TOP PAGES =====
    const topPagesRaw = await prisma.$queryRaw`
      SELECT page, COUNT(*) as views
      FROM PageView
      WHERE createdAt >= ${startDate}
      GROUP BY page
      ORDER BY views DESC
      LIMIT 10
    `

    // ===== TOP REFERRERS =====
    const topReferrersRaw = await prisma.$queryRaw`
      SELECT referrer, COUNT(*) as count
      FROM PageView
      WHERE createdAt >= ${startDate} AND referrer IS NOT NULL AND referrer != ''
      GROUP BY referrer
      ORDER BY count DESC
      LIMIT 5
    `

    // ===== DEVICE TYPE =====
    const devicesRaw = await prisma.$queryRaw`
      SELECT 
        CASE 
          WHEN userAgent LIKE '%Mobile%' OR userAgent LIKE '%Android%' OR userAgent LIKE '%iPhone%' THEN 'Mobile'
          WHEN userAgent LIKE '%Tablet%' OR userAgent LIKE '%iPad%' THEN 'Tablet'
          ELSE 'Desktop'
        END as deviceType,
        COUNT(DISTINCT visitorId) as visitors
      FROM Visitor
      WHERE createdAt >= ${startDate}
      GROUP BY deviceType
    `

    // ===== FORMAT DATA (Pastikan array) =====
    const visitorsByDay = Array.isArray(visitorsByDayRaw) ? visitorsByDayRaw : []
    const pageViews = Array.isArray(pageViewsRaw) ? pageViewsRaw : []
    const topPages = Array.isArray(topPagesRaw) ? topPagesRaw : []
    const topReferrers = Array.isArray(topReferrersRaw) ? topReferrersRaw : []
    const devices = Array.isArray(devicesRaw) ? devicesRaw : []

    const formattedVisitorsByDay = visitorsByDay.map((row: any) => ({
      date: row.date,
      visitors: Number(row.visitors || 0),
    }))

    const formattedPageViews = pageViews.map((row: any) => ({
      date: row.date,
      views: Number(row.views || 0),
    }))

    const formattedTopPages = topPages.map((row: any) => ({
      page: row.page || '/',
      views: Number(row.views || 0),
    }))

    const formattedTopReferrers = topReferrers.map((row: any) => ({
      referrer: row.referrer || 'Direct',
      count: Number(row.count || 0),
    }))

    const formattedDevices = devices.map((row: any) => ({
      device: row.deviceType || 'Unknown',
      visitors: Number(row.visitors || 0),
    }))

    return NextResponse.json({
      totalVisitors: totalVisitors || 0,
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
      { status: 500 }  // 🔥 UBAH KE 500
    )
  }
}