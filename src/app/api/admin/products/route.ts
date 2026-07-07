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
    const select = searchParams.get('select') === 'true'
    const featured = searchParams.get('featured') === 'true'
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build where clause
    const where: any = {}
    if (featured) {
      where.isFeatured = true
      where.status = 'PUBLISHED'
    }

    // If select=true, only return id and name for dropdown
    if (select) {
      const products = await prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          price: true,
        },
        orderBy: { createdAt: 'desc' },
        take: all ? undefined : limit,
      })
      return NextResponse.json(products)
    }

    // For normal product list with all data
    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        tags: true,
        promos: {
          include: {
            promo: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: all ? undefined : limit,
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
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
    const {
      name,
      slug,
      description,
      price,
      compareAtPrice,
      stock,
      status,
      categoryId,
      imageUrl,
      isFeatured,
      metaTitle,
      metaDescription,
      canonicalUrl,
      ogImageUrl,
      promoIds,
    } = body

    // Validasi
    if (!name || !slug || !price || stock === undefined || !categoryId) {
      return NextResponse.json(
        { error: 'Name, slug, price, stock, and category are required' },
        { status: 400 }
      )
    }

    // Check slug unique
    const existing = await prisma.product.findUnique({
      where: { slug },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      )
    }

    // 🔥 AMBIL SETTINGS UNTUK AUTO-GENERATE SEO
    const settings = await prisma.settings.findUnique({
      where: { id: 'default' },
      select: { siteName: true, defaultOgImage: true },
    })

    const siteName = settings?.siteName || 'Beauty Studio'
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ''

    // 🔥 AUTO-GENERATE SEO FIELDS
    const autoMetaTitle = metaTitle || `${name} - ${siteName}`
    const autoMetaDescription = metaDescription || 
      (description ? description.substring(0, 155) + '...' : `Temukan ${name} terbaik di ${siteName}`)
    const autoCanonicalUrl = canonicalUrl || `${baseUrl}/products/${slug}`
    const autoOgImageUrl = ogImageUrl || imageUrl || settings?.defaultOgImage || ''

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: description || '',
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        stock: parseInt(stock),
        status: status || 'DRAFT',
        categoryId,
        imageUrl: imageUrl || null,
        isFeatured: isFeatured || false,
        metaTitle: autoMetaTitle,
        metaDescription: autoMetaDescription,
        canonicalUrl: autoCanonicalUrl,
        ogImageUrl: autoOgImageUrl,
        // Connect promos if provided
        promos: promoIds && promoIds.length > 0 ? {
          create: promoIds.map((promoId: string) => ({
            promo: { connect: { id: promoId } },
          })),
        } : undefined,
      },
      include: {
        category: true,
        tags: true,
        promos: {
          include: {
            promo: true,
          },
        },
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: 'CREATE',
        entityType: 'Product',
        entityId: product.id,
        metadata: { name: product.name },
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product: ' + (error as Error).message },
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
    const {
      id,
      name,
      slug,
      description,
      price,
      compareAtPrice,
      stock,
      status,
      categoryId,
      imageUrl,
      isFeatured,
      metaTitle,
      metaDescription,
      canonicalUrl,
      ogImageUrl,
      promoIds,
    } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      )
    }

    // Check if product exists
    const existing = await prisma.product.findUnique({
      where: { id },
    })
    if (!existing) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Check slug unique (if changed)
    if (slug !== existing.slug) {
      const slugExists = await prisma.product.findUnique({
        where: { slug },
      })
      if (slugExists) {
        return NextResponse.json(
          { error: 'Slug already exists' },
          { status: 400 }
        )
      }
    }

    // 🔥 AMBIL SETTINGS UNTUK AUTO-GENERATE SEO
    const settings = await prisma.settings.findUnique({
      where: { id: 'default' },
      select: { siteName: true, defaultOgImage: true },
    })

    const siteName = settings?.siteName || 'Beauty Studio'
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ''

    // 🔥 AUTO-GENERATE SEO FIELDS (jika tidak diisi manual)
    const autoMetaTitle = metaTitle || `${name} - ${siteName}`
    const autoMetaDescription = metaDescription || 
      (description ? description.substring(0, 155) + '...' : `Temukan ${name} terbaik di ${siteName}`)
    const autoCanonicalUrl = canonicalUrl || `${baseUrl}/products/${slug}`
    const autoOgImageUrl = ogImageUrl || imageUrl || settings?.defaultOgImage || ''

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        slug,
        description: description || '',
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        stock: parseInt(stock),
        status: status || 'DRAFT',
        categoryId,
        imageUrl: imageUrl || null,
        isFeatured: isFeatured || false,
        metaTitle: autoMetaTitle,
        metaDescription: autoMetaDescription,
        canonicalUrl: autoCanonicalUrl,
        ogImageUrl: autoOgImageUrl,
        // Update promos
        promos: {
          deleteMany: {},
          create: promoIds && promoIds.length > 0 ? 
            promoIds.map((promoId: string) => ({
              promo: { connect: { id: promoId } },
            })) : [],
        },
      },
      include: {
        category: true,
        tags: true,
        promos: {
          include: {
            promo: true,
          },
        },
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: 'UPDATE',
        entityType: 'Product',
        entityId: product.id,
        metadata: { name: product.name },
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product: ' + (error as Error).message },
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

    // Check if product exists
    const existing = await prisma.product.findUnique({
      where: { id },
    })
    if (!existing) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Delete product (cascade will delete relations)
    await prisma.product.delete({
      where: { id },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: 'DELETE',
        entityType: 'Product',
        entityId: id,
        metadata: { name: existing.name },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product: ' + (error as Error).message },
      { status: 500 }
    )
  }
}