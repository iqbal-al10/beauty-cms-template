import { prisma } from '@/lib/prisma'
import Header from '@/components/public/Header'
import Footer from '@/components/public/Footer'
import type { Settings } from '@prisma/client'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let settings: Settings | null = null

  try {
    const data = await prisma.settings.findUnique({
      where: { id: 'default' },
    })

    if (data) {
      settings = {
        id: data.id,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        siteName: data.siteName || 'Beauty Studio',
        colorPrimary: data.colorPrimary || '#c4367b',
        colorSecondary: data.colorSecondary || '#f5dbe8',
        colorButton: data.colorButton || '#aa1d68',
        fontFamily: data.fontFamily || 'Inter',
        logoUrl: data.logoUrl || null,
        faviconUrl: data.faviconUrl || null,
        heroBannerUrl: data.heroBannerUrl || null,
        navbarBackground: data.navbarBackground || '#ffffff',
        navbarTextColor: data.navbarTextColor || '#4b5563',
        navbarHoverColor: data.navbarHoverColor || '#c4367b',
        navbarActiveColor: data.navbarActiveColor || '#c4367b',
        enableCart: data.enableCart !== undefined ? data.enableCart : true,
        navStyle: data.navStyle || 'sticky',
        headingFontSize: data.headingFontSize || '32px',
        bodyFontSize: data.bodyFontSize || '16px',
        smallFontSize: data.smallFontSize || '14px',
        address: data.address || null,
        whatsappNumber: data.whatsappNumber || null,
        email: data.email || null,
        socialLinks: data.socialLinks || {},
        footerContent: data.footerContent || null,
        footerServices: data.footerServices || null,
        secondaryBackground: data.secondaryBackground || '#f8f9fa',
        headingColor: data.headingColor || '#111827',
        bodyTextColor: data.bodyTextColor || '#4b5563',
        copyrightText: data.copyrightText || null,
        footerLinks: data.footerLinks || null,
        primaryBackground: data.primaryBackground || '#ffffff',
        operatingHours: data.operatingHours || null,
        googleMapsEmbedUrl: data.googleMapsEmbedUrl || null,
        gaTrackingId: data.gaTrackingId || null,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        defaultOgImage: data.defaultOgImage || null,
        aboutHeroTitle: data.aboutHeroTitle || null,
        aboutHeroSubtitle: data.aboutHeroSubtitle || null,
        aboutStoryTitle: data.aboutStoryTitle || null,
        aboutStoryContent: data.aboutStoryContent || null,
        aboutMission: data.aboutMission || null,
        aboutVision: data.aboutVision || null,
        aboutTeamTitle: data.aboutTeamTitle || null,
        aboutTeam: data.aboutTeam || null,
        contactHeroTitle: data.contactHeroTitle || null,
        contactHeroSubtitle: data.contactHeroSubtitle || null,
        contactFormTitle: data.contactFormTitle || null,
        contactSuccessMessage: data.contactSuccessMessage || null,
        heroBadge: data.heroBadge || null,
        heroSubtitle: data.heroSubtitle || null,
        heroShopButtonText: data.heroShopButtonText || null,
        heroShopButtonLink: data.heroShopButtonLink || null,
        heroBookButtonText: data.heroBookButtonText || null,
        heroBookButtonLink: data.heroBookButtonLink || null,
        heroSlide1Icon: data.heroSlide1Icon || null,
        heroSlide1Label: data.heroSlide1Label || null,
        heroSlide1Title: data.heroSlide1Title || null,
        heroSlide1Desc: data.heroSlide1Desc || null,
        heroSlide1Button: data.heroSlide1Button || null,
        heroSlide1Link: data.heroSlide1Link || null,
        heroSlide1BgStart: data.heroSlide1BgStart || null,
        heroSlide1BgEnd: data.heroSlide1BgEnd || null,
        heroSlide2Icon: data.heroSlide2Icon || null,
        heroSlide2Label: data.heroSlide2Label || null,
        heroSlide2Title: data.heroSlide2Title || null,
        heroSlide2Desc: data.heroSlide2Desc || null,
        heroSlide2Button: data.heroSlide2Button || null,
        heroSlide2Link: data.heroSlide2Link || null,
        heroSlide2BgStart: data.heroSlide2BgStart || null,
        heroSlide2BgEnd: data.heroSlide2BgEnd || null,
        shippingZones: data.shippingZones || null,
        freeShippingThreshold: data.freeShippingThreshold || 300000,
        linkHoverColor: data.linkHoverColor || '#c4367b',
        borderRadius: data.borderRadius || 'medium',
        buttonStyle: data.buttonStyle || 'rounded',
        layoutStyle: data.layoutStyle || 'full-width',
        enableWhatsAppOrder: data.enableWhatsAppOrder !== undefined ? data.enableWhatsAppOrder : true,
        enableGuestCheckout: data.enableGuestCheckout !== undefined ? data.enableGuestCheckout : true,
        enableReviews: data.enableReviews !== undefined ? data.enableReviews : true,
        enableTestimonials: data.enableTestimonials !== undefined ? data.enableTestimonials : true,
        enableBlog: data.enableBlog !== undefined ? data.enableBlog : true,
        enableGallery: data.enableGallery !== undefined ? data.enableGallery : true,
        enableFaq: data.enableFaq !== undefined ? data.enableFaq : true,
        minOrderAmount: data.minOrderAmount || 0,
        maxOrderQuantity: data.maxOrderQuantity || 99,
        cartExpiryDays: data.cartExpiryDays || 7,
        siteDescription: data.siteDescription || null,
        siteKeywords: data.siteKeywords || null,
      }
    }
  } catch (error) {
    console.error('Error fetching settings:', error)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header settings={settings} />
      <main className="flex-1">
        {children}
      </main>
      <Footer settings={settings} />
    </div>
  )
}