import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const promo = await prisma.promo.findUnique({
      where: { id },
      include: {
        products: {
          select: {
            productId: true,
          },
        },
      },
    })

    if (!promo) {
      return NextResponse.json(
        { error: 'Promo not found' },
        { status: 404 }
      )
    }

    const transformed = {
      ...promo,
      products: promo.products.map((p) => ({ productId: p.productId })),
    }

    return NextResponse.json(transformed)
  } catch (error) {
    console.error('Error fetching promo:', error)
    return NextResponse.json(
      { error: 'Failed to fetch promo' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
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
      { error: 'Failed to update promo' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

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
      { error: 'Failed to delete promo' },
      { status: 500 }
    )
  }
}