'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  originalPrice: number
  finalPrice: number
  discountAmount: number
  compareAtPrice: number | null
  status: string
  stock: number
  imageUrl: string | null
  category: { name: string } | null
  tags: Array<{ id: string; name: string; color: string | null }>
  appliedPromo: {
    id: string
    title: string
    type: string
    discountValue: number
    discountType: string
  } | null
}

interface Category {
  id: string
  name: string
  slug: string
}

interface Settings {
  enableCart: boolean
  colorPrimary: string
  headingFontSize: string
  bodyFontSize: string
  smallFontSize: string
  fontFamily: string
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

function ProductsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const categorySlug = searchParams.get('category') || ''
  const searchQuery = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1', 10)

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<Settings | null>(null)

  const primaryColor = '#c4367b'
  const limit = 9

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/public/settings')
        if (res.ok) {
          const data = await res.json()
          setSettings(data)
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      }
    }
    fetchSettings()
  }, [])

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (categorySlug) params.set('category', categorySlug)
        if (searchQuery) params.set('search', searchQuery)
        params.set('page', String(page))
        params.set('limit', String(limit))

        const productsRes = await fetch(`/api/public/products?${params}`)
        if (productsRes.ok) {
          const data = await productsRes.json()
          setProducts(data.data || [])
          setTotalProducts(data.total || 0)
          setTotalPages(data.totalPages || 1)
        }

        const categoriesRes = await fetch('/api/public/categories?limit=20')
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
  }, [categorySlug, searchQuery, page])

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const search = formData.get('search') as string
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (categorySlug) params.set('category', categorySlug)
    router.push(`/products?${params.toString()}`)
  }

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
          price: product.finalPrice || product.price,
          finalPrice: product.finalPrice || product.price,
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

  const enableCart = settings?.enableCart !== undefined ? settings.enableCart : true
  const headingFontSize = settings?.headingFontSize || '32px'
  const bodyFontSize = settings?.bodyFontSize || '16px'
  const smallFontSize = settings?.smallFontSize || '14px'
  const fontFamily = settings?.fontFamily || 'Inter'

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: primaryColor }} />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8" style={{ fontFamily: fontFamily }}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800" style={{ fontSize: headingFontSize }}>Our Products</h1>
        <p className="text-gray-500 mt-1" style={{ fontSize: bodyFontSize }}>
          Discover our premium beauty products
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <form onSubmit={handleSearch} className="flex-1">
          {categorySlug && (
            <input type="hidden" name="category" value={categorySlug} />
          )}
          <div className="relative">
            <input
              type="text"
              name="search"
              placeholder="Search products..."
              defaultValue={searchQuery}
              className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-colors"
              style={{ 
                '--tw-ring-color': primaryColor,
                fontSize: bodyFontSize,
              } as React.CSSProperties}
            />
            <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
        </form>

        <div className="flex flex-wrap gap-2 items-center justify-center md:justify-end">
          <a
            href="/products"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !categorySlug
                ? 'text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            style={!categorySlug ? { backgroundColor: primaryColor, fontSize: smallFontSize } : { fontSize: smallFontSize }}
          >
            All
          </a>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                categorySlug === category.slug
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={categorySlug === category.slug ? { backgroundColor: primaryColor, fontSize: smallFontSize } : { fontSize: smallFontSize }}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-4" style={{ fontSize: smallFontSize }}>
        Showing {products.length} of {totalProducts} products
      </p>

      {products.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <h3 className="text-lg font-semibold text-gray-600" style={{ fontSize: headingFontSize }}>No products found</h3>
          <p className="text-gray-400 text-sm" style={{ fontSize: bodyFontSize }}>Try adjusting your search or filter</p>
          <Link
            href="/products"
            className="inline-block mt-4 px-6 py-2 rounded-lg text-white text-sm font-medium transition-colors hover:opacity-90"
            style={{ backgroundColor: primaryColor, fontSize: smallFontSize }}
          >
            Clear filters
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const hasComparePrice = product.compareAtPrice && product.compareAtPrice > product.price
            const hasPromo = product.appliedPromo !== null
            const promo = product.appliedPromo
            const displayPrice = product.finalPrice || product.price
            const hasDiscount = product.discountAmount > 0
            const productTags = product.tags || []
            
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

                    {hasPromo && promo && (
                      <span className="absolute top-3 right-3 bg-pink-800 text-white text-xs font-bold px-2.5 py-1 rounded-full max-w-[120px] truncate">
                        🔥 {promo.title}
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
                        Rp {displayPrice.toLocaleString()}
                      </p>
                      {hasComparePrice && (
                        <p className="text-sm text-gray-400 line-through" style={{ fontSize: smallFontSize }}>
                          Rp {product.compareAtPrice ? product.compareAtPrice.toLocaleString() : ''}
                        </p>
                      )}
                    </div>
                    
                    {/* ICON KERANJANG - HANYA JIKA enableCart ON */}
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

                  {hasPromo && promo && (
                    <div className="mt-1">
                      <p className="text-xs text-pink-800 font-medium truncate" style={{ fontSize: smallFontSize }}>
                        {promo.title}
                        {promo.discountType === 'PERCENTAGE' 
                          ? ` - ${promo.discountValue}% OFF` 
                          : ` - Rp ${promo.discountValue?.toLocaleString()} OFF`}
                      </p>
                    </div>
                  )}

                  {/* TOMBOL TETAP VIEW DETAILS */}
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
                href={`/products?page=${pageNum}`}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={isActive ? { backgroundColor: primaryColor, fontSize: smallFontSize } : { fontSize: smallFontSize }}
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

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#c4367b' }} />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  )
}