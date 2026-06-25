import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logUserAction } from '@/middleware/activityLogger'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const all = searchParams.get('all')
    const select = searchParams.get('select') // Untuk dropdown review

    if (select === 'true') {
      // Hanya ambil id dan name untuk dropdown
      const products = await prisma.product.findMany({
        where: { status: 'PUBLISHED' },
        select: {
          id: true,
          name: true,
        },
        orderBy: { name: 'asc' },
      })
      return NextResponse.json(products)
    }

    const products = await prisma.product.findMany({
      where: all === 'true' ? {} : { status: 'PUBLISHED' },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(products || [])
  } catch (error: any) {
    console.error('❌ Error fetching products:', error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, slug, description, price, stock, status, categoryId } = body

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        status: status || 'DRAFT',
        categoryId,
      },
      include: { category: true },
    })

    await logUserAction('CREATE', 'Product', product.id, {
      name: product.name,
      price: product.price,
      status: product.status,
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
