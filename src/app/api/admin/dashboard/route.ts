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
    const startOfDay = new Date(now)
    startOfDay.setHours(0, 0, 0, 0)

    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - 7)

    const startOfMonth = new Date(now)
    startOfMonth.setDate(1)

    // Ambil semua data
    const [
      totalProducts,
      totalBookings,
      totalTestimonials,
      totalBlogPosts,
      totalUsers,
      totalReviews,
      lowStockProducts,
      recentBookings,
      orders,
      transactions,
      expenses,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.booking.count(),
      prisma.testimonial.count(),
      prisma.blogPost.count(),
      prisma.user.count(),
      prisma.review.count(),
      prisma.product.findMany({
        where: {
          stock: { lt: 10 },
          status: 'PUBLISHED',
        },
        select: {
          id: true,
          name: true,
          stock: true,
          slug: true,
        },
        orderBy: { stock: 'asc' },
        take: 20,
      }),
      prisma.booking.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          customerName: true,
          bookingDate: true,
          status: true,
        },
      }),
      // Ambil semua order yang APPROVED untuk perhitungan pendapatan
      prisma.order.findMany({
        where: {
          status: 'APPROVED',
        },
        select: {
          finalPrice: true,
          createdAt: true,
          productId: true,
          productName: true,
          quantity: true,
        },
      }),
      // Ambil semua transaksi
      prisma.transaction.findMany({
        orderBy: { date: 'desc' },
      }),
      // Ambil semua expense
      prisma.expense.findMany({
        orderBy: { date: 'desc' },
      }),
    ])

    // ===== HITUNG PENDAPATAN =====
    const totalRevenue = orders.reduce((sum, order) => sum + order.finalPrice, 0)

    const todayRevenue = orders
      .filter(order => {
        const orderDate = new Date(order.createdAt)
        return orderDate >= startOfDay
      })
      .reduce((sum, order) => sum + order.finalPrice, 0)

    const weekRevenue = orders
      .filter(order => {
        const orderDate = new Date(order.createdAt)
        return orderDate >= startOfWeek
      })
      .reduce((sum, order) => sum + order.finalPrice, 0)

    const monthRevenue = orders
      .filter(order => {
        const orderDate = new Date(order.createdAt)
        return orderDate >= startOfMonth
      })
      .reduce((sum, order) => sum + order.finalPrice, 0)

    // ===== TOP PRODUCTS =====
    const productSales = new Map<string, { name: string; quantity: number; revenue: number }>()
    
    orders.forEach(order => {
      const existing = productSales.get(order.productId)
      if (existing) {
        existing.quantity += order.quantity
        existing.revenue += order.finalPrice
      } else {
        productSales.set(order.productId, {
          name: order.productName,
          quantity: order.quantity,
          revenue: order.finalPrice,
        })
      }
    })

    const topProducts = Array.from(productSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // ===== GRAFIK PENDAPATAN 7 HARI =====
    const revenueByDay: { date: string; revenue: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const dailyRevenue = orders
        .filter(order => {
          const orderDate = new Date(order.createdAt)
          return orderDate >= date && orderDate < nextDate
        })
        .reduce((sum, order) => sum + order.finalPrice, 0)

      revenueByDay.push({
        date: date.toISOString().split('T')[0],
        revenue: dailyRevenue,
      })
    }

    // ===== TOTAL EXPENSE =====
    const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0)

    const todayExpense = expenses
      .filter(exp => {
        const expDate = new Date(exp.date)
        return expDate >= startOfDay
      })
      .reduce((sum, exp) => sum + exp.amount, 0)

    // ===== GRAFIK EXPENSE 7 HARI =====
    const expenseByDay: { date: string; expense: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const dailyExpense = expenses
        .filter(exp => {
          const expDate = new Date(exp.date)
          return expDate >= date && expDate < nextDate
        })
        .reduce((sum, exp) => sum + exp.amount, 0)

      expenseByDay.push({
        date: date.toISOString().split('T')[0],
        expense: dailyExpense,
      })
    }

    // ===== TOTAL ORDERS =====
    const totalOrders = orders.length
    const pendingOrders = await prisma.order.count({ where: { status: 'PENDING' } })

    // ===== RECENT TRANSACTIONS =====
    const recentTransactions = transactions.slice(0, 10)

    return NextResponse.json({
      // Stats
      totalProducts: totalProducts || 0,
      totalBookings: totalBookings || 0,
      totalTestimonials: totalTestimonials || 0,
      totalBlogPosts: totalBlogPosts || 0,
      totalUsers: totalUsers || 0,
      totalReviews: totalReviews || 0,
      lowStockProducts: lowStockProducts || [],
      recentBookings: recentBookings || [],
      
      // Keuangan
      revenue: {
        total: totalRevenue,
        today: todayRevenue,
        week: weekRevenue,
        month: monthRevenue,
        byDay: revenueByDay,
      },
      expense: {
        total: totalExpense,
        today: todayExpense,
        byDay: expenseByDay,
      },
      profit: {
        total: totalRevenue - totalExpense,
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
      },
      topProducts: topProducts,
      recentTransactions: recentTransactions,
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      {
        totalProducts: 0,
        totalBookings: 0,
        totalTestimonials: 0,
        totalBlogPosts: 0,
        totalUsers: 0,
        totalReviews: 0,
        lowStockProducts: [],
        recentBookings: [],
        revenue: { total: 0, today: 0, week: 0, month: 0, byDay: [] },
        expense: { total: 0, today: 0, byDay: [] },
        profit: { total: 0 },
        orders: { total: 0, pending: 0 },
        topProducts: [],
        recentTransactions: [],
      },
      { status: 500 }
    )
  }
}
