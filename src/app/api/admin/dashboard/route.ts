import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      jwt.verify(token, JWT_SECRET)
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('📊 Fetching dashboard stats...')

    const [
      totalProducts,
      totalBookings,
      totalTestimonials,
      totalBlogPosts,
      totalUsers,
      totalReviews,
      lowStockProducts,
      recentBookings,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.booking.count(),
      prisma.testimonial.count(),
      prisma.blogPost.count(),
      prisma.user.count(),
      prisma.review.count(),
      // LOW STOCK PRODUCTS (stock < 10)
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
    ])

    console.log('📊 Low stock products found:', lowStockProducts.length)

    return NextResponse.json({
      totalProducts: totalProducts || 0,
      totalBookings: totalBookings || 0,
      totalTestimonials: totalTestimonials || 0,
      totalBlogPosts: totalBlogPosts || 0,
      totalUsers: totalUsers || 0,
      totalReviews: totalReviews || 0,
      lowStockProducts: lowStockProducts || [],
      recentBookings: recentBookings || [],
    })
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error)
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
      },
      { status: 500 }
    )
  }
}
