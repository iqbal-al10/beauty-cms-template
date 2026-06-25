import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Only Super Admin can export data.' },
        { status: 403 }
      )
    }

    // Ambil semua data
    const [settings, users, categories, products, bookings, testimonials, blogPosts, faqs, contactMessages, beforeAfters, promos, mediaFiles, activityLogs] = await Promise.all([
      prisma.settings.findMany(),
      prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true } }),
      prisma.category.findMany(),
      prisma.product.findMany({ include: { category: true } }),
      prisma.booking.findMany({ include: { service: true } }),
      prisma.testimonial.findMany(),
      prisma.blogPost.findMany(),
      prisma.fAQ.findMany(),
      prisma.contactMessage.findMany(),
      prisma.beforeAfter.findMany(),
      prisma.promo.findMany({ include: { products: { include: { product: true } } } }),
      prisma.mediaFile.findMany(),
      prisma.activityLog.findMany({ include: { user: { select: { name: true, email: true } } } }),
    ])

    const backupData = {
      exportedAt: new Date().toISOString(),
      exportedBy: user.email,
      app: 'Beauty CMS',
      version: '1.0.0',
      data: {
        settings,
        users,
        categories,
        products,
        bookings,
        testimonials,
        blogPosts,
        faqs,
        contactMessages,
        beforeAfters,
        promos,
        mediaFiles,
        activityLogs,
      },
    }

    const jsonString = JSON.stringify(backupData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const response = new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="beauty-cms-backup-${new Date().toISOString().split('T')[0]}.json"`,
      },
    })

    return response
  } catch (error) {
    console.error('Backup error:', error)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}
