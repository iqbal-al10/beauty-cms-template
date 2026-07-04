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

    const product = await prisma.product.findUnique({
      where: { id },
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

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
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

    // 🔥 PERBAIKAN: Catat stock history jika stock berubah
    const newStock = parseInt(stock)
    const oldStock = existing.stock
    
    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        slug,
        description: description || '',
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        stock: newStock,
        status: status || 'DRAFT',
        categoryId,
        imageUrl: imageUrl || null,
        isFeatured: isFeatured || false,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        canonicalUrl: canonicalUrl || null,
        ogImageUrl: ogImageUrl || null,
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

    // 🔥 PERBAIKAN: Jika stock berubah, buat StockHistory
    if (newStock !== oldStock) {
      try {
        await prisma.stockHistory.create({
          data: {
            productId: id,
            oldStock: oldStock,
            newStock: newStock,
            change: newStock - oldStock,
            reason: 'ADMIN_UPDATE',
            note: `Stok diupdate oleh admin dari ${oldStock} menjadi ${newStock}`,
            userId: session.userId,
          },
        })
        console.log(`✅ Stock history created: ${oldStock} → ${newStock}`)
      } catch (stockError) {
        console.error('❌ Error creating stock history:', stockError)
        // Jangan gagalkan update product jika stock history gagal
      }
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product: ' + (error as Error).message },
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

    // Delete product
    await prisma.product.delete({
      where: { id },
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