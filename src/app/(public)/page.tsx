'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice: number | null
  status: string
  isFeatured: boolean
  imageUrl: string | null
  stock: number
  category: { name: string } | null
  tags: Array<{ id: string; name: string; color: string | null }>
}

interface Service {
  id: string
  name: string
  slug: string
  description: string | null
  duration: number
  price: number
  imageUrl: string | null
  isFeatured: boolean
  isActive: boolean
  category: { name: string } | null
  tags: Array<{ id: string; name: string; color: string | null }>
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
  customerPhotoUrl: string | null
  rating: number
  reviewText: string
  isPublished: boolean
  beforeAfter?: {
    id: string
    title: string
    category: string
    beforeImageUrl: string
    afterImageUrl: string
  }
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

interface Settings {
  siteName: string
  colorPrimary: string
  colorSecondary: string
  colorButton: string
  heroBannerUrl: string | null
  enableCart: boolean
  headingFontSize: string
  bodyFontSize: string
  smallFontSize: string
  fontFamily: string
  // Hero Content
  heroBadge: string
  heroSubtitle: string
  heroShopButtonText: string
  heroShopButtonLink: string
  heroBookButtonText: string
  heroBookButtonLink: string
  // Hero Slide 1
  heroSlide1Icon: string
  heroSlide1Label: string
  heroSlide1Title: string
  heroSlide1Desc: string
  heroSlide1Button: string
  heroSlide1Link: string
  heroSlide1BgStart: string
  heroSlide1BgEnd: string
  // Hero Slide 2
  heroSlide2Icon: string
  heroSlide2Label: string
  heroSlide2Title: string
  heroSlide2Desc: string
  heroSlide2Button: string
  heroSlide2Link: string
  heroSlide2BgStart: string
  heroSlide2BgEnd: string
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

const DEFAULT_SETTINGS: Settings = {
  siteName: 'Beauty Studio',
  colorPrimary: '#c4367b',
  colorSecondary: '#f5dbe8',
  colorButton: '#aa1d68',
  heroBannerUrl: null,
  enableCart: true,
  headingFontSize: '32px',
  bodyFontSize: '16px',
  smallFontSize: '14px',
  fontFamily: 'Inter',
  heroBadge: '⭐ Premium Beauty Services',
  heroSubtitle: 'Discover premium beauty services and products for your perfect look',
  heroShopButtonText: 'Shop Now',
  heroShopButtonLink: '/products',
  heroBookButtonText: 'Book Now',
  heroBookButtonLink: '/booking',
  heroSlide1Icon: '🔥',
  heroSlide1Label: 'Limited Time Offer',
  heroSlide1Title: 'FLASH SALE 50% OFF',
  heroSlide1Desc: 'Grab your favorite products at unbeatable prices',
  heroSlide1Button: 'Grab Now',
  heroSlide1Link: '/products',
  heroSlide1BgStart: '#f97316',
  heroSlide1BgEnd: '#db2777',
  heroSlide2Icon: '📅',
  heroSlide2Label: 'Book Now & Get Special Offer',
  heroSlide2Title: 'FREE Consultation',
  heroSlide2Desc: 'Book your appointment today and get free consultation',
  heroSlide2Button: 'Book Now',
  heroSlide2Link: '/booking',
  heroSlide2BgStart: '#8b5cf6',
  heroSlide2BgEnd: '#ec4899',
}

export default function HomePage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [featuredServices, setFeaturedServices] = useState<Service[]>([])
  const [activePromos, setActivePromos] = useState<Promo[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [latestBlogs, setLatestBlogs] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)

  const primaryColor = settings?.colorPrimary || '#c4367b'
  const secondaryColor = settings?.colorSecondary || '#f5dbe8'
  const buttonColor = settings?.colorButton || '#c4367b'

  // Build slides from settings
  const slides = [
    {
      id: 'slide1',
      icon: settings.heroSlide1Icon || '🔥',
      label: settings.heroSlide1Label || 'Limited Time Offer',
      title: settings.heroSlide1Title || 'FLASH SALE 50% OFF',
      description: settings.heroSlide1Desc || 'Grab your favorite products at unbeatable prices',
      buttonText: settings.heroSlide1Button || 'Grab Now',
      buttonLink: settings.heroSlide1Link || '/products',
      bgStart: settings.heroSlide1BgStart || '#f97316',
      bgEnd: settings.heroSlide1BgEnd || '#db2777',
    },
    {
      id: 'slide2',
      icon: settings.heroSlide2Icon || '📅',
      label: settings.heroSlide2Label || 'Book Now & Get Special Offer',
      title: settings.heroSlide2Title || 'FREE Consultation',
      description: settings.heroSlide2Desc || 'Book your appointment today and get free consultation',
      buttonText: settings.heroSlide2Button || 'Book Now',
      buttonLink: settings.heroSlide2Link || '/booking',
      bgStart: settings.heroSlide2BgStart || '#8b5cf6',
      bgEnd: settings.heroSlide2BgEnd || '#ec4899',
    },
  ]

  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [slides.length])

  useEffect(() => {
    async function fetchData() {
      try {
        const fetchWithTimeout = (url: string, timeout = 5000) => {
          return Promise.race([
            fetch(url),
            new Promise<Response>((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), timeout)
            )
          ])
        }

        const [
          settingsRes,
          productsRes,
          servicesRes,
          promosRes,
          testimonialsRes,
          blogsRes
        ] = await Promise.all([
          fetchWithTimeout('/api/public/settings', 3000).catch(() => null),
          fetchWithTimeout('/api/public/products?featured=true&limit=4', 5000).catch(() => null),
          fetchWithTimeout('/api/public/services?featured=true&limit=4', 5000).catch(() => null),
          fetchWithTimeout('/api/public/promos?active=true&limit=1', 5000).catch(() => null),
          fetchWithTimeout('/api/public/testimonials?limit=3', 5000).catch(() => null),
          fetchWithTimeout('/api/public/blogs?limit=3', 5000).catch(() => null),
        ])

        // 🔥 PERBAIKAN: Settings - merge data dari API ke state
        if (settingsRes && (settingsRes as Response).ok) {
          const data = await (settingsRes as Response).json()
          console.log('🔍 PUBLIC - Settings from API:', data)
          // Merge data dari API ke state, jangan timpa dengan DEFAULT_SETTINGS
          setSettings(prev => ({ ...prev, ...data }))
        } else {
          // Jika gagal, gunakan DEFAULT_SETTINGS
          setSettings(DEFAULT_SETTINGS)
        }

        if (productsRes && (productsRes as Response).ok) {
          const data = await (productsRes as Response).json()
          setFeaturedProducts(data.data || [])
        }

        if (servicesRes && (servicesRes as Response).ok) {
          const data = await (servicesRes as Response).json()
          setFeaturedServices(data || [])
        }

        if (promosRes && (promosRes as Response).ok) {
          const data = await (promosRes as Response).json()
          setActivePromos(data || [])
        }

        if (testimonialsRes && (testimonialsRes as Response).ok) {
          const data = await (testimonialsRes as Response).json()
          setTestimonials(data || [])
        }

        if (blogsRes && (blogsRes as Response).ok) {
          const data = await (blogsRes as Response).json()
          setLatestBlogs(data || [])
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
  const enableCart = settings?.enableCart !== undefined ? settings.enableCart : true
  const headingFontSize = settings?.headingFontSize || '32px'
  const bodyFontSize = settings?.bodyFontSize || '16px'
  const smallFontSize = settings?.smallFontSize || '14px'
  const fontFamily = settings?.fontFamily || 'Inter'

  const addToCart = (product: Product) => {
    try {
      const saved = localStorage.getItem('beauty_cart')
      const items = saved ? JSON.parse(saved) : []
      
      const existing = items.find((item: any) => item.id === product.id)
      if (existing) {
        if (existing.quantity + 1 > product.stock) {
          toast.error(`Stok tidak mencukupi (tersisa ${product.stock} unit)`)
          return
        }
        existing.quantity += 1
      } else {
        items.push({
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          finalPrice: product.price,
          quantity: 1,
          imageUrl: product.imageUrl,
          stock: product.stock,
        })
      }
      
      localStorage.setItem('beauty_cart', JSON.stringify(items))
      toast.success(`${product.name} ditambahkan ke keranjang!`)
      
      window.dispatchEvent(new Event('cartUpdate'))
    } catch (e) {
      console.error('Error adding to cart:', e)
      toast.error('Gagal menambahkan ke keranjang')
    }
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: primaryColor }} />
      </div>
    )
  }

  return (
    <div style={{ fontFamily: fontFamily }}>
      {/* ===== HERO SECTION - 2 KOLOM ===== */}
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* ===== KIRI: TEKS ===== */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4 border border-white/20">
                <svg className="w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span className="text-white text-sm font-medium" style={{ fontSize: smallFontSize }}>
                  {settings.heroBadge || '⭐ Premium Beauty Services'}
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg" style={{ fontSize: headingFontSize }}>
                {siteName}
              </h1>
              <p className="text-xl text-white/90 mb-8 drop-shadow-md max-w-lg mx-auto lg:mx-0" style={{ fontSize: bodyFontSize }}>
                {settings.heroSubtitle || 'Discover premium beauty services and products for your perfect look'}
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Link
                  href={settings.heroShopButtonLink || '/products'}
                  className="px-8 py-3 rounded-full text-white font-semibold text-lg transition-all hover:opacity-90 hover:-translate-y-0.5 shadow-lg active:scale-95"
                  style={{ backgroundColor: buttonColor, fontSize: bodyFontSize }}
                >
                  {settings.heroShopButtonText || 'Shop Now'}
                </Link>
                <Link
                  href={settings.heroBookButtonLink || '/booking'}
                  className="px-8 py-3 rounded-full bg-white/20 backdrop-blur-sm text-white font-semibold text-lg border border-white/30 hover:bg-white/30 transition-all"
                  style={{ fontSize: bodyFontSize }}
                >
                  {settings.heroBookButtonText || 'Book Now'}
                </Link>
              </div>
            </div>

            {/* ===== KANAN: CAROUSEL PROMO ===== */}
            <div className="relative w-full max-w-xl mx-auto lg:mx-0 lg:ml-auto">
              <div className="relative overflow-hidden rounded-2xl">
                {/* Slide Container */}
                <div 
                  className="transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  <div className="flex">
                    {slides.map((slide) => (
                      <div
                        key={slide.id}
                        className="w-full flex-shrink-0 p-10 min-h-[380px] flex flex-col justify-center items-center text-center text-white"
                        style={{
                          background: `linear-gradient(135deg, ${slide.bgStart} 0%, ${slide.bgEnd} 100%)`,
                        }}
                      >
                        <span className="text-7xl mb-4">{slide.icon}</span>
                        <span className="inline-block px-4 py-1 text-sm font-semibold bg-white/20 backdrop-blur-sm rounded-full mb-3">
                          {slide.label}
                        </span>
                        <h3 className="text-4xl md:text-5xl font-bold mb-2" style={{ fontSize: headingFontSize }}>
                          {slide.title}
                        </h3>
                        <p className="text-white/80 text-lg mb-6" style={{ fontSize: bodyFontSize }}>
                          {slide.description}
                        </p>
                        <Link
                          href={slide.buttonLink}
                          className="inline-block px-10 py-3.5 rounded-full bg-white text-gray-900 font-semibold text-lg transition-all hover:scale-105 hover:shadow-lg active:scale-95"
                          style={{ fontSize: bodyFontSize }}
                        >
                          {slide.buttonText} →
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dots Indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentSlide
                          ? 'bg-white w-10'
                          : 'bg-white/50 hover:bg-white/70'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-800" style={{ fontSize: headingFontSize }}>
                Featured Products
              </h2>
              <p className="text-gray-500 mt-1" style={{ fontSize: bodyFontSize }}>Our best picks just for you</p>
            </div>
            <Link
              href="/products"
              className="flex items-center gap-1 font-medium transition-colors"
              style={{ color: primaryColor, fontSize: bodyFontSize }}
            >
              View All 
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product) => {
                const productTags = product.tags || []
                const hasComparePrice = product.compareAtPrice && product.compareAtPrice > product.price

                return (
                  <div
                    key={product.id}
                    className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1"
                    style={{ borderColor: `${primaryColor}20` }}
                  >
                    <Link href={`/products/${product.slug}`}>
                      <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
                        {product.imageUrl ? (
                          <img 
                            src={product.imageUrl} 
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                            <span className="text-6xl">🧴</span>
                          </div>
                        )}
                        
                        {productTags.length > 0 && (
                          <div className="absolute top-3 left-3 flex flex-col gap-1">
                            {productTags.slice(0, 2).map((tag) => (
                              <span
                                key={tag.id}
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white truncate max-w-[80px] shadow-sm"
                                style={{ backgroundColor: getTagColor(tag.color) }}
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        )}

                        {hasComparePrice && (
                          <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                            SALE
                          </span>
                        )}
                      </div>
                    </Link>

                    <div className="p-4">
                      <Link href={`/products/${product.slug}`}>
                        <h3 className="font-semibold text-gray-800 group-hover:text-[#c4367b] transition-colors line-clamp-1" style={{ fontSize: bodyFontSize }}>
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-500" style={{ fontSize: smallFontSize }}>{product.category?.name}</p>
                      </Link>

                      <div className="flex items-center justify-between mt-2">
                        <div>
                          <p className="text-lg font-bold" style={{ color: primaryColor, fontSize: bodyFontSize }}>
                            Rp {product.price.toLocaleString()}
                          </p>
                          {hasComparePrice && (
                            <p className="text-sm text-gray-400 line-through" style={{ fontSize: smallFontSize }}>
                              Rp {product.compareAtPrice ? product.compareAtPrice.toLocaleString() : ''}
                            </p>
                          )}
                        </div>
                        
                        {enableCart && (
                          <button
                            onClick={() => addToCart(product)}
                            className="p-2 rounded-full hover:bg-pink-50 transition-colors"
                            style={{ color: primaryColor }}
                            title="Tambah ke keranjang"
                          >
                            <ShoppingCart className="w-5 h-5" />
                          </button>
                        )}
                      </div>

                      <Link
                        href={`/products/${product.slug}`}
                        className="mt-3 w-full py-2 rounded-full text-white text-sm font-medium transition-all hover:opacity-90 active:scale-95 text-center block"
                        style={{ backgroundColor: primaryColor, fontSize: smallFontSize }}
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-gray-500 col-span-full text-center py-8" style={{ fontSize: bodyFontSize }}>
                No featured products available
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ===== FEATURED SERVICES ===== */}
      {featuredServices.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-800" style={{ fontSize: headingFontSize }}>
                  Featured Services
                </h2>
                <p className="text-gray-500 mt-1" style={{ fontSize: bodyFontSize }}>Our premium beauty services</p>
              </div>
              <Link
                href="/booking"
                className="flex items-center gap-1 font-medium transition-colors"
                style={{ color: primaryColor, fontSize: bodyFontSize }}
              >
                View All 
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredServices.map((service) => {
                const serviceTags = service.tags || []
                return (
                  <div
                    key={service.id}
                    className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1"
                    style={{ borderColor: `${primaryColor}20` }}
                  >
                    <Link href={`/booking/${service.slug}`}>
                      <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
                        {service.imageUrl ? (
                          <img 
                            src={service.imageUrl} 
                            alt={service.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                            <span className="text-6xl">🧖</span>
                          </div>
                        )}
                        
                        {serviceTags.length > 0 && (
                          <div className="absolute top-3 left-3 flex flex-col gap-1">
                            {serviceTags.slice(0, 2).map((tag) => (
                              <span
                                key={tag.id}
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white truncate max-w-[80px] shadow-sm"
                                style={{ backgroundColor: getTagColor(tag.color) }}
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>

                    <div className="p-4">
                      <Link href={`/booking/${service.slug}`}>
                        <h3 className="font-semibold text-gray-800 group-hover:text-[#c4367b] transition-colors line-clamp-1" style={{ fontSize: bodyFontSize }}>
                          {service.name}
                        </h3>
                        <p className="text-sm text-gray-500" style={{ fontSize: smallFontSize }}>{service.category?.name}</p>
                      </Link>

                      <div className="flex items-center justify-between mt-2">
                        <div>
                          <p className="text-lg font-bold" style={{ color: primaryColor, fontSize: bodyFontSize }}>
                            Rp {service.price.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500" style={{ fontSize: smallFontSize }}>
                            {service.duration} menit
                          </p>
                        </div>
                      </div>

                      <Link
                        href={`/booking/${service.slug}`}
                        className="mt-3 w-full py-2 rounded-full text-white text-sm font-medium transition-all hover:opacity-90 active:scale-95 text-center block"
                        style={{ backgroundColor: primaryColor, fontSize: smallFontSize }}
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ===== LATEST BLOG ===== */}
      {latestBlogs.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-800" style={{ fontSize: headingFontSize }}>
                  Latest from Blog
                </h2>
                <p className="text-gray-500 mt-1" style={{ fontSize: bodyFontSize }}>Tips and inspiration</p>
              </div>
              <Link
                href="/blog"
                className="flex items-center gap-1 font-medium transition-colors"
                style={{ color: primaryColor, fontSize: bodyFontSize }}
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
                      <img
                        src={blog.coverImageUrl}
                        alt={blog.title}
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
                          fontSize: smallFontSize,
                        }}
                      >
                        {blog.category.name}
                      </span>
                    )}
                    <h3 className="font-semibold text-gray-800 group-hover:text-[#c4367b] transition-colors line-clamp-2" style={{ fontSize: bodyFontSize }}>
                      {blog.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2" style={{ fontSize: smallFontSize }}>
                      {blog.excerpt || 'Read more...'}
                    </p>
                    <div className="flex items-center gap-2 mt-3 text-xs text-gray-400" style={{ fontSize: smallFontSize }}>
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

      {/* ===== TESTIMONIALS & BEFORE/AFTER SECTION ===== */}
      {testimonials.length > 0 && (
        <section className="py-16" style={{ backgroundColor: `${secondaryColor}30` }}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800" style={{ fontSize: headingFontSize }}>
                What Our Customers Say
              </h2>
              <p className="text-gray-500 mt-1" style={{ fontSize: bodyFontSize }}>Real reviews from real people</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.slice(0, 3).map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                  style={{ borderColor: `${primaryColor}20` }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    {testimonial.customerPhotoUrl ? (
                      <img
                        src={testimonial.customerPhotoUrl}
                        alt={testimonial.customerName}
                        className="w-10 h-10 object-cover rounded-full border-2"
                        style={{ borderColor: primaryColor }}
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {testimonial.customerName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-800" style={{ fontSize: bodyFontSize }}>
                        {testimonial.customerName}
                      </p>
                      <div className="flex text-yellow-400">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-3 italic" style={{ fontSize: bodyFontSize }}>
                    "{testimonial.reviewText}"
                  </p>

                  {testimonial.beforeAfter && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex gap-2">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={testimonial.beforeAfter.beforeImageUrl} 
                            alt="Before" 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={testimonial.beforeAfter.afterImageUrl} 
                            alt="After" 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-800 truncate" style={{ fontSize: smallFontSize }}>
                            {testimonial.beforeAfter.title}
                          </p>
                          <p className="text-xs text-gray-500" style={{ fontSize: smallFontSize }}>
                            {testimonial.beforeAfter.category}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <Link
                    href={`/testimonials/${testimonial.customerName.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '')}`}
                    className="inline-block mt-3 text-sm font-medium transition-colors"
                    style={{ color: primaryColor, fontSize: smallFontSize }}
                  >
                    Read More →
                  </Link>
                </div>
              ))}
            </div>

            {testimonials.length > 3 && (
              <div className="text-center mt-8">
                <Link
                  href="/testimonials"
                  className="font-medium transition-colors"
                  style={{ color: primaryColor, fontSize: bodyFontSize }}
                >
                  See All Testimonials →
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ===== CTA SECTION ===== */}
      <section 
        className="py-16"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        }}
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4" style={{ fontSize: headingFontSize }}>
            Ready to Glow?
          </h2>
          <p className="text-white/80 mb-8 max-w-md mx-auto" style={{ fontSize: bodyFontSize }}>
            Book your appointment today and experience the best beauty services
          </p>
          <Link
            href="/booking"
            className="inline-block px-10 py-4 rounded-full bg-white text-gray-900 font-semibold text-lg transition-all hover:scale-105 hover:shadow-lg active:scale-95"
            style={{ fontSize: bodyFontSize }}
          >
            Book Now
          </Link>
        </div>
      </section>
    </div>
  )
}