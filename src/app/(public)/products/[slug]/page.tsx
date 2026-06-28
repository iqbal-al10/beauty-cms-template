import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import Link from 'next/link'
import ShareButton from '@/components/public/ShareButton'
import { ArrowLeft } from 'lucide-react'

interface ProductDetailPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: ProductDetailPageProps) {
  const { slug } = await params
  
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { 
      category: true,
      tags: true,
    },
  })

  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }

  return {
    title: product.metaTitle || product.name,
    description: product.metaDescription || product.description || 'Product detail',
    openGraph: {
      title: product.name,
      description: product.description || 'Product detail',
      images: product.ogImageUrl ? [product.ogImageUrl] : [],
    },
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params

  const now = new Date()

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      tags: true,
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

  if (!product) {
    notFound()
  }

  // Filter promo aktif
  const activePromos = product.promos
    ?.map((pp: any) => pp.promo)
    .filter((p: any) => p && p.isActive)
    .filter((p: any) => {
      const start = new Date(p.startDate)
      const end = new Date(p.endDate)
      return start <= now && end >= now && p.type !== 'VOUCHER'
    }) || []

  // Hitung diskon
  let finalPrice = product.price
  let discountAmount = 0
  let appliedPromo = null

  if (activePromos.length > 0) {
    const promo = activePromos[0]
    appliedPromo = promo

    if (promo.discountType === 'PERCENTAGE' && promo.discountValue) {
      discountAmount = (product.price * promo.discountValue) / 100
      finalPrice = product.price - discountAmount
    } else if (promo.discountType === 'FIXED' && promo.discountValue) {
      discountAmount = promo.discountValue
      finalPrice = Math.max(0, product.price - discountAmount)
    }
  }

  const settings = await prisma.settings.findUnique({
    where: { id: 'default' },
  })

  const primaryColor = settings?.colorPrimary || '#c4367b'

  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      status: 'PUBLISHED',
    },
    include: {
      category: true,
      tags: true,
    },
    take: 4,
  })

  const whatsappNumber = settings?.whatsappNumber || ''
  const cleanWhatsapp = whatsappNumber.replace(/[^0-9]/g, '')
  const whatsappMessage = `Halo%20saya%20tertarik%20dengan%20produk%20${encodeURIComponent(product.name)}%20harga%20Rp%20${Math.round(finalPrice).toLocaleString()}`
  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/products/${product.slug}`

  const hasComparePrice = product.compareAtPrice && product.compareAtPrice > product.price
  const hasPromo = appliedPromo !== null
  const hasDiscount = discountAmount > 0
  const displayPrice = Math.round(finalPrice)

  const priceData = {
    compareAtPrice: product.compareAtPrice || null,
    originalPrice: product.price,
    finalPrice: Math.round(finalPrice),
    hasComparePrice: hasComparePrice,
    hasPromo: hasPromo,
    discountAmount: Math.round(discountAmount),
    promoName: appliedPromo?.title || null,
    promoDiscount: appliedPromo?.discountValue || null,
    promoType: appliedPromo?.discountType || null,
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-[#c4367b] flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>
        <span className="mx-1">/</span>
        <Link href="/products" className="hover:text-[#c4367b]">Products</Link>
        <span className="mx-1">/</span>
        <span className="text-gray-800">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl aspect-square flex items-center justify-center relative">
          <span className="text-8xl">🧴</span>
          {hasComparePrice && (
            <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full">
              SALE
            </span>
          )}
          {hasPromo && appliedPromo && (
            <span className="absolute top-4 right-4 bg-pink-800 text-white text-sm font-bold px-3 py-1.5 rounded-full">
              🔥 {appliedPromo.title}
            </span>
          )}
        </div>

        <div>
          {product.tags && product.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mb-3">
              {product.tags.map((tag: any) => (
                <span
                  key={tag.id}
                  className="px-3 py-1 text-xs text-white rounded-full"
                  style={{ 
                    backgroundColor: tag.color || '#6B7280',
                  }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
          <p className="text-gray-500 mb-4">{product.category?.name}</p>

          {product.reviews.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-yellow-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              <span className="text-sm text-gray-500">
                ({product.reviews.length} reviews)
              </span>
            </div>
          )}

          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-bold" style={{ color: primaryColor }}>
              Rp {displayPrice.toLocaleString()}
            </span>
            {hasComparePrice && (
              <span className="text-lg text-gray-400 line-through">
                Rp {product.compareAtPrice.toLocaleString()}
              </span>
            )}
            {hasDiscount && (
              <span className="text-lg text-pink-400 line-through">
                Rp {product.price.toLocaleString()}
              </span>
            )}
          </div>

          {hasPromo && appliedPromo && (
            <div className="bg-pink-100 border border-pink-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-pink-800">
                🔥 <span className="font-semibold">{appliedPromo.title}</span>
                {appliedPromo.discountType === 'PERCENTAGE' 
                  ? ` - ${appliedPromo.discountValue}% OFF` 
                  : ` - Rp ${appliedPromo.discountValue?.toLocaleString()} OFF`}
              </p>
            </div>
          )}

          <div className="mb-6">
            <span className={`text-sm font-medium ${
              product.stock > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {product.stock > 0 ? '✅ In Stock' : '❌ Out of Stock'}
            </span>
            <span className="text-sm text-gray-400 ml-2">
              ({product.stock} units available)
            </span>
          </div>

          {product.description && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/booking?product=${product.id}`}
              className="flex-1 min-w-[200px] px-6 py-3 rounded-full text-white font-semibold text-center transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: primaryColor }}
            >
              🛒 Order Now
            </Link>
            {cleanWhatsapp && (
              <a
                href={`https://wa.me/${cleanWhatsapp}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-full border-2 font-semibold text-center transition-all hover:bg-gray-50"
                style={{ 
                  borderColor: primaryColor,
                  color: primaryColor,
                }}
              >
                💬 WhatsApp
              </a>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">Share this product:</p>
            <div className="flex gap-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${product.name} - Rp ${displayPrice.toLocaleString()} - ${shareUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm transition-colors"
              >
                💬 WhatsApp
              </a>
              <ShareButton
                title={product.name}
                text={product.description || ''}
                url={shareUrl}
              />
            </div>
          </div>

          {/* ===== KETERANGAN HARGA - DI BAWAH SHARE ===== */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mt-3">Keterangan Harga</h4>
            <div className="bg-gray-50 rounded-xl p-4 space-y-1">
              {/* Harga Awal (dari compareAtPrice) */}
              {priceData.hasComparePrice && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Harga Awal</span>
                  <span className="text-gray-400 line-through">
                    Rp {priceData.compareAtPrice?.toLocaleString()}
                  </span>
                </div>
              )}

              {/* Harga Normal - LABEL text-gray-600, NOMINAL text-pink-500 */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Harga Normal</span>
                <span className="text-pink-400 font-medium">
                  Rp {priceData.originalPrice.toLocaleString()}
                </span>
              </div>

              {/* Harga Promo - LABEL & NOMINAL primaryColor */}
              {priceData.hasPromo && (
                <div className="flex justify-between text-sm">
                  <span className="font-medium" style={{ color: primaryColor }}>
                    Harga Promo
                  </span>
                  <span className="font-bold" style={{ color: primaryColor }}>
                    Rp {priceData.finalPrice.toLocaleString()}
                  </span>
                </div>
              )}

              {/* Tambahan Informasi */}
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-400 italic">
                  * Harga dapat berubah sewaktu-waktu
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedProducts.map((related) => {
              const hasRelatedCompare = related.compareAtPrice && related.compareAtPrice > related.price
              return (
                <Link
                  key={related.id}
                  href={`/products/${related.slug}`}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1"
                  style={{ borderColor: `${primaryColor}20` }}
                >
                  <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 relative">
                    <span className="text-4xl">🧴</span>
                    {hasRelatedCompare && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        SALE
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-800 group-hover:text-[#c4367b] transition-colors line-clamp-1 text-sm">
                      {related.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm font-bold" style={{ color: primaryColor }}>
                        Rp {related.price.toLocaleString()}
                      </p>
                      {hasRelatedCompare && (
                        <p className="text-xs text-gray-400 line-through">
                          Rp {related.compareAtPrice.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* REVIEWS */}
      {product.reviews.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Customer Reviews</h2>
          <div className="space-y-4">
            {product.reviews.map((review) => (
              <div key={review.id} className="bg-gray-50 p-4 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex text-yellow-400">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ))}
                  </div>
                  <span className="font-semibold text-gray-800">{review.customerName}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString('id-ID')}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-gray-600 text-sm">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
