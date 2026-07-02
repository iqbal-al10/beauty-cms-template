import { prisma } from '@/lib/prisma'
import Header from '@/components/public/Header'
import Footer from '@/components/public/Footer'

interface Settings {
  siteName: string
  colorPrimary: string
  colorSecondary: string
  colorButton: string
  fontFamily: string
  logoUrl: string | null
  navbarBackground: string
  navbarTextColor: string
  navbarHoverColor: string
  navbarActiveColor: string
  enableCart: boolean
  navStyle: string
  headingFontSize: string
  bodyFontSize: string
  smallFontSize: string
  address: string | null
  whatsappNumber: string | null
  email: string | null
  socialLinks: any
  footerContent: any
  secondaryBackground: string
  headingColor: string
  bodyTextColor: string
  copyrightText: string
  footerLinks: any
  primaryBackground: string
}

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
        siteName: data.siteName || 'Beauty Studio',
        colorPrimary: data.colorPrimary || '#c4367b',
        colorSecondary: data.colorSecondary || '#f5dbe8',
        colorButton: data.colorButton || '#aa1d68',
        fontFamily: data.fontFamily || 'Inter',
        logoUrl: data.logoUrl || null,
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
        secondaryBackground: data.secondaryBackground || '#f8f9fa', // ← PASTIKAN INI
        headingColor: data.headingColor || '#111827',
        bodyTextColor: data.bodyTextColor || '#4b5563',
        copyrightText: data.copyrightText || '',
        footerLinks: data.footerLinks || null,
        primaryBackground: data.primaryBackground || '#ffffff',
      }
      
      console.log('🎨 Layout Settings:', {
        secondaryBackground: settings.secondaryBackground,
        headingColor: settings.headingColor,
        bodyTextColor: settings.bodyTextColor,
      })
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