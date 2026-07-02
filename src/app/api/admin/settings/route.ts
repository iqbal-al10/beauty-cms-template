import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = await prisma.settings.findUnique({
      where: { id: 'default' },
    })

    if (!settings) {
      return NextResponse.json({ error: 'Settings not found' }, { status: 404 })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
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
    console.log('📦 Received settings update:', body)

    const settingsData = {
      siteName: body.siteName || 'Beauty Studio',
      colorPrimary: body.colorPrimary || '#c4367b',
      colorSecondary: body.colorSecondary || '#f5dbe8',
      colorButton: body.colorButton || '#aa1d68',
      fontFamily: body.fontFamily || 'Inter',
      logoUrl: body.logoUrl || null,
      faviconUrl: body.faviconUrl || null,
      heroBannerUrl: body.heroBannerUrl || null,
      whatsappNumber: body.whatsappNumber || '',
      email: body.email || '',
      address: body.address || null,
      footerContent: body.footerContent || null,
      operatingHours: body.operatingHours || null,
      googleMapsEmbedUrl: body.googleMapsEmbedUrl || '',
      socialLinks: body.socialLinks || {},
      gaTrackingId: body.gaTrackingId || null,
      metaTitle: body.metaTitle || null,
      metaDescription: body.metaDescription || null,
      defaultOgImage: body.defaultOgImage || null,
      primaryBackground: body.primaryBackground || '#ffffff',
      secondaryBackground: body.secondaryBackground || '#f8f9fa',
      headingColor: body.headingColor || '#111827',
      bodyTextColor: body.bodyTextColor || '#4b5563',
      linkHoverColor: body.linkHoverColor || '#c4367b',
      borderRadius: body.borderRadius || 'medium',
      buttonStyle: body.buttonStyle || 'rounded',
      layoutStyle: body.layoutStyle || 'full-width',
      navStyle: body.navStyle || 'sticky',
      navbarBackground: body.navbarBackground || '#ffffff',
      navbarTextColor: body.navbarTextColor || '#4b5563',
      navbarHoverColor: body.navbarHoverColor || '#c4367b',
      navbarActiveColor: body.navbarActiveColor || '#c4367b',
      headingFontSize: body.headingFontSize || '32px',
      bodyFontSize: body.bodyFontSize || '16px',
      smallFontSize: body.smallFontSize || '14px',
      enableCart: body.enableCart !== undefined ? body.enableCart : true,
      enableWhatsAppOrder: body.enableWhatsAppOrder !== undefined ? body.enableWhatsAppOrder : true,
      enableGuestCheckout: body.enableGuestCheckout !== undefined ? body.enableGuestCheckout : true,
      enableReviews: body.enableReviews !== undefined ? body.enableReviews : true,
      enableTestimonials: body.enableTestimonials !== undefined ? body.enableTestimonials : true,
      enableBlog: body.enableBlog !== undefined ? body.enableBlog : true,
      enableGallery: body.enableGallery !== undefined ? body.enableGallery : true,
      enableFaq: body.enableFaq !== undefined ? body.enableFaq : true,
      minOrderAmount: body.minOrderAmount || 0,
      maxOrderQuantity: body.maxOrderQuantity || 99,
      cartExpiryDays: body.cartExpiryDays || 7,
      siteDescription: body.siteDescription || null,
      siteKeywords: body.siteKeywords || null,
      copyrightText: body.copyrightText || '',
      footerLinks: body.footerLinks || null,
    }

    const settings = await prisma.settings.update({
      where: { id: 'default' },
      data: settingsData,
    })

    console.log('✅ Settings updated successfully')

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
