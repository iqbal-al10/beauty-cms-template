import { prisma } from '@/lib/prisma'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import WhatsAppFloat from '@/components/public/WhatsAppFloat'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await prisma.settings.findUnique({
    where: { id: 'default' },
  })

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
