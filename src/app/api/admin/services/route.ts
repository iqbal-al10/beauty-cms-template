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
    const select = searchParams.get('select') === 'true'

    if (select) {
      const services = await prisma.service.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
        },
        orderBy: { name: 'asc' },
      })
      return NextResponse.json(services)
    }

    const services = await prisma.service.findMany({
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
      orderBy: { name: 'asc' },
    })

    const transformed = services.map((service: any) => ({
      ...service,
      tags: service.tags?.map((t: any) => t.tag) || [],
      promos: service.promos?.map((p: any) => p.promo) || [],
    }))

    return NextResponse.json(transformed)
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { error: 'Failed to fetch services' },
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
      duration, 
      price, 
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

    // Check slug unique
    const existing = await prisma.service.findUnique({
      where: { slug },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      )
    }

    const service = await prisma.service.create({
      data: {
        name,
        slug,
        description: description || '',
        duration: parseInt(duration),
        price: parseFloat(price),
        categoryId: categoryId || 'OTHER',
        imageUrl: imageUrl || null,
        isFeatured: isFeatured || false,
        isActive: isActive !== undefined ? isActive : true,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        canonicalUrl: canonicalUrl || null,
        ogImageUrl: ogImageUrl || null,
        tags: {
          create: tagIds?.map((tagId: string) => ({
            tag: { connect: { id: tagId } },
          })) || [],
        },
        promos: {
          create: promoIds?.map((promoId: string) => ({
            promo: { connect: { id: promoId } },
          })) || [],
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

    return NextResponse.json(transformed, { status: 201 })
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json(
      { error: 'Failed to create service: ' + (error as Error).message },
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
      duration, 
      price, 
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

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
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

    // Hapus relasi lama - gunakan model yang benar: PromoBooking
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
        categoryId: categoryId || 'OTHER',
        imageUrl: imageUrl || null,
        isFeatured: isFeatured || false,
        isActive: isActive !== undefined ? isActive : true,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        canonicalUrl: canonicalUrl || null,
        ogImageUrl: ogImageUrl || null,
        tags: {
          create: tagIds?.map((tagId: string) => ({
            tag: { connect: { id: tagId } },
          })) || [],
        },
        promos: {
          create: promoIds?.map((promoId: string) => ({
            promo: { connect: { id: promoId } },
          })) || [],
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

    // Hapus relasi - gunakan model yang benar: PromoBooking
    await prisma.serviceBookingTag.deleteMany({
      where: { serviceId: id },
    })
    await prisma.promoBooking.deleteMany({
      where: { serviceId: id },
    })

    // Hapus service
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
