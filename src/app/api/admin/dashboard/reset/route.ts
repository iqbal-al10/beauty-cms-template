import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Hanya Super Admin & Admin yang bisa reset
    if (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Only Admin can reset data' },
        { status: 403 }
      )
    }

    // 🔥 HAPUS SEMUA DATA TRANSAKSIONAL
    await prisma.$transaction([
      // 1. Hapus Order Items (relasi dari Order)
      prisma.orderItem.deleteMany(),
      
      // 2. Hapus Orders
      prisma.order.deleteMany(),
      
      // 3. Hapus Bookings (transaksi booking)
      prisma.booking.deleteMany(),
      
      // 4. Hapus Expenses
      prisma.expense.deleteMany(),
      
      // 5. Hapus Stock History
      prisma.stockHistory.deleteMany(),
      
      // 6. Hapus Activity Log
      prisma.activityLog.deleteMany(),
      
      // 7. Hapus Cart Items
      prisma.cartItem.deleteMany(),
      
      // 8. Hapus Carts
      prisma.cart.deleteMany(),
      
      // 9. Hapus Transactions
      prisma.transaction.deleteMany(),
      
      // 10. Hapus Visitors
      prisma.visitor.deleteMany(),
      
      // 11. Hapus Page Views
      prisma.pageView.deleteMany(),
    ])

    // 🔥 RESET STOCK PRODUCTS KE 0 (opsional, sesuaikan kebutuhan)
    // await prisma.product.updateMany({
    //   data: { stock: 0 }
    // })

    console.log('✅ Dashboard reset completed by user:', session.email)

    return NextResponse.json({
      success: true,
      message: 'All transactional data has been reset successfully',
      resetAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error resetting dashboard:', error)
    return NextResponse.json(
      { error: 'Failed to reset dashboard: ' + (error as Error).message },
      { status: 500 }
    )
  }
}