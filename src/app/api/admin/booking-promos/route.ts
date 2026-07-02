import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const promos = await prisma.promo.findMany({
      where: {
        services: {
          some: {}, // Hanya ambil promo yang terhubung ke service
        },
      },
      include: {
        services: {
          select: {
            serviceId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const transformed = promos.map((promo) => ({
      ...promo,
      services: promo.services.map((s) => ({ serviceId: s.serviceId })),
    }))

    return NextResponse.json(transformed)
  } catch (error) {
    console.error('Error fetching booking promos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking promos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { code, discount, startDate, endDate, isActive, serviceIds } = body

    // Validasi
    if (!code) {
      return NextResponse.json(
        { error: 'Kode voucher harus diisi' },
        { status: 400 }
      )
    }
    if (!discount || discount <= 0) {
      return NextResponse.json(
        { error: 'Nominal diskon harus diisi dan lebih dari 0' },
        { status: 400 }
      )
    }
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Tanggal mulai dan selesai harus diisi' },
        { status: 400 }
      )
    }
    if (!serviceIds || serviceIds.length === 0) {
      return NextResponse.json(
        { error: 'Pilih minimal satu layanan' },
        { status: 400 }
      )
    }

    // Check unique code
    const existing = await prisma.promo.findUnique({
      where: { code },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'Kode voucher sudah digunakan' },
        { status: 400 }
      )
    }

    // Create promo with services
    const promo = await prisma.promo.create({
      data: {
        code: code.toUpperCase(),
        discount: parseFloat(discount),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive !== undefined ? isActive : true,
        services: {
          create: serviceIds.map((serviceId: string) => ({
            service: { connect: { id: serviceId } },
          })),
        },
      },
      include: {
        services: {
          select: {
            serviceId: true,
          },
        },
      },
    })

    const transformed = {
      ...promo,
      services: promo.services.map((s) => ({ serviceId: s.serviceId })),
    }

    return NextResponse.json(transformed, { status: 201 })
  } catch (error) {
    console.error('Error creating booking promo:', error)
    return NextResponse.json(
      { error: 'Failed to create booking promo' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, code, discount, startDate, endDate, isActive, serviceIds } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      )
    }

    // Check if promo exists
    const existing = await prisma.promo.findUnique({
      where: { id },
    })
    if (!existing) {
      return NextResponse.json(
        { error: 'Promo not found' },
        { status: 404 }
      )
    }

    // Check unique code (if changed)
    if (code !== existing.code) {
      const codeExists = await prisma.promo.findUnique({
        where: { code },
      })
      if (codeExists) {
        return NextResponse.json(
          { error: 'Kode voucher sudah digunakan' },
          { status: 400 }
        )
      }
    }

    // Update promo
    const promo = await prisma.promo.update({
      where: { id },
      data: {
        code: code.toUpperCase(),
        discount: parseFloat(discount),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive !== undefined ? isActive : true,
        services: {
          deleteMany: {},
          create: serviceIds?.map((serviceId: string) => ({
            service: { connect: { id: serviceId } },
          })) || [],
        },
      },
      include: {
        services: {
          select: {
            serviceId: true,
          },
        },
      },
    })

    const transformed = {
      ...promo,
      services: promo.services.map((s) => ({ serviceId: s.serviceId })),
    }

    return NextResponse.json(transformed)
  } catch (error) {
    console.error('Error updating booking promo:', error)
    return NextResponse.json(
      { error: 'Failed to update booking promo' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      )
    }

    // Check if promo exists
    const existing = await prisma.promo.findUnique({
      where: { id },
    })
    if (!existing) {
      return NextResponse.json(
        { error: 'Promo not found' },
        { status: 404 }
      )
    }

    // Delete promo (cascade will delete relations)
    await prisma.promo.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting booking promo:', error)
    return NextResponse.json(
      { error: 'Failed to delete booking promo' },
      { status: 500 }
    )
  }
}
