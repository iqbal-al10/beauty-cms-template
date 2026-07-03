import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, Clock, CheckCircle, Share2, Star } from 'lucide-react'
import ShareButton from '@/components/public/ShareButton'

interface BookingDetailPageProps {
  params: Promise<{
    slug: string
  }>
}

const PRESET_COLORS = [
  { value: 'bg-red-500', hex: '#EF4444', label: 'Red' },
  { value: 'bg-blue-500', hex: '#3B82F6', label: 'Blue' },
  { value: 'bg-green-500', hex: '#22C55E', label: 'Green' },
  { value: 'bg-yellow-500', hex: '#EAB308', label: 'Yellow' },
  { value: 'bg-purple-500', hex: '#A855F7', label: 'Purple' },
  { value: 'bg-pink-500', hex: '#EC4899', label: 'Pink' },
  { value: 'bg-orange-500', hex: '#F97316', label: 'Orange' },
  { value: 'bg-teal-500', hex: '#14B8A6', label: 'Teal' },
  { value: 'bg-indigo-500', hex: '#6366F1', label: 'Indigo' },
  { value: 'bg-rose-500', hex: '#F43F5E', label: 'Rose' },
]

const getTagColor = (color: string | null): string => {
  if (!color) return '#6B7280'
  if (color.startsWith('#')) return color
  const preset = PRESET_COLORS.find(p => p.value === color)
  if (preset) return preset.hex
  return '#6B7280'
}

export async function generateMetadata({ params }: BookingDetailPageProps) {
  const { slug } = await params

  const service = await prisma.service.findUnique({
    where: { slug },
  })

  if (!service) {
    return {
      title: 'Layanan Tidak Ditemukan',
    }
  }

  return {
    title: service.metaTitle || service.name,
    description: service.metaDescription || service.description || 'Detail layanan',
    openGraph: {
      title: service.name,
      description: service.description || 'Detail layanan',
      images: service.ogImageUrl || service.imageUrl ? [service.ogImageUrl || service.imageUrl || ''] : [],
    },
  }
}

export default async function BookingDetailPage({ params }: BookingDetailPageProps) {
  const { slug } = await params

  const service = await prisma.service.findUnique({
    where: { slug },
    include: {
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
      promos: {
        include: {
          promo: true,
        },
      },
      reviews: {
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!service) {
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

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`
  }

  const tags = service.tags?.map((st) => st.tag) || []
  const reviews = service.reviews || []

  const relatedServices = await prisma.service.findMany({
    where: {
      categoryId: service.categoryId,
      id: { not: service.id },
      isActive: true,
    },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
      reviews: {
        where: { isPublished: true },
      },
    },
    take: 4,
  })

  const transformedRelated = relatedServices.map((s) => ({
    ...s,
    tags: s.tags?.map((st) => st.tag) || [],
  }))

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/booking/${service.slug}`

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl" style={{ fontFamily: fontFamily }}>
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2 flex-wrap" style={{ fontSize: smallFontSize }}>
        <Link href="/" className="hover:text-[#c4367b] flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>
        <span className="mx-1">/</span>
        <Link href="/booking" className="hover:text-[#c4367b]">Booking</Link>
        <span className="mx-1">/</span>
        <span className="text-gray-800">{service.name}</span>
      </nav>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        {/* Gambar dan Info */}
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          <div className="md:w-1/3">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl aspect-square flex items-center justify-center relative overflow-hidden">
              {service.imageUrl ? (
                <img 
                  src={service.imageUrl} 
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-8xl">🧖</span>
              )}
              
              {tags.length > 0 && (
                <div className="absolute top-4 left-4 flex flex-col gap-1">
                  {tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag.id}
                      className="text-xs font-bold px-3 py-1 rounded-full text-white truncate max-w-[120px] shadow-md"
                      style={{ backgroundColor: getTagColor(tag.color), fontSize: smallFontSize }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="md:w-2/3">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-800" style={{ fontSize: headingFontSize }}>
                {service.name}
              </h1>
            </div>

            {service.description && (
              <p className="text-gray-600 mb-6 leading-relaxed" style={{ fontSize: bodyFontSize }}>
                {service.description}
              </p>
            )}

            {/* HAPUS ICON DOLLAR - PAKAI Rp */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <Clock className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500" style={{ fontSize: smallFontSize }}>Durasi</p>
                <p className="font-semibold text-gray-800" style={{ fontSize: bodyFontSize }}>
                  {service.duration} menit
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-500" style={{ fontSize: smallFontSize }}>Harga</p>
                <p className="font-bold" style={{ color: primaryColor, fontSize: bodyFontSize }}>
                  {formatCurrency(service.price)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <CheckCircle className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500" style={{ fontSize: smallFontSize }}>Status</p>
                <p className={`font-semibold ${service.isActive ? 'text-green-600' : 'text-red-600'}`} style={{ fontSize: bodyFontSize }}>
                  {service.isActive ? 'Tersedia' : 'Tidak Tersedia'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-gray-200">
          <Link
            href={`/booking/booking?service=${service.id}`}
            className="flex-1 min-w-[200px] px-8 py-3 rounded-full text-white font-semibold text-center transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: primaryColor, fontSize: bodyFontSize }}
          >
            Book Now
          </Link>

          <ShareButton
            title={service.name}
            text={service.description || 'Booking layanan ini'}
            url={shareUrl}
          />

          {settings?.whatsappNumber && (
            <a
              href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=Halo%20saya%20tertarik%20dengan%20layanan%20${encodeURIComponent(service.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-full border-2 font-semibold text-center transition-all hover:bg-gray-50"
              style={{ borderColor: '#25D366', color: '#25D366', fontSize: bodyFontSize }}
            >
              💬 WhatsApp
            </a>
          )}
        </div>
      </div>

      {/* ===== SERVICE REVIEWS ===== */}
      {reviews.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6" style={{ fontSize: headingFontSize }}>
            Customer Reviews ({reviews.length})
          </h2>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-gray-50 p-4 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex">{renderStars(review.rating)}</div>
                  <span className="font-semibold text-gray-800" style={{ fontSize: bodyFontSize }}>
                    {review.customerName}
                  </span>
                  <span className="text-xs text-gray-400" style={{ fontSize: smallFontSize }}>
                    {new Date(review.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-gray-600 text-sm" style={{ fontSize: bodyFontSize }}>
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== RELATED SERVICES - SAMA SEPERTI RELATED PRODUCTS ===== */}
      {transformedRelated.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6" style={{ fontSize: headingFontSize }}>
            Layanan Terkait
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {transformedRelated.map((related) => {
              const relatedTags = related.tags || []
              return (
                <Link
                  key={related.id}
                  href={`/booking/${related.slug}`}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1"
                  style={{ borderColor: `${primaryColor}20` }}
                >
                  <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative">
                    {related.imageUrl ? (
                      <img 
                        src={related.imageUrl} 
                        alt={related.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <span className="text-4xl">🧖</span>
                    )}
                    {relatedTags.length > 0 && (
                      <div className="absolute top-2 left-2 flex flex-col gap-0.5">
                        {relatedTags.slice(0, 1).map((tag) => (
                          <span
                            key={tag.id}
                            className="text-[8px] font-bold px-1.5 py-0.5 rounded-full text-white truncate max-w-[60px]"
                            style={{ backgroundColor: getTagColor(tag.color) }}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-800 group-hover:text-[#c4367b] transition-colors line-clamp-1 text-sm" style={{ fontSize: smallFontSize }}>
                      {related.name}
                    </h3>
                    <p className="text-sm font-bold mt-1" style={{ color: primaryColor, fontSize: smallFontSize }}>
                      {formatCurrency(related.price)}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}