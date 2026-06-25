import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [
      totalProducts,
      totalBookings,
      totalTestimonials,
      totalBlogPosts,
      recentBookings,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.booking.count(),
      prisma.testimonial.count(),
      prisma.blogPost.count(),
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
      recentBookings,
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
