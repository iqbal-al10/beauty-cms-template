'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice: number | null
  status: string
  isFeatured: boolean
  category: { name: string } | null
}

interface Promo {
  id: string
  title: string
  type: string
  discountValue: number | null
  discountType: string | null
  startDate: string
  endDate: string
  bannerUrl: string | null
  isActive: boolean
}

interface Testimonial {
  id: string
  customerName: string
  rating: number
  reviewText: string
  isPublished: boolean
}

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImageUrl: string | null
  status: string
  publishedAt: string | null
  category: { name: string } | null
}

interface Category {
  id: string
  name: string
  slug: string
  isActive: boolean
}

interface Settings {
  siteName: string
  colorPrimary: string
  colorSecondary: string
  colorButton: string
  heroBannerUrl: string | null
}

export default function HomePage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [activePromos, setActivePromos] = useState<Promo[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [latestBlogs, setLatestBlogs] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const primaryColor = '#c4367b'
  const secondaryColor = '#f5dbe8'
  const buttonColor = '#c4367b'
  const buttonHoverColor = '#e20373'

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch settings
        const settingsRes = await fetch('/api/public/settings')
        if (settingsRes.ok) {
          const data = await settingsRes.json()
          setSettings(data)
        }

        // Fetch featured products
        const productsRes = await fetch('/api/public/products?featured=true&limit=4')
        if (productsRes.ok) {
          const data = await productsRes.json()
          setFeaturedProducts(data || [])
        }

        // Fetch active promos
        const promosRes = await fetch('/api/public/promos?active=true&limit=1')
        if (promosRes.ok) {
          const data = await promosRes.json()
          setActivePromos(data || [])
        }

        // Fetch testimonials
        const testimonialsRes = await fetch('/api/public/testimonials?limit=3')
        if (testimonialsRes.ok) {
          const data = await testimonialsRes.json()
          setTestimonials(data || [])
        }

        // Fetch latest blogs
        const blogsRes = await fetch('/api/public/blogs?limit=3')
        if (blogsRes.ok) {
          const data = await blogsRes.json()
          setLatestBlogs(data || [])
        }

        // Fetch categories
        const categoriesRes = await fetch('/api/public/categories?limit=6')
        if (categoriesRes.ok) {
          const data = await categoriesRes.json()
          setCategories(data || [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const siteName = settings?.siteName || 'Beauty Studio'
  const heroBanner = settings?.heroBannerUrl || ''

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: primaryColor }} />
      </div>
    )
  }

  return (
    <div>
      {/* Hero Section */}
      <section 
        className="relative min-h-[70vh] flex items-center overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        }}
      >
        {heroBanner ? (
          <Image
            src={heroBanner}
            alt={siteName}
            fill
            className="object-cover opacity-40"
            priority
          />
        ) : null}
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4 border border-white/20">
              <svg className="w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span className="text-white text-sm font-medium">Premium Beauty Services</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
              {siteName}
            </h1>
            <p className="text-xl text-white/90 mb-8 drop-shadow-md max-w-lg">
              Discover premium beauty services and products for your perfect look
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/products"
                className="px-8 py-3 rounded-full text-white font-semibold text-lg transition-all hover:opacity-90 hover:-translate-y-0.5 shadow-lg active:scale-95"
                style={{ backgroundColor: buttonColor }}
              >
                Shop Now
              </Link>
              <Link
                href="/booking"
                className="px-8 py-3 rounded-full bg-white/20 backdrop-blur-sm text-white font-semibold text-lg border border-white/30 hover:bg-white/30 transition-all"
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Quick Navigation */}
      {categories.length > 0 && (
        <section className="py-12 border-b border-gray-100" style={{ backgroundColor: `${secondaryColor}40` }}>
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${category.slug}`}
                  className="px-6 py-2 rounded-full text-sm font-medium transition-all hover:shadow-md hover:-translate-y-0.5"
                  style={{
                    backgroundColor: `${primaryColor}15`,
                    color: primaryColor,
                    border: `1px solid ${primaryColor}30`,
                  }}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">
                Featured Products
              </h2>
              <p className="text-gray-500 mt-1">Our best picks just for you</p>
            </div>
            <Link
              href="/products"
              className="flex items-center gap-1 font-medium transition-colors"
              style={{ color: primaryColor }}
            >
              View All 
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-4 border border-gray-100 hover:-translate-y-2"
                  style={{ borderColor: `${primaryColor}20` }}
                >
                  <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg mb-4 flex items-center justify-center group-hover:from-[#f5dbe8]/50 group-hover:to-[#f5dbe8]/20 transition-colors relative overflow-hidden">
                    <span className="text-5xl group-hover:scale-110 transition-transform duration-300">🧴</span>
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        SALE
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-800 group-hover:text-[#c4367b] transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500">{product.category?.name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-lg font-bold" style={{ color: primaryColor }}>
                      Rp {product.price.toLocaleString()}
                    </p>
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <p className="text-sm text-gray-400 line-through">
                        Rp {product.compareAtPrice.toLocaleString()}
                      </p>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-gray-500 col-span-full text-center py-8">
                No featured products available
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      {activePromos.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            {activePromos.map((promo) => (
              <div
                key={promo.id}
                className="rounded-2xl overflow-hidden relative"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${buttonHoverColor} 100%)`,
                }}
              >
                <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
                <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex-1 text-center md:text-left text-white">
                    <span className="inline-block px-4 py-1 text-xs font-semibold bg-white/20 backdrop-blur-sm rounded-full mb-4">
                      🔥 Limited Time Offer
                    </span>
                    <h3 className="text-3xl md:text-4xl font-bold mb-2">
                      {promo.title}
                    </h3>
                    {promo.discountValue && (
                      <p className="text-4xl md:text-5xl font-extrabold mb-4">
                        {promo.discountType === 'PERCENTAGE' 
                          ? `${promo.discountValue}% OFF` 
                          : `Rp ${promo.discountValue.toLocaleString()} OFF`}
                      </p>
                    )}
                    <Link
                      href="/promo"
                      className="inline-block px-8 py-3 rounded-full bg-white text-gray-900 font-semibold transition-all hover:scale-105 hover:shadow-lg active:scale-95"
                    >
                      Grab Now
                    </Link>
                  </div>
                  {promo.bannerUrl && (
                    <div className="flex-shrink-0">
                      <Image
                        src={promo.bannerUrl}
                        alt={promo.title}
                        width={280}
                        height={200}
                        className="rounded-lg object-cover shadow-xl"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-16" style={{ backgroundColor: `${secondaryColor}30` }}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800">
                What Our Customers Say
              </h2>
              <p className="text-gray-500 mt-1">Real reviews from real people</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                  style={{ borderColor: `${primaryColor}20` }}
                >
                  <div className="flex text-yellow-400 mb-3">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-4 italic">
                    "{testimonial.reviewText}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {testimonial.customerName.charAt(0)}
                    </div>
                    <p className="font-semibold text-gray-800">
                      {testimonial.customerName}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link
                href="/testimonials"
                className="font-medium transition-colors"
                style={{ color: primaryColor }}
              >
                See All Testimonials →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Latest Blog */}
      {latestBlogs.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">
                  Latest from Blog
                </h2>
                <p className="text-gray-500 mt-1">Tips and inspiration</p>
              </div>
              <Link
                href="/blog"
                className="flex items-center gap-1 font-medium transition-colors"
                style={{ color: primaryColor }}
              >
                View All 
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestBlogs.map((blog) => (
                <Link
                  key={blog.id}
                  href={`/blog/${blog.slug}`}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1"
                  style={{ borderColor: `${primaryColor}20` }}
                >
                  {blog.coverImageUrl ? (
                    <div className="aspect-video bg-gray-100 relative overflow-hidden">
                      <Image
                        src={blog.coverImageUrl}
                        alt={blog.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                      <span className="text-5xl">📝</span>
                    </div>
                  )}
                  <div className="p-5">
                    {blog.category && (
                      <span
                        className="inline-block text-xs font-medium px-2 py-1 rounded-full mb-2"
                        style={{
                          backgroundColor: `${primaryColor}15`,
                          color: primaryColor,
                        }}
                      >
                        {blog.category.name}
                      </span>
                    )}
                    <h3 className="font-semibold text-gray-800 group-hover:text-[#c4367b] transition-colors line-clamp-2">
                      {blog.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {blog.excerpt || 'Read more...'}
                    </p>
                    <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      {blog.publishedAt 
                        ? new Date(blog.publishedAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                        : 'Draft'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section 
        className="py-16"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${buttonHoverColor} 100%)`,
        }}
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Glow?
          </h2>
          <p className="text-white/80 mb-8 max-w-md mx-auto">
            Book your appointment today and experience the best beauty services
          </p>
          <Link
            href="/booking"
            className="inline-block px-10 py-4 rounded-full bg-white text-gray-900 font-semibold text-lg transition-all hover:scale-105 hover:shadow-lg active:scale-95"
          >
            Book Now
          </Link>
        </div>
      </section>
    </div>
  )
}
