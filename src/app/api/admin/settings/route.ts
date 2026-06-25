import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logUserAction } from '@/middleware/activityLogger'

export async function GET() {
  try {
    const settings = await prisma.settings.findUnique({
      where: { id: 'default' },
    })
    return NextResponse.json(settings || {})
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({}, { status: 200 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    const data: any = {
      siteName: body.siteName || 'Beauty Studio',
      colorPrimary: body.colorPrimary || '#e88ea7',
      colorSecondary: body.colorSecondary || '#9b4d6e',
      colorButton: body.colorButton || '#e88ea7',
      fontFamily: body.fontFamily || 'Inter',
      logoUrl: body.logoUrl || null,
      faviconUrl: body.faviconUrl || null,
      heroBannerUrl: body.heroBannerUrl || null,
      whatsappNumber: body.whatsappNumber || null,
      email: body.email || null,
      address: body.address || null,
      footerContent: body.footerContent || null,
      operatingHours: body.operatingHours || null,
      googleMapsEmbedUrl: body.googleMapsEmbedUrl || null,
      socialLinks: body.socialLinks || null,
      gaTrackingId: body.gaTrackingId || null,
      metaTitle: body.metaTitle || null,
      metaDescription: body.metaDescription || null,
    }

    const existing = await prisma.settings.findUnique({
      where: { id: 'default' },
    })

    let settings
    if (existing) {
      settings = await prisma.settings.update({
        where: { id: 'default' },
        data,
      })
    } else {
      settings = await prisma.settings.create({
        data: {
          id: 'default',
          ...data,
        },
      })
    }

    await logUserAction('UPDATE', 'Settings', 'default', {
      updatedFields: Object.keys(body),
    })

    return NextResponse.json(settings)
  } catch (error: any) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update settings' },
      { status: 500 }
    )
  }
}
