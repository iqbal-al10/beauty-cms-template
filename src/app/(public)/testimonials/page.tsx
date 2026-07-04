import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Star } from 'lucide-react'

interface TestimonialsPageProps {
  searchParams: Promise<{
    page?: string
  }>
}

export default async function TestimonialsPage({ searchParams }: TestimonialsPageProps) {
  const params = await searchParams
  const page = parseInt(params?.page || '1', 10)
  const limit = 9
  const skip = (page - 1) * limit

  const settings = await prisma.settings.findUnique({
    where: { id: 'default' },
  })

  const primaryColor = settings?.colorPrimary || '#c4367b'
  const headingFontSize = settings?.headingFontSize || '32px'
  const bodyFontSize = settings?.bodyFontSize || '16px'
  const smallFontSize = settings?.smallFontSize || '14px'
  const fontFamily = settings?.fontFamily || 'Inter'

  const [testimonials, total] = await Promise.all([
    prisma.testimonial.findMany({
      where: { isPublished: true },
      include: {
        beforeAfter: true,
      },
      orderBy: { sortOrder: 'asc' },
      skip,
      take: limit,
    }),
    prisma.testimonial.count({
      where: { isPublished: true },
    }),
  ])

  const totalPages = Math.ceil(total / limit)

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

  return (
    <div className="container mx-auto px-4 py-8" style={{ fontFamily: fontFamily }}>
      <div className="mb-8 text-center">
        <h1 className="font-bold text-gray-800" style={{ fontSize: headingFontSize }}>
          What Our Customers Say
        </h1>
        <p className="text-gray-500 mt-1" style={{ fontSize: bodyFontSize }}>
          Real reviews from real people
        </p>
      </div>

      {testimonials.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-gray-500" style={{ fontSize: bodyFontSize }}>No testimonials yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((item) => {
            // Generate slug dari customerName
            const slug = item.customerName.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '')
            
            return (
              <Link
                key={item.id}
                href={`/testimonials/${slug}`}
                className="group bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:-translate-y-1"
                style={{ borderColor: `${primaryColor}20` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  {item.customerPhotoUrl ? (
                    <img
                      src={item.customerPhotoUrl}
                      alt={item.customerName}
                      className="w-12 h-12 object-cover rounded-full border-2"
                      style={{ borderColor: primaryColor }}
                    />
                  ) : (
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {item.customerName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-800" style={{ fontSize: bodyFontSize }}>
                      {item.customerName}
                    </h3>
                    <div className="flex">{renderStars(item.rating)}</div>
                  </div>
                </div>

                <p className="text-gray-600 line-clamp-3" style={{ fontSize: bodyFontSize }}>
                  "{item.reviewText}"
                </p>

                {item.beforeAfter && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex gap-2">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                        <img src={item.beforeAfter.beforeImageUrl} alt="Before" className="w-full h-full object-cover" />
                      </div>
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                        <img src={item.beforeAfter.afterImageUrl} alt="After" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-800" style={{ fontSize: smallFontSize }}>
                          {item.beforeAfter.title}
                        </p>
                        <p className="text-xs text-gray-500" style={{ fontSize: smallFontSize }}>
                          {item.beforeAfter.category}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-3 text-sm font-medium" style={{ color: primaryColor, fontSize: smallFontSize }}>
                  Read More →
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          {Array.from({ length: totalPages }).map((_, i) => {
            const pageNum = i + 1
            const isActive = pageNum === page
            return (
              <Link
                key={i}
                href={`/testimonials?page=${pageNum}`}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={isActive ? { backgroundColor: primaryColor } : {}}
              >
                {pageNum}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}