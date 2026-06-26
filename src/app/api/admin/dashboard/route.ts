import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [
      totalProducts,
      totalBookings,
      totalTestimonials,
      totalBlogPosts,
      totalUsers,
      totalReviews,
      recentBookings,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.booking.count(),
      prisma.testimonial.count(),
      prisma.blogPost.count(),
      prisma.user.count(),
      prisma.review.count(),
      prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          customerName: true,
          bookingDate: true,
          status: true,
        },
      }),
    ])

    return NextResponse.json({
      totalProducts,
      totalBookings,
      totalTestimonials,
      totalBlogPosts,
      totalUsers,
      totalReviews,
      recentBookings,
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard data',
        totalProducts: 0,
        totalBookings: 0,
        totalTestimonials: 0,
        totalBlogPosts: 0,
        totalUsers: 0,
        totalReviews: 0,
        recentBookings: [],
      },
      { status: 200 }
    )
  }
}
