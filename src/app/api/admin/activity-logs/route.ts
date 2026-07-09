import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit
    const action = searchParams.get('action')
    const entityType = searchParams.get('entityType')
    const userId = searchParams.get('userId')

    // 🔥 BUILD WHERE CLAUSE
    const where: any = {}
    if (action) where.action = action
    if (entityType) where.entityType = entityType
    if (userId) where.userId = userId

    // 🔥 FETCH DATA DENGAN PAGINATION
    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
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
        skip: skip,
        take: limit,
      }),
      prisma.activityLog.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      data: logs || [],
      total: total || 0,
      limit,
      page,
      totalPages,
    })
  } catch (error) {
    console.error('Error fetching activity logs:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch activity logs',
        data: [],
        total: 0,
        limit: 10,
        page: 1,
        totalPages: 0,
      },
      { status: 500 }
    )
  }
}