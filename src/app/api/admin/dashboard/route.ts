import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - 7)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfYear = new Date(now.getFullYear(), 0, 1)

    // Parallel queries
    const [
      totalProducts,
      totalBookings,
      totalTestimonials,
      totalBlogPosts,
      totalUsers,
      totalReviews,
      lowStockProducts,
      recentBookings,
      approvedOrders,
      totalOrders,
      pendingOrders,
      topProducts,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.booking.count(),
      prisma.testimonial.count({ where: { isPublished: true } }),
      prisma.blogPost.count({ where: { status: 'PUBLISHED' } }),
      prisma.user.count({ where: { isActive: true } }),
      prisma.review.count({ where: { isPublished: true } }),
      prisma.product.findMany({
        where: { stock: { lt: 10 }, status: 'PUBLISHED' },
        select: { id: true, name: true, stock: true, slug: true },
        take: 5,
      }),
      prisma.booking.findMany({
        where: { status: 'PENDING' },
        include: { service: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.order.findMany({
        where: { status: { in: ['APPROVED', 'PAID'] } },
        select: {
          total: true,
          createdAt: true,
        },
      }),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.orderItem.groupBy({
        by: ['productId', 'productName'],
        _sum: { 
          quantity: true,
          total: true 
        },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
    ])

    // Calculate revenue
    let totalRevenue = 0
    let todayRevenue = 0
    let weekRevenue = 0
    let monthRevenue = 0
    const revenueByDay: Record<string, number> = {}

    for (const order of approvedOrders) {
      const amount = order.total || 0
      totalRevenue += amount

      const date = new Date(order.createdAt)
      const dateKey = date.toISOString().split('T')[0]

      revenueByDay[dateKey] = (revenueByDay[dateKey] || 0) + amount

      if (date >= startOfDay) todayRevenue += amount
      if (date >= startOfWeek) weekRevenue += amount
      if (date >= startOfMonth) monthRevenue += amount
    }

    const sortedRevenueByDay = Object.entries(revenueByDay)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, revenue]) => ({ date, revenue }))

    // Top products transform
    const topProductsData = topProducts.map((item) => ({
      name: item.productName || 'Unknown',
      quantity: item._sum.quantity || 0,
      revenue: item._sum.total || 0,
    }))

    return NextResponse.json({
      totalProducts,
      totalBookings,
      totalTestimonials,
      totalBlogPosts,
      totalUsers,
      totalReviews,
      lowStockProducts,
      recentBookings,
      revenue: {
        total: totalRevenue,
        today: todayRevenue,
        week: weekRevenue,
        month: monthRevenue,
        byDay: sortedRevenueByDay.slice(-30),
      },
      expense: {
        total: 0,
        today: 0,
        byDay: [],
      },
      profit: {
        total: totalRevenue,
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
      },
      topProducts: topProductsData,
      recentTransactions: [],
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats: ' + (error as Error).message },
      { status: 500 }
    )
  }
}