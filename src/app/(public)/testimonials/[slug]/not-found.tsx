import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function TestimonialNotFound() {
  const settings = await prisma.settings.findUnique({
    where: { id: 'default' },
  })

  const primaryColor = settings?.colorPrimary || '#c4367b'
  const fontFamily = settings?.fontFamily || 'Inter'
  const headingFontSize = settings?.headingFontSize || '32px'
  const bodyFontSize = settings?.bodyFontSize || '16px'
  const smallFontSize = settings?.smallFontSize || '14px'

  return (
    <div className="container mx-auto px-4 py-16 text-center" style={{ fontFamily: fontFamily }}>
      <div className="max-w-md mx-auto">
        <div className="text-6xl mb-6">😕</div>
        <h1 className="font-bold text-gray-800 mb-3" style={{ fontSize: headingFontSize }}>
          Testimonial Not Found
        </h1>
        <p className="text-gray-500 mb-8" style={{ fontSize: bodyFontSize }}>
          The testimonial you're looking for doesn't exist or has been removed.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/testimonials"
            className="px-6 py-3 rounded-lg text-white font-medium transition-all hover:opacity-90"
            style={{ backgroundColor: primaryColor, fontSize: smallFontSize }}
          >
            View All Testimonials
          </Link>
          <Link
            href="/"
            className="px-6 py-3 rounded-lg border-2 font-medium transition-all hover:bg-gray-50"
            style={{ borderColor: primaryColor, color: primaryColor, fontSize: smallFontSize }}
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}