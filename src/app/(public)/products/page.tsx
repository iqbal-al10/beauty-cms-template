'use client'

import { Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ShoppingCart, Search } from 'lucide-react'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice: number | null
  finalPrice: number
  discountAmount: number
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
  const [products, setProducts] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [navigatingId, setNavigatingId] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')

  const primaryColor = '#c4367b'

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
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/api/public/products?limit=100'),
          fetch('/api/public/categories?limit=20'),
        ])

        if (productsRes.ok) {
          const data = await productsRes.json()
          const all = data.data || []
          setAllProducts(all)
          setProducts(all)
        }

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

  const handleViewDetails = (slug: string, id: string) => {
    setNavigatingId(id)
    router.push(`/products/${slug}`)
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
          price: product.price,
          compareAtPrice: product.compareAtPrice,
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

  const filteredProducts = allProducts.filter(product => {
    const matchesCategory = !selectedCategory || categories.find(c => c.id === selectedCategory)?.name === product.category?.name
    const matchesSearch = !searchTerm || product.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const enableCart = settings?.enableCart !== undefined ? settings.enableCart : true
  const headingFontSize = settings?.headingFontSize || '32px'
  const bodyFontSize = settings?.bodyFontSize || '16px'
  const smallFontSize = settings?.smallFontSize || '14px'
  const fontFamily = settings?.fontFamily || 'Inter'

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 animate-pulse" style={{ fontFamily }}>
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-5 bg-gray-200 rounded w-64 mt-2" />
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-9 bg-gray-200 rounded-full w-20" />
          ))}
        </div>
        <div className="h-4 bg-gray-200 rounded w-48 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="aspect-square bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-5 bg-gray-200 rounded w-1/3" />
                <div className="h-9 bg-gray-200 rounded-full w-full mt-3" />
              </div>
            </div>
          ))}
        </div>
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

      {/* Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
            style={{ fontSize: bodyFontSize }}
          />
        </div>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !selectedCategory
                ? 'text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            style={!selectedCategory ? { backgroundColor: primaryColor, fontSize: smallFontSize } : { fontSize: smallFontSize }}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={selectedCategory === category.id ? { backgroundColor: primaryColor, fontSize: smallFontSize } : { fontSize: smallFontSize }}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}

      <p className="text-sm text-gray-500 mb-4" style={{ fontSize: smallFontSize }}>
        Menampilkan {filteredProducts.length} produk
      </p>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <h3 className="text-lg font-semibold text-gray-600" style={{ fontSize: headingFontSize }}>No products found</h3>
          <p className="text-gray-400 text-sm" style={{ fontSize: bodyFontSize }}>Try adjusting your search or filter</p>
          <button
            onClick={() => { setSelectedCategory(''); setSearchTerm('') }}
            className="inline-block mt-4 px-6 py-2 rounded-lg text-white text-sm font-medium transition-colors hover:opacity-90"
            style={{ backgroundColor: primaryColor, fontSize: smallFontSize }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const displayPrice = product.finalPrice || product.price
            const hasCompare = product.compareAtPrice && product.compareAtPrice > displayPrice
            const discountAmount = hasCompare ? (product.compareAtPrice || 0) - displayPrice : 0
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

                    {hasCompare && (
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

                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <p className="text-lg font-bold" style={{ color: primaryColor, fontSize: bodyFontSize }}>
                      Rp {displayPrice.toLocaleString()}
                    </p>
                    {hasCompare && (
                      <p className="text-sm text-gray-400 line-through" style={{ fontSize: smallFontSize }}>
                        Rp {product.compareAtPrice ? product.compareAtPrice.toLocaleString() : ''}
                      </p>
                    )}
                  </div>
                  
                  {hasCompare && discountAmount > 0 && (
                    <div className="mt-1">
                      <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                        Hemat Rp {discountAmount.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3 gap-2">
                    <button
                      onClick={() => handleViewDetails(product.slug, product.id)}
                      disabled={navigatingId === product.id}
                      className="flex-1 py-2 rounded-full text-white text-sm font-medium transition-all hover:opacity-90 active:scale-95 text-center flex items-center justify-center gap-2"
                      style={{ backgroundColor: primaryColor, fontSize: smallFontSize }}
                    >
                      {navigatingId === product.id ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Loading...
                        </>
                      ) : (
                        'View Details'
                      )}
                    </button>
                    
                    {enableCart && product.stock > 0 && (
                      <button
                        onClick={() => addToCart(product)}
                        className="p-2 rounded-full hover:bg-pink-50 transition-colors border border-gray-200 hover:border-pink-300 flex-shrink-0"
                        style={{ color: primaryColor }}
                        title="Tambah ke keranjang"
                      >
                        <ShoppingCart className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
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
      <div className="container mx-auto px-4 py-8 animate-pulse">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-5 bg-gray-200 rounded w-64 mt-2" />
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-9 bg-gray-200 rounded-full w-20" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="aspect-square bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-5 bg-gray-200 rounded w-1/3" />
                <div className="h-9 bg-gray-200 rounded-full w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  )
}