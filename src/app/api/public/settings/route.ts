import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const settings = await prisma.settings.findUnique({
      where: { id: 'default' },
    })

    if (!settings) {
      // Return default settings jika tidak ada di database
      return NextResponse.json({
        siteName: 'Beauty Studio',
        colorPrimary: '#c4367b',
        colorSecondary: '#f5dbe8',
        colorButton: '#aa1d68',
        fontFamily: 'Inter',
        heroBannerUrl: null,
        enableCart: true,
        headingFontSize: '32px',
        bodyFontSize: '16px',
        smallFontSize: '14px',
        logoUrl: null,
        faviconUrl: null,
        whatsappNumber: null,
        email: null,
        address: null,
        socialLinks: {},
        gaTrackingId: null,
      })
    }

    // Return hanya field yang dibutuhkan untuk public
    return NextResponse.json({
      siteName: settings.siteName,
      colorPrimary: settings.colorPrimary,
      colorSecondary: settings.colorSecondary,
      colorButton: settings.colorButton,
      fontFamily: settings.fontFamily,
      heroBannerUrl: settings.heroBannerUrl,
      enableCart: settings.enableCart,
      headingFontSize: settings.headingFontSize,
      bodyFontSize: settings.bodyFontSize,
      smallFontSize: settings.smallFontSize,
      logoUrl: settings.logoUrl,
      faviconUrl: settings.faviconUrl,
      whatsappNumber: settings.whatsappNumber,
      email: settings.email,
      address: settings.address,
      socialLinks: settings.socialLinks,
      gaTrackingId: settings.gaTrackingId,
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    // Return default settings on error
    return NextResponse.json({
      siteName: 'Beauty Studio',
      colorPrimary: '#c4367b',
      colorSecondary: '#f5dbe8',
      colorButton: '#aa1d68',
      fontFamily: 'Inter',
      heroBannerUrl: null,
      enableCart: true,
      headingFontSize: '32px',
      bodyFontSize: '16px',
      smallFontSize: '14px',
      logoUrl: null,
      faviconUrl: null,
      whatsappNumber: null,
      email: null,
      address: null,
      socialLinks: {},
      gaTrackingId: null,
    })
  }
}