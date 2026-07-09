import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') || 'week'

    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - 7)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const totalBookings = await prisma.service.count()

    const [totalProductReviews, totalServiceReviews] = await Promise.all([
      prisma.review.count({ where: { isPublished: true } }),
      prisma.serviceReview.count({ where: { isPublished: true } })
    ])
    const totalReviews = totalProductReviews + totalServiceReviews

    const [
      totalProducts,
      totalTestimonials,
      totalBlogPosts,
      totalUsers,
      lowStockProducts,
      recentBookings,
      onProgressBookings,
      onProgressOrders,
      historyOrders,
      completedOrders,
      approvedBookings,
      totalOrders,
      pendingOrders,
      topProducts,
      productExpenses,
      bookingExpenses,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.testimonial.count({ where: { isPublished: true } }),
      prisma.blogPost.count({ where: { status: 'PUBLISHED' } }),
      prisma.user.count({ where: { isActive: true } }),
      prisma.product.findMany({
        where: { stock: { lt: 10 }, status: 'PUBLISHED' },
        select: { id: true, name: true, stock: true, slug: true },
        take: 5,
      }),
      prisma.booking.findMany({
        where: { status: 'COMPLETED' },
        include: { 
          service: { select: { name: true, price: true } },
          approvedUser: { select: { name: true } }
        },
        orderBy: { completedAt: 'desc' },
        take: 5,
      }),
      prisma.booking.findMany({
        where: { status: 'ON_PROGRESS' },
        include: { 
          service: { select: { name: true, price: true } },
          approvedUser: { select: { name: true } }
        },
        orderBy: { approvedAt: 'desc' },
        take: 10,
      }),
      prisma.order.findMany({
        where: { status: 'ON_PROGRESS' },
        include: { 
          items: true,
          user: { select: { name: true } }
        },
        orderBy: { approvedAt: 'desc' },
        take: 10,
      }),
      prisma.order.findMany({
        where: { status: 'COMPLETED' },
        include: { 
          items: true,
          user: { select: { name: true } }
        },
        orderBy: { completedAt: 'desc' },
        take: 10,
      }),
      prisma.order.findMany({
        where: { status: 'COMPLETED' },
        select: {
          total: true,
          subtotal: true,
          discountAmount: true,
          voucherCode: true,
          shippingCost: true,
          createdAt: true,
        },
      }),
      prisma.booking.findMany({
        where: { status: 'COMPLETED' },
        select: {
          bookingDate: true,
          service: {
            select: { price: true },
          },
        },
      }),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.orderItem.groupBy({
        by: ['productId', 'productName'],
        where: {
          order: {
            status: 'COMPLETED',
          }
        },
        _sum: {
          quantity: true,
          total: true,
        },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
      prisma.expense.findMany({
        where: { target: 'PRODUCT' },
        select: { amount: true, date: true },
      }),
      prisma.expense.findMany({
        where: { target: 'BOOKING' },
        select: { amount: true, date: true },
      }),
    ])

    // ===== REVENUE FROM PRODUCTS (SETELAH DISKON) =====
    let totalProductRevenue = 0
    let todayProductRevenue = 0
    let weekProductRevenue = 0
    let monthProductRevenue = 0
    const productRevenueByDay: Record<string, number> = {}

    for (const order of completedOrders) {
      // Gunakan total yang sudah termasuk diskon
      const amount = order.total || 0
      totalProductRevenue += amount

      const date = new Date(order.createdAt)
      const dateKey = date.toISOString().split('T')[0]

      productRevenueByDay[dateKey] = (productRevenueByDay[dateKey] || 0) + amount

      if (date >= startOfDay) todayProductRevenue += amount
      if (date >= startOfWeek) weekProductRevenue += amount
      if (date >= startOfMonth) monthProductRevenue += amount
    }

    // ===== REVENUE FROM BOOKINGS =====
    let totalBookingRevenue = 0
    let todayBookingRevenue = 0
    let weekBookingRevenue = 0
    let monthBookingRevenue = 0
    const bookingRevenueByDay: Record<string, number> = {}

    for (const booking of approvedBookings) {
      const amount = booking.service?.price || 0
      totalBookingRevenue += amount

      const date = new Date(booking.bookingDate)
      const dateKey = date.toISOString().split('T')[0]

      bookingRevenueByDay[dateKey] = (bookingRevenueByDay[dateKey] || 0) + amount

      if (date >= startOfDay) todayBookingRevenue += amount
      if (date >= startOfWeek) weekBookingRevenue += amount
      if (date >= startOfMonth) monthBookingRevenue += amount
    }

    // ===== EXPENSES =====
    let totalProductExpense = 0
    let totalBookingExpense = 0
    const productExpenseByDay: Record<string, number> = {}
    const bookingExpenseByDay: Record<string, number> = {}

    for (const expense of productExpenses) {
      totalProductExpense += expense.amount
      const dateKey = new Date(expense.date).toISOString().split('T')[0]
      productExpenseByDay[dateKey] = (productExpenseByDay[dateKey] || 0) + expense.amount
    }

    for (const expense of bookingExpenses) {
      totalBookingExpense += expense.amount
      const dateKey = new Date(expense.date).toISOString().split('T')[0]
      bookingExpenseByDay[dateKey] = (bookingExpenseByDay[dateKey] || 0) + expense.amount
    }

    // ===== REVENUE DATA =====
    const allDates = new Set([
      ...Object.keys(productRevenueByDay),
      ...Object.keys(bookingRevenueByDay),
    ])

    let revenueData = Array.from(allDates)
      .sort()
      .map((date) => ({
        date,
        productRevenue: productRevenueByDay[date] || 0,
        bookingRevenue: bookingRevenueByDay[date] || 0,
      }))

    const today = now.toISOString().split('T')[0]
    
    if (period === 'day') {
      revenueData = revenueData.filter(d => d.date === today)
    } else if (period === 'week') {
      const weekAgo = new Date(now)
      weekAgo.setDate(now.getDate() - 7)
      const weekAgoStr = weekAgo.toISOString().split('T')[0]
      revenueData = revenueData.filter(d => d.date >= weekAgoStr)
    } else if (period === 'month') {
      const monthAgo = new Date(now)
      monthAgo.setMonth(now.getMonth() - 1)
      const monthAgoStr = monthAgo.toISOString().split('T')[0]
      revenueData = revenueData.filter(d => d.date >= monthAgoStr)
    } else if (period === 'year') {
      const yearAgo = new Date(now)
      yearAgo.setFullYear(now.getFullYear() - 1)
      const yearAgoStr = yearAgo.toISOString().split('T')[0]
      revenueData = revenueData.filter(d => d.date >= yearAgoStr)
    }

    // ===== EXPENSE DATA =====
    const expenseDates = new Set([
      ...Object.keys(productExpenseByDay),
      ...Object.keys(bookingExpenseByDay),
    ])

    let expenseData = Array.from(expenseDates)
      .sort()
      .map((date) => ({
        date,
        productExpense: productExpenseByDay[date] || 0,
        bookingExpense: bookingExpenseByDay[date] || 0,
      }))

    if (period === 'day') {
      expenseData = expenseData.filter(d => d.date === today)
    } else if (period === 'week') {
      const weekAgo = new Date(now)
      weekAgo.setDate(now.getDate() - 7)
      const weekAgoStr = weekAgo.toISOString().split('T')[0]
      expenseData = expenseData.filter(d => d.date >= weekAgoStr)
    } else if (period === 'month') {
      const monthAgo = new Date(now)
      monthAgo.setMonth(now.getMonth() - 1)
      const monthAgoStr = monthAgo.toISOString().split('T')[0]
      expenseData = expenseData.filter(d => d.date >= monthAgoStr)
    } else if (period === 'year') {
      const yearAgo = new Date(now)
      yearAgo.setFullYear(now.getFullYear() - 1)
      const yearAgoStr = yearAgo.toISOString().split('T')[0]
      expenseData = expenseData.filter(d => d.date >= yearAgoStr)
    }

    // ===== SORTED REVENUE BY DAY =====
    const sortedProductRevenueByDay = Object.entries(productRevenueByDay)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, revenue]) => ({ date, revenue }))

    const sortedBookingRevenueByDay = Object.entries(bookingRevenueByDay)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, revenue]) => ({ date, revenue }))

    // ===== TOP PRODUCTS =====
    const topProductsData = topProducts.map((item) => ({
      name: item.productName || 'Unknown',
      quantity: item._sum.quantity || 0,
      revenue: item._sum.total || 0,
    }))

    // ===== PIE CHART DATA =====
    const pieChartData = [
      { name: 'Pendapatan Product', value: totalProductRevenue },
      { name: 'Pendapatan Booking', value: totalBookingRevenue },
    ]

    const totalRevenue = totalProductRevenue + totalBookingRevenue
    const todayRevenue = todayProductRevenue + todayBookingRevenue
    const weekRevenue = weekProductRevenue + weekBookingRevenue
    const monthRevenue = monthProductRevenue + monthBookingRevenue
    const totalExpense = totalProductExpense + totalBookingExpense
    const totalProfit = totalRevenue - totalExpense

    // ===== FORMAT DATA DENGAN VOUCHER & TOTAL SETELAH DISKON =====
    const formattedRecentBookings = recentBookings.map((b) => {
      const servicePrice = b.service?.price || 0
      // Booking tidak punya field discountAmount, jadi total = service price
      // TAPI kita bisa ambil dari data booking jika ada
      return {
        id: b.id,
        customerName: b.customerName,
        whatsapp: b.whatsapp,
        email: b.email,
        address: b.address,
        bookingDate: b.bookingDate,
        bookingTime: b.bookingTime,
        status: b.status,
        notes: b.notes,
        service: b.service,
        completedAt: b.completedAt,
        approvedBy: b.approvedUser,
        // 🔥 TAMBAHKAN INFORMASI HARGA
        originalPrice: servicePrice,
        discountAmount: 0, // booking tidak ada diskon
        voucherCode: null,
        totalPaid: servicePrice,
      }
    })

    const formattedOnProgressBookings = onProgressBookings.map((b) => {
      const servicePrice = b.service?.price || 0
      return {
        id: b.id,
        customerName: b.customerName,
        whatsapp: b.whatsapp,
        email: b.email,
        address: b.address,
        bookingDate: b.bookingDate,
        bookingTime: b.bookingTime,
        status: b.status,
        notes: b.notes,
        service: b.service,
        approvedAt: b.approvedAt,
        approvedBy: b.approvedUser,
        originalPrice: servicePrice,
        discountAmount: 0,
        voucherCode: null,
        totalPaid: servicePrice,
      }
    })

    const formattedOnProgressOrders = onProgressOrders.map((o) => {
      const subtotal = o.subtotal || 0
      const discountAmount = o.discountAmount || 0
      const shippingCost = o.shippingCost || 0
      const total = o.total || (subtotal - discountAmount + shippingCost)
      
      return {
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        customerWhatsapp: o.customerWhatsapp,
        address: o.address,
        email: o.email,
        status: o.status,
        items: o.items.map((item) => ({
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
        })),
        approvedAt: o.approvedAt,
        approvedBy: o.user,
        // 🔥 TAMBAHKAN INFORMASI HARGA & VOUCHER
        subtotal: subtotal,
        discountAmount: discountAmount,
        voucherCode: o.voucherCode || null,
        shippingCost: shippingCost,
        totalPaid: total,
      }
    })

    const formattedHistoryOrders = historyOrders.map((o) => {
      const subtotal = o.subtotal || 0
      const discountAmount = o.discountAmount || 0
      const shippingCost = o.shippingCost || 0
      const total = o.total || (subtotal - discountAmount + shippingCost)
      
      return {
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        customerWhatsapp: o.customerWhatsapp,
        address: o.address,
        email: o.email,
        status: o.status,
        items: o.items.map((item) => ({
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
        })),
        createdAt: o.createdAt,
        completedAt: o.completedAt,
        approvedBy: o.user ? { name: o.user.name } : null,
        // 🔥 TAMBAHKAN INFORMASI HARGA & VOUCHER
        subtotal: subtotal,
        discountAmount: discountAmount,
        voucherCode: o.voucherCode || null,
        shippingCost: shippingCost,
        totalPaid: total,
      }
    })

    return NextResponse.json({
      totalProducts,
      totalBookings,
      totalTestimonials,
      totalBlogPosts,
      totalUsers,
      totalReviews,
      lowStockProducts,
      recentBookings: formattedRecentBookings,
      onProgressBookings: formattedOnProgressBookings,
      onProgressOrders: formattedOnProgressOrders,
      historyOrders: formattedHistoryOrders,
      revenue: {
        total: totalRevenue,
        today: todayRevenue,
        week: weekRevenue,
        month: monthRevenue,
        byDay: sortedProductRevenueByDay.slice(-30),
        product: {
          total: totalProductRevenue,
          today: todayProductRevenue,
          week: weekProductRevenue,
          month: monthProductRevenue,
          byDay: sortedProductRevenueByDay.slice(-30),
        },
        booking: {
          total: totalBookingRevenue,
          today: todayBookingRevenue,
          week: weekBookingRevenue,
          month: monthBookingRevenue,
          byDay: sortedBookingRevenueByDay.slice(-30),
        },
      },
      expense: {
        total: totalExpense,
        product: {
          total: totalProductExpense,
          byDay: Object.entries(productExpenseByDay)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([date, expense]) => ({ date, expense }))
            .slice(-30),
        },
        booking: {
          total: totalBookingExpense,
          byDay: Object.entries(bookingExpenseByDay)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([date, expense]) => ({ date, expense }))
            .slice(-30),
        },
      },
      profit: {
        total: totalProfit,
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
      },
      topProducts: topProductsData,
      revenueData: revenueData,
      expenseData: expenseData,
      pieChartData: pieChartData,
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