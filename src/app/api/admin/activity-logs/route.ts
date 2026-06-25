import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const action = searchParams.get('action')
    const entityType = searchParams.get('entityType')
    const userId = searchParams.get('userId')

    const where: any = {}
    if (action) where.action = action
    if (entityType) where.entityType = entityType
    if (userId) where.userId = userId

    const logs = await prisma.activityLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    const total = await prisma.activityLog.count({ where })

    return NextResponse.json({
      data: logs || [],
      total: total || 0,
      limit,
    })
  } catch (error) {
    console.error('Error fetching activity logs:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch activity logs',
        data: [],
        total: 0,
        limit: 50,
      },
      { status: 200 }
    )
  }
}
