import { prisma } from '@/lib/prisma'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import WhatsAppFloat from '@/components/public/WhatsAppFloat'

// Interface untuk Settings dengan tipe yang lebih fleksibel
interface Settings {
  id: string
  siteName: string
  colorPrimary: string
  colorSecondary: string
  colorButton: string
  fontFamily: string
  logoUrl: string | null
  faviconUrl: string | null
  heroBannerUrl: string | null
  whatsappNumber: string | null
  email: string | null
  address: string | null
  footerContent: string | null
  operatingHours: Record<string, { open: string; close: string }> | null
  googleMapsEmbedUrl: string | null
  socialLinks: any // ← Biarkan any untuk Json
  gaTrackingId: string | null
  metaTitle: string | null
  metaDescription: string | null
  defaultOgImage: string | null
  createdAt: Date
  updatedAt: Date
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await prisma.settings.findUnique({
    where: { id: 'default' },
  }) as Settings | null

  return (
    <>
      <Header settings={settings} />
      <main className="flex-1">
        {children}
      </main>
      <Footer settings={settings} />
      <WhatsAppFloat settings={settings} />
    </>
  )
}
