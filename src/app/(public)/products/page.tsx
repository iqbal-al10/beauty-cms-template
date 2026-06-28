'use client'

import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

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

// ===== FUNGSI getTagColor =====
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

export default function ProductsPage() {
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
  const [settings, setSettings] = useState<any>(null)

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

  const createUrl = (newParams: Record<string, string>) => {
    const urlParams = new URLSearchParams()
    if (categorySlug && categorySlug !== '') urlParams.set('category', categorySlug)
    if (searchQuery) urlParams.set('search', searchQuery)
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) urlParams.set(key, value)
    })
    const queryString = urlParams.toString()
    return queryString ? `/products?${queryString}` : '/products'
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: primaryColor }} />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Our Products</h1>
        <p className="text-gray-500 mt-1">
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
              } as React.CSSProperties}
            />
            <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
        </form>

        <div className="flex gap-2 flex-wrap justify-center md:justify-end items-center">
          <Link
            href={createUrl({ category: '' })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !categorySlug
                ? 'text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            style={!categorySlug ? { backgroundColor: primaryColor } : {}}
          >
            All
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={createUrl({ category: category.slug })}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                categorySlug === category.slug
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={categorySlug === category.slug ? { backgroundColor: primaryColor } : {}}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Showing {products.length} of {totalProducts} products
      </p>

      {products.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <h3 className="text-lg font-semibold text-gray-600">No products found</h3>
          <p className="text-gray-400 text-sm">Try adjusting your search or filter</p>
          <Link
            href="/products"
            className="inline-block mt-4 px-6 py-2 rounded-lg text-white text-sm font-medium transition-colors hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
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
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1"
                style={{ borderColor: `${primaryColor}20` }}
              >
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
                  
                  {/* TAGS DI KIRI ATAS */}
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
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800 group-hover:text-[#c4367b] transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500">{product.category?.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-lg font-bold" style={{ color: primaryColor }}>
                      Rp {displayPrice.toLocaleString()}
                    </p>
                    {hasComparePrice && (
                      <p className="text-sm text-gray-400 line-through">
                        {/* PERBAIKAN: Cek null sebelum toLocaleString */}
                        Rp {product.compareAtPrice ? product.compareAtPrice.toLocaleString() : ''}
                      </p>
                    )}
                    {hasDiscount && (
                      <p className="text-xs text-pink-400 line-through">
                        Rp {product.originalPrice.toLocaleString()}
                      </p>
                    )}
                  </div>

                  {hasPromo && promo && (
                    <div className="mt-1">
                      <p className="text-xs text-pink-800 font-medium truncate">
                        {promo.title}
                        {promo.discountType === 'PERCENTAGE' 
                          ? ` - ${promo.discountValue}% OFF` 
                          : ` - Rp ${promo.discountValue?.toLocaleString()} OFF`}
                      </p>
                    </div>
                  )}

                  <button
                    className="mt-3 w-full py-2 rounded-full text-white text-sm font-medium transition-all hover:opacity-90 active:scale-95"
                    style={{ backgroundColor: primaryColor }}
                  >
                    View Details
                  </button>
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
                href={createUrl({ page: String(pageNum) })}
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
