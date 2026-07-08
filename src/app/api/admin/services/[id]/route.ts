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

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
        promos: {
          include: {
            promo: true,
          },
        },
      },
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    const transformed = {
      ...service,
      tags: service.tags?.map((t: any) => t.tag) || [],
      promos: service.promos?.map((p: any) => p.promo) || [],
    }

    return NextResponse.json(transformed)
  } catch (error) {
    console.error('Error fetching service:', error)
    return NextResponse.json(
      { error: 'Failed to fetch service' },
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
      duration, 
      price,
      compareAtPrice,
      categoryId, 
      imageUrl,
      isFeatured,
      isActive,
      metaTitle,
      metaDescription,
      canonicalUrl,
      ogImageUrl,
      tagIds, 
      promoIds 
    } = body

    if (!name || !slug || !price || !duration) {
      return NextResponse.json(
        { error: 'Name, slug, price, and duration are required' },
        { status: 400 }
      )
    }

    // Check if service exists
    const existing = await prisma.service.findUnique({
      where: { id },
    })
    if (!existing) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    // Check slug unique (if changed)
    if (slug !== existing.slug) {
      const slugExists = await prisma.service.findUnique({
        where: { slug },
      })
      if (slugExists) {
        return NextResponse.json(
          { error: 'Slug already exists' },
          { status: 400 }
        )
      }
    }

    // 🔥 FILTER: Hapus null/undefined dari arrays
    const validTagIds = (tagIds || []).filter((id: string) => id && id !== 'null' && id !== 'undefined')
    const validPromoIds = (promoIds || []).filter((id: string) => id && id !== 'null' && id !== 'undefined')

    // Hapus relasi lama
    await prisma.serviceBookingTag.deleteMany({
      where: { serviceId: id },
    })
    await prisma.promoBooking.deleteMany({
      where: { serviceId: id },
    })

    const service = await prisma.service.update({
      where: { id },
      data: {
        name,
        slug,
        description: description || '',
        duration: parseInt(duration),
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        categoryId: categoryId || 'OTHER',
        imageUrl: imageUrl || null,
        isFeatured: isFeatured || false,
        isActive: isActive !== undefined ? isActive : true,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        canonicalUrl: canonicalUrl || null,
        ogImageUrl: ogImageUrl || null,
        tags: {
          create: validTagIds.map((tagId: string) => ({
            tag: { connect: { id: tagId } },
          })),
        },
        promos: {
          create: validPromoIds.map((promoId: string) => ({
            promo: { connect: { id: promoId } },
          })),
        },
      },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
        promos: {
          include: {
            promo: true,
          },
        },
      },
    })

    const transformed = {
      ...service,
      tags: service.tags?.map((t: any) => t.tag) || [],
      promos: service.promos?.map((p: any) => p.promo) || [],
    }

    return NextResponse.json(transformed)
  } catch (error) {
    console.error('Error updating service:', error)
    return NextResponse.json(
      { error: 'Failed to update service: ' + (error as Error).message },
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

    const existing = await prisma.service.findUnique({
      where: { id },
    })
    if (!existing) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    // Hapus relasi terlebih dahulu
    await prisma.serviceBookingTag.deleteMany({
      where: { serviceId: id },
    })
    await prisma.promoBooking.deleteMany({
      where: { serviceId: id },
    })

    await prisma.service.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json(
      { error: 'Failed to delete service: ' + (error as Error).message },
      { status: 500 }
    )
  }
}