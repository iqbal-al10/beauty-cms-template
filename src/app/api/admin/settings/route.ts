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
      // ===== BRAND IDENTITY =====
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
      
      // ===== SEO =====
      metaTitle: body.metaTitle || null,
      metaDescription: body.metaDescription || null,
      defaultOgImage: body.defaultOgImage || null,
      
      // ===== COLORS =====
      primaryBackground: body.primaryBackground || '#ffffff',
      secondaryBackground: body.secondaryBackground || '#f8f9fa',
      headingColor: body.headingColor || '#111827',
      bodyTextColor: body.bodyTextColor || '#4b5563',
      linkHoverColor: body.linkHoverColor || '#c4367b',
      
      // ===== LAYOUT =====
      borderRadius: body.borderRadius || 'medium',
      buttonStyle: body.buttonStyle || 'rounded',
      layoutStyle: body.layoutStyle || 'full-width',
      navStyle: body.navStyle || 'sticky',
      
      // ===== NAVBAR =====
      navbarBackground: body.navbarBackground || '#ffffff',
      navbarTextColor: body.navbarTextColor || '#4b5563',
      navbarHoverColor: body.navbarHoverColor || '#c4367b',
      navbarActiveColor: body.navbarActiveColor || '#c4367b',
      
      // ===== FONT SIZES =====
      headingFontSize: body.headingFontSize || '32px',
      bodyFontSize: body.bodyFontSize || '16px',
      smallFontSize: body.smallFontSize || '14px',
      
      // ===== FEATURES =====
      enableCart: body.enableCart !== undefined ? body.enableCart : true,
      enableWhatsAppOrder: body.enableWhatsAppOrder !== undefined ? body.enableWhatsAppOrder : true,
      enableGuestCheckout: body.enableGuestCheckout !== undefined ? body.enableGuestCheckout : true,
      enableReviews: body.enableReviews !== undefined ? body.enableReviews : true,
      enableTestimonials: body.enableTestimonials !== undefined ? body.enableTestimonials : true,
      enableBlog: body.enableBlog !== undefined ? body.enableBlog : true,
      enableGallery: body.enableGallery !== undefined ? body.enableGallery : true,
      enableFaq: body.enableFaq !== undefined ? body.enableFaq : true,
      
      // ===== LIMITS =====
      minOrderAmount: body.minOrderAmount || 0,
      maxOrderQuantity: body.maxOrderQuantity || 99,
      cartExpiryDays: body.cartExpiryDays || 7,
      
      // ===== SITE INFO =====
      siteDescription: body.siteDescription || null,
      siteKeywords: body.siteKeywords || null,
      
      // ===== FOOTER =====
      copyrightText: body.copyrightText || '',
      footerLinks: body.footerLinks || null,

      // =============================================
      // ===== 🔥 HERO CONTENT =====
      // =============================================
      heroBadge: body.heroBadge || '⭐ Premium Beauty Services',
      heroSubtitle: body.heroSubtitle || 'Discover premium beauty services and products for your perfect look',
      heroShopButtonText: body.heroShopButtonText || 'Shop Now',
      heroShopButtonLink: body.heroShopButtonLink || '/products',
      heroBookButtonText: body.heroBookButtonText || 'Book Now',
      heroBookButtonLink: body.heroBookButtonLink || '/booking',

      // =============================================
      // ===== 🔥 HERO SLIDE 1 =====
      // =============================================
      heroSlide1Icon: body.heroSlide1Icon || '🔥',
      heroSlide1Label: body.heroSlide1Label || 'Limited Time Offer',
      heroSlide1Title: body.heroSlide1Title || 'FLASH SALE 50% OFF',
      heroSlide1Desc: body.heroSlide1Desc || 'Grab your favorite products at unbeatable prices',
      heroSlide1Button: body.heroSlide1Button || 'Grab Now',
      heroSlide1Link: body.heroSlide1Link || '/products',
      heroSlide1BgStart: body.heroSlide1BgStart || '#f97316',
      heroSlide1BgEnd: body.heroSlide1BgEnd || '#db2777',

      // =============================================
      // ===== 🔥 HERO SLIDE 2 =====
      // =============================================
      heroSlide2Icon: body.heroSlide2Icon || '📅',
      heroSlide2Label: body.heroSlide2Label || 'Book Now & Get Special Offer',
      heroSlide2Title: body.heroSlide2Title || 'FREE Consultation',
      heroSlide2Desc: body.heroSlide2Desc || 'Book your appointment today and get free consultation',
      heroSlide2Button: body.heroSlide2Button || 'Book Now',
      heroSlide2Link: body.heroSlide2Link || '/booking',
      heroSlide2BgStart: body.heroSlide2BgStart || '#8b5cf6',
      heroSlide2BgEnd: body.heroSlide2BgEnd || '#ec4899',
    }

    console.log('📦 Settings data to save:', settingsData)

    const settings = await prisma.settings.update({
      where: { id: 'default' },
      data: settingsData,
    })

    console.log('✅ Settings updated successfully')
    console.log('✅ Saved heroBadge:', settings.heroBadge)

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings: ' + (error as Error).message },
      { status: 500 }
    )
  }
}