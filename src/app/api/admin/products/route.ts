import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const all = searchParams.get('all') === 'true'

    const products = await prisma.product.findMany({
      include: {
        category: true,
        tags: true,
      },
      orderBy: { createdAt: 'desc' },
      ...(all ? {} : { take: 20 }),
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('📦 Creating product with body:', body)

    const { 
      name, slug, description, price, compareAtPrice, stock, status, 
      categoryId, imageUrl, metaTitle, metaDescription, canonicalUrl, ogImageUrl 
    } = body

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: description || '',
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        stock: parseInt(stock) || 0,
        status: status || 'DRAFT',
        categoryId,
        imageUrl: imageUrl || null,
        metaTitle: metaTitle || '',
        metaDescription: metaDescription || '',
        canonicalUrl: canonicalUrl || '',
        ogImageUrl: ogImageUrl || '',
      },
      include: {
        category: true,
        tags: true,
      },
    })

    console.log('✅ Product created:', product.id, 'imageUrl:', product.imageUrl)
    return NextResponse.json(product)
  } catch (error) {
    console.error('❌ Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
