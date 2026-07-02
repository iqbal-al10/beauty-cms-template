import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.bookingCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching booking categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking categories' },
      { status: 500 }
    )
  }
}