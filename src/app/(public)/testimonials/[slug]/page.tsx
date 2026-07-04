import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Star, ArrowLeft } from 'lucide-react'

interface TestimonialDetailPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function TestimonialDetailPage({ params }: TestimonialDetailPageProps) {
  const { slug } = await params

  // Slug dibuat dari customerName
  const name = slug.replace(/-/g, ' ')

  const testimonial = await prisma.testimonial.findFirst({
    where: {
      customerName: {
        equals: name,
        mode: 'insensitive',
      },
      isPublished: true,
    },
    include: {
      beforeAfter: true,
    },
  })

  if (!testimonial) {
    notFound()
  }

  const settings = await prisma.settings.findUnique({
    where: { id: 'default' },
  })

  const primaryColor = settings?.colorPrimary || '#c4367b'
  const headingFontSize = settings?.headingFontSize || '32px'
  const bodyFontSize = settings?.bodyFontSize || '16px'
  const smallFontSize = settings?.smallFontSize || '14px'
  const fontFamily = settings?.fontFamily || 'Inter'

  // Get related testimonials (excluding current)
  const relatedTestimonials = await prisma.testimonial.findMany({
    where: {
      id: { not: testimonial.id },
      isPublished: true,
    },
    include: {
      beforeAfter: true,
    },
    orderBy: { sortOrder: 'asc' },
    take: 4,
  })

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-6 h-6 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

  const renderSmallStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

  return (
    <div className="container mx-auto px-4 py-8" style={{ fontFamily: fontFamily }}>
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2" style={{ fontSize: smallFontSize }}>
        <Link href="/" className="hover:text-[#c4367b] flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>
        <span className="mx-1">/</span>
        <Link href="/testimonials" className="hover:text-[#c4367b]">Testimonials</Link>
        <span className="mx-1">/</span>
        <span className="text-gray-800">{testimonial.customerName}</span>
      </nav>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-4 mb-6">
          {testimonial.customerPhotoUrl ? (
            <img
              src={testimonial.customerPhotoUrl}
              alt={testimonial.customerName}
              className="w-20 h-20 object-cover rounded-full border-2"
              style={{ borderColor: primaryColor }}
            />
          ) : (
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl"
              style={{ backgroundColor: primaryColor }}
            >
              {testimonial.customerName.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="font-bold text-gray-800" style={{ fontSize: headingFontSize }}>
              {testimonial.customerName}
            </h1>
            <div className="flex mt-1">{renderStars(testimonial.rating)}</div>
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 leading-relaxed" style={{ fontSize: bodyFontSize }}>
            {testimonial.reviewText}
          </p>
        </div>

        {testimonial.beforeAfter && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h2 className="font-semibold text-gray-800 mb-4" style={{ fontSize: headingFontSize }}>
              Before & After Results
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-xl overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={testimonial.beforeAfter.beforeImageUrl}
                    alt="Before"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-3 left-3 bg-black/70 text-white text-xs px-3 py-1 rounded-full">
                    Before
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={testimonial.beforeAfter.afterImageUrl}
                    alt="After"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-3 left-3 bg-black/70 text-white text-xs px-3 py-1 rounded-full">
                    After
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <h3 className="font-semibold text-gray-800" style={{ fontSize: bodyFontSize }}>
                {testimonial.beforeAfter.title}
              </h3>
              <p className="text-gray-500" style={{ fontSize: smallFontSize }}>
                {testimonial.beforeAfter.category}
              </p>
              {testimonial.beforeAfter.description && (
                <p className="text-gray-600 mt-1" style={{ fontSize: bodyFontSize }}>
                  {testimonial.beforeAfter.description}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <Link
            href="/testimonials"
            className="inline-flex items-center gap-1 font-medium transition-colors"
            style={{ color: primaryColor, fontSize: smallFontSize }}
          >
            ← Back to Testimonials
          </Link>
        </div>
      </div>

      {/* ===== RELATED TESTIMONIALS ===== */}
      {relatedTestimonials.length > 0 && (
        <div className="mt-16">
          <h2 className="font-bold text-gray-800 mb-6" style={{ fontSize: headingFontSize }}>
            Other Testimonials
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedTestimonials.map((item) => {
              const slug = item.customerName.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '')
              
              return (
                <Link
                  key={item.id}
                  href={`/testimonials/${slug}`}
                  className="group bg-white p-4 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:-translate-y-1"
                  style={{ borderColor: `${primaryColor}20` }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {item.customerPhotoUrl ? (
                      <img
                        src={item.customerPhotoUrl}
                        alt={item.customerName}
                        className="w-10 h-10 object-cover rounded-full border"
                        style={{ borderColor: primaryColor }}
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {item.customerName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm" style={{ fontSize: smallFontSize }}>
                        {item.customerName}
                      </h3>
                      <div className="flex">{renderSmallStars(item.rating)}</div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm line-clamp-2" style={{ fontSize: bodyFontSize }}>
                    "{item.reviewText}"
                  </p>

                  {item.beforeAfter && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <div className="flex gap-1">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={item.beforeAfter.beforeImageUrl} alt="Before" className="w-full h-full object-cover" />
                        </div>
                        <div className="w-8 h-8 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={item.beforeAfter.afterImageUrl} alt="After" className="w-full h-full object-cover" />
                        </div>
                        <p className="text-xs text-gray-500 truncate flex-1" style={{ fontSize: smallFontSize }}>
                          {item.beforeAfter.title}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mt-2 text-xs font-medium" style={{ color: primaryColor, fontSize: smallFontSize }}>
                    Read More →
                  </div>
                </Link>
              )
            })}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/testimonials"
              className="font-medium transition-colors"
              style={{ color: primaryColor, fontSize: bodyFontSize }}
            >
              View All Testimonials →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}