import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 🔥 HANYA TAMPILKAN TYPE "PRODUCT"
    const promos = await prisma.promo.findMany({
      where: { type: 'PRODUCT' },
      include: {
        products: {
          select: {
            productId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const transformed = promos.map((promo) => ({
      ...promo,
      products: promo.products.map((p) => ({ productId: p.productId })),
    }))

    return NextResponse.json(transformed)
  } catch (error) {
    console.error('Error fetching promos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch promos' },
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
    const { code, discount, startDate, endDate, isActive, productIds } = body

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
    if (!productIds || productIds.length === 0) {
      return NextResponse.json(
        { error: 'Pilih minimal satu produk' },
        { status: 400 }
      )
    }

    const existing = await prisma.promo.findUnique({
      where: { code: code.toUpperCase() },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'Kode voucher sudah digunakan' },
        { status: 400 }
      )
    }

    // 🔥 SIMPAN DENGAN TYPE "PRODUCT"
    const promo = await prisma.promo.create({
      data: {
        code: code.toUpperCase(),
        discount: parseFloat(discount),
        type: 'PRODUCT',
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive !== undefined ? isActive : true,
        products: {
          create: productIds.map((productId: string) => ({
            product: { connect: { id: productId } },
          })),
        },
      },
      include: {
        products: {
          select: {
            productId: true,
          },
        },
      },
    })

    const transformed = {
      ...promo,
      products: promo.products.map((p) => ({ productId: p.productId })),
    }

    return NextResponse.json(transformed, { status: 201 })
  } catch (error) {
    console.error('Error creating promo:', error)
    return NextResponse.json(
      { error: 'Failed to create promo: ' + (error as Error).message },
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
    const { id, code, discount, startDate, endDate, isActive, productIds } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      )
    }

    const existing = await prisma.promo.findUnique({
      where: { id },
    })
    if (!existing) {
      return NextResponse.json(
        { error: 'Promo not found' },
        { status: 404 }
      )
    }

    if (code !== existing.code) {
      const codeExists = await prisma.promo.findUnique({
        where: { code: code.toUpperCase() },
      })
      if (codeExists) {
        return NextResponse.json(
          { error: 'Kode voucher sudah digunakan' },
          { status: 400 }
        )
      }
    }

    // 🔥 PASTIKAN TYPE TETAP "PRODUCT"
    const promo = await prisma.promo.update({
      where: { id },
      data: {
        code: code.toUpperCase(),
        discount: parseFloat(discount),
        type: 'PRODUCT',
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive !== undefined ? isActive : true,
        products: {
          deleteMany: {},
          create: productIds?.map((productId: string) => ({
            product: { connect: { id: productId } },
          })) || [],
        },
      },
      include: {
        products: {
          select: {
            productId: true,
          },
        },
      },
    })

    const transformed = {
      ...promo,
      products: promo.products.map((p) => ({ productId: p.productId })),
    }

    return NextResponse.json(transformed)
  } catch (error) {
    console.error('Error updating promo:', error)
    return NextResponse.json(
      { error: 'Failed to update promo: ' + (error as Error).message },
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

    const existing = await prisma.promo.findUnique({
      where: { id },
    })
    if (!existing) {
      return NextResponse.json(
        { error: 'Promo not found' },
        { status: 404 }
      )
    }

    await prisma.promo.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting promo:', error)
    return NextResponse.json(
      { error: 'Failed to delete promo: ' + (error as Error).message },
      { status: 500 }
    )
  }
}