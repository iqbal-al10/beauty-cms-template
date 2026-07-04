'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Clock, Calendar, ArrowRight, Search } from 'lucide-react'
import toast from 'react-hot-toast'

interface Service {
  id: string
  name: string
  slug: string
  description: string | null
  duration: number
  price: number
  categoryId: string
  category?: { id: string; name: string; icon: string | null } | null
  isActive: boolean
  imageUrl: string | null
  tags: Array<{ id: string; name: string; color: string | null }>
}

interface BookingCategory {
  id: string
  name: string
  slug: string
  icon: string | null
}

interface Settings {
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

export default function BookingPage() {
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<BookingCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')

  const primaryColor = '#c4367b'

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [servicesRes, categoriesRes, settingsRes] = await Promise.all([
        fetch('/api/public/services'),
        fetch('/api/public/booking-categories'),
        fetch('/api/public/settings'),
      ])

      if (servicesRes.ok) {
        const data = await servicesRes.json()
        setServices(data.filter((s: Service) => s.isActive !== false) || [])
      }

      if (categoriesRes.ok) {
        const data = await categoriesRes.json()
        setCategories(data || [])
      }

      if (settingsRes.ok) {
        const data = await settingsRes.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Gagal memuat data layanan')
    } finally {
      setLoading(false)
    }
  }

  const filteredServices = services.filter(service => {
    const matchesCategory = !selectedCategory || service.categoryId === selectedCategory
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          false
    return matchesCategory && matchesSearch
  })

  const headingFontSize = settings?.headingFontSize || '32px'
  const bodyFontSize = settings?.bodyFontSize || '16px'
  const smallFontSize = settings?.smallFontSize || '14px'
  const fontFamily = settings?.fontFamily || 'Inter'

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: primaryColor }} />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8" style={{ fontFamily: fontFamily }}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800" style={{ fontSize: headingFontSize }}>
          Booking Layanan
        </h1>
        <p className="text-gray-500 mt-1" style={{ fontSize: bodyFontSize }}>
          Pilih layanan yang Anda inginkan dan booking jadwal Anda
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari layanan..."
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
            Semua
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
              {category.icon && <span className="mr-1">{category.icon}</span>}
              {category.name}
            </button>
          ))}
        </div>
      )}

      <p className="text-sm text-gray-500 mb-4" style={{ fontSize: smallFontSize }}>
        Menampilkan {filteredServices.length} layanan
      </p>

      {filteredServices.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
          <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600" style={{ fontSize: bodyFontSize }}>
            Tidak ada layanan yang ditemukan
          </h3>
          <p className="text-gray-400 text-sm" style={{ fontSize: smallFontSize }}>
            Coba ubah kata kunci atau filter kategori
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const serviceTags = service.tags || []
            return (
              <div
                key={service.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1"
                style={{ borderColor: `${primaryColor}20` }}
              >
                {/* Gambar Layanan */}
                <Link href={`/booking/${service.slug}`}>
                  <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
                    {service.imageUrl ? (
                      <img 
                        src={service.imageUrl} 
                        alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl">🧖</span>
                      </div>
                    )}
                    
                    {/* Tags di card - SAMA SEPERTI PRODUCT */}
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

                <div className="p-5">
                  <Link href={`/booking/${service.slug}`}>
                    <h3 className="font-semibold text-gray-800 group-hover:text-[#c4367b] transition-colors" style={{ fontSize: bodyFontSize }}>
                      {service.name}
                    </h3>
                    {/* KATEGORI - SEKARANG MUNCUL */}
                    <p className="text-sm text-gray-500" style={{ fontSize: smallFontSize }}>
                      {service.category?.name || 'Tanpa Kategori'}
                    </p>
                  </Link>

                  {/* Description */}
                  {service.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2" style={{ fontSize: smallFontSize }}>
                      {service.description}
                    </p>
                  )}

                  {/* Details */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-3" style={{ fontSize: smallFontSize }}>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {service.duration} menit
                    </span>
                    <span className="flex items-center gap-1 font-bold" style={{ color: primaryColor }}>
                      {formatCurrency(service.price)}
                    </span>
                  </div>

                  {/* Button */}
                  <Link
                    href={`/booking/${service.slug}`}
                    className="mt-4 w-full py-2.5 rounded-full text-white text-sm font-medium transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-2"
                    style={{ backgroundColor: primaryColor, fontSize: smallFontSize }}
                  >
                    Views Details <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}