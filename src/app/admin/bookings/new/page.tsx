'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Eye, Image as ImageIcon, X, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'
import Select from 'react-select'
import { generateSlug, generateCanonicalUrl } from '@/lib/slug'

interface Category {
  id: string
  name: string
}

interface Tag {
  id: string
  name: string
  color: string | null
}

interface Promo {
  id: string
  code: string
  discount: number
  startDate: string
  endDate: string
  isActive: boolean
}

interface MediaFile {
  id: string
  url: string
  fileName: string
  folder: string | null
}

interface Settings {
  siteName: string
  colorPrimary: string
  colorSecondary: string
  defaultOgImage: string | null
  logoUrl: string | null
}

interface TagOption {
  value: string
  label: string
  color: string
}

interface CategoryOption {
  value: string
  label: string
}

interface PromoOption {
  value: string
  label: string
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

export default function NewServicePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [promos, setPromos] = useState<Promo[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [showMediaPicker, setShowMediaPicker] = useState(false)
  const [isAutoGenerating, setIsAutoGenerating] = useState(false)
  const [isSeoOpen, setIsSeoOpen] = useState(false)
  
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    duration: '',
    price: '',
    compareAtPrice: '',
    categoryId: '',
    imageUrl: '',
    isFeatured: false,
    isActive: true,
    metaTitle: '',
    metaDescription: '',
    canonicalUrl: '',
    ogImageUrl: '',
    tagIds: [] as string[],
    promoIds: [] as string[],
  })

  useEffect(() => {
    fetchCategories()
    fetchTags()
    fetchPromos()
    fetchSettings()
    fetchMediaFiles()
  }, [])

  // AUTO-GENERATE SEO FIELDS
  useEffect(() => {
    if (!settings?.siteName) return
    
    if (form.name && !isAutoGenerating) {
      const generatedTitle = generateMetaTitle(form.name, settings.siteName)
      if (!form.metaTitle || form.metaTitle === '' || form.metaTitle === generateMetaTitle(form.name, settings.siteName)) {
        setForm(prev => ({ ...prev, metaTitle: generatedTitle }))
      }
    }

    if (form.description && !isAutoGenerating) {
      const generatedDesc = generateMetaDescription(form.description, form.name, settings.siteName)
      if (!form.metaDescription || form.metaDescription === '' || form.metaDescription === generateMetaDescription(form.description, form.name, settings.siteName)) {
        setForm(prev => ({ ...prev, metaDescription: generatedDesc }))
      }
    }

    if (form.slug && !isAutoGenerating) {
      const generatedUrl = generateCanonicalUrl(form.slug, 'booking')
      if (!form.canonicalUrl || form.canonicalUrl === '' || form.canonicalUrl === generateCanonicalUrl(form.slug, 'booking')) {
        setForm(prev => ({ ...prev, canonicalUrl: generatedUrl }))
      }
    }

    if (form.imageUrl && !isAutoGenerating) {
      const generatedOgImage = generateOgImage(form.imageUrl, settings.defaultOgImage, settings.logoUrl)
      if (!form.ogImageUrl || form.ogImageUrl === '' || form.ogImageUrl === generateOgImage(form.imageUrl, settings.defaultOgImage, settings.logoUrl)) {
        setForm(prev => ({ ...prev, ogImageUrl: generatedOgImage || '' }))
      }
    }
  }, [form.name, form.description, form.slug, form.imageUrl, settings])

  const generateMetaTitle = (serviceName: string, siteName: string) => {
    if (!serviceName) return ''
    return `Jual ${serviceName} - ${siteName}`
  }

  const generateMetaDescription = (description: string, serviceName: string, siteName: string) => {
    if (description && description.length > 10) {
      const clean = description.replace(/\s+/g, ' ').trim()
      return clean.length > 150 ? clean.slice(0, 150) + '...' : clean
    }
    return `Temukan ${serviceName || 'layanan'} berkualitas di ${siteName}.`
  }

  const generateOgImage = (imageUrl: string | null, defaultOgImage: string | null, logoUrl: string | null) => {
    return imageUrl || defaultOgImage || logoUrl || null
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/booking-categories')
      if (!res.ok) {
        console.error('Failed to fetch categories:', res.status)
        setCategories([])
        return
      }
      const data = await res.json()
      setCategories(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories([])
    }
  }

  const fetchTags = async () => {
    try {
      const res = await fetch('/api/admin/booking-tags')
      if (!res.ok) {
        console.error('Failed to fetch tags:', res.status)
        setTags([])
        return
      }
      const data = await res.json()
      setTags(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching tags:', error)
      setTags([])
    }
  }

  const fetchPromos = async () => {
    try {
      const res = await fetch('/api/admin/booking-promos')
      if (!res.ok) {
        console.error('Failed to fetch promos:', res.status)
        setPromos([])
        return
      }
      const data = await res.json()
      setPromos(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching promos:', error)
      setPromos([])
    }
  }

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings')
      if (res.ok) {
        const data = await res.json()
        setSettings({
          siteName: data.siteName || 'Beauty Studio',
          colorPrimary: data.colorPrimary || '#c4367b',
          colorSecondary: data.colorSecondary || '#f5dbe8',
          defaultOgImage: data.defaultOgImage || null,
          logoUrl: data.logoUrl || null,
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  const fetchMediaFiles = async () => {
    try {
      const res = await fetch('/api/admin/media?limit=20')
      if (res.ok) {
        const data = await res.json()
        setMediaFiles(data || [])
      }
    } catch (error) {
      console.error('Error fetching media files:', error)
    }
  }

  const getTagColor = (color: string | null): string => {
    if (!color) return '#6B7280'
    if (color.startsWith('#')) return color
    const preset = PRESET_COLORS.find(p => p.value === color)
    if (preset) return preset.hex
    return '#6B7280'
  }

  const getTagOptions = (): TagOption[] => {
    return tags.map(tag => ({
      value: tag.id,
      label: tag.name,
      color: getTagColor(tag.color),
    }))
  }

  const getSelectedTagOptions = (): TagOption[] => {
    return form.tagIds.map(id => {
      const tag = tags.find(t => t.id === id)
      return {
        value: id,
        label: tag?.name || '',
        color: getTagColor(tag?.color || null),
      }
    }).filter(opt => opt.label !== '')
  }

  const getCategoryOptions = (): CategoryOption[] => {
    return categories.map(cat => ({
      value: cat.id,
      label: cat.name,
    }))
  }

  const getSelectedCategoryOption = (): CategoryOption | null => {
    if (!form.categoryId) return null
    const category = categories.find(c => c.id === form.categoryId)
    if (!category) return null
    return {
      value: category.id,
      label: category.name,
    }
  }

  const getPromoOptions = (): PromoOption[] => {
    return promos.filter(p => p.isActive).map(promo => ({
      value: promo.id,
      label: `${promo.code} (Rp ${promo.discount.toLocaleString()})`,
    }))
  }

  const getSelectedPromoOptions = (): PromoOption[] => {
    return form.promoIds.map(id => {
      const promo = promos.find(p => p.id === id)
      return {
        value: id,
        label: promo ? `${promo.code} (Rp ${promo.discount.toLocaleString()})` : '',
      }
    }).filter(opt => opt.label !== '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // ===== VALIDASI FRONTEND =====
    if (!form.name.trim()) {
      toast.error('Nama layanan wajib diisi')
      return
    }
    if (!form.slug.trim()) {
      toast.error('Slug wajib diisi')
      return
    }
    if (!form.price || parseFloat(form.price) <= 0) {
      toast.error('Harga wajib diisi dan harus lebih dari 0')
      return
    }
    if (!form.duration || parseInt(form.duration) <= 0) {
      toast.error('Durasi wajib diisi dan harus lebih dari 0')
      return
    }
    if (!form.categoryId) {
      toast.error('Silakan pilih kategori terlebih dahulu')
      return
    }
    
    setLoading(true)

    try {
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : null,
          duration: form.duration ? parseInt(form.duration) : null,
          imageUrl: form.imageUrl || null,
          isFeatured: form.isFeatured,
          tagIds: form.tagIds,
          promoIds: form.promoIds,
          metaTitle: form.metaTitle || generateMetaTitle(form.name, settings?.siteName || 'Beauty Studio'),
          metaDescription: form.metaDescription || generateMetaDescription(form.description, form.name, settings?.siteName || 'Beauty Studio'),
          canonicalUrl: form.canonicalUrl || generateCanonicalUrl(form.slug, 'booking'),
          ogImageUrl: form.ogImageUrl || generateOgImage(form.imageUrl, settings?.defaultOgImage || null, settings?.logoUrl || null),
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create service')
      }

      toast.success('Layanan berhasil ditambahkan!')
      router.push('/admin/bookings')
      router.refresh()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Error saat menambahkan layanan')
    } finally {
      setLoading(false)
    }
  }

  const getPreviewData = () => {
    const selectedCategory = categories.find(c => c.id === form.categoryId)
    const selectedTags = tags.filter(t => form.tagIds.includes(t.id))
    const primaryColor = settings?.colorPrimary || '#c4367b'
    const price = parseFloat(form.price) || 0
    const compareAtPrice = form.compareAtPrice ? parseFloat(form.compareAtPrice) : null

    return {
      name: form.name || 'Service Name',
      price: price,
      compareAtPrice: compareAtPrice,
      category: selectedCategory?.name || 'Category',
      isActive: form.isActive,
      tags: selectedTags,
      primaryColor,
      slug: form.slug || 'service-slug',
      imageUrl: form.imageUrl || null,
      duration: form.duration,
      isFeatured: form.isFeatured,
    }
  }

  const ServicePreview = () => {
    const preview = getPreviewData()
    const hasTags = preview.tags && preview.tags.length > 0

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Live Preview
          </h3>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            preview.isActive 
              ? 'bg-green-100 text-green-700' 
              : 'bg-yellow-100 text-yellow-700'
          }`}>
            {preview.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="border rounded-xl overflow-hidden border-gray-100">
          <div className="bg-white p-3">
            <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg mb-2 flex items-center justify-center relative">
              {preview.imageUrl ? (
                <img 
                  src={preview.imageUrl} 
                  alt={preview.name}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    const parent = e.currentTarget.parentElement
                    if (parent) {
                      const fallback = document.createElement('div')
                      fallback.className = 'w-full h-full flex items-center justify-center'
                      fallback.innerHTML = '<span class="text-4xl">🧖</span>'
                      parent.appendChild(fallback)
                    }
                  }}
                />
              ) : (
                <span className="text-4xl">🧖</span>
              )}
              {preview.compareAtPrice && preview.compareAtPrice > preview.price && (
                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  SALE
                </span>
              )}
              {hasTags && (
                <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                  {preview.tags.slice(0, 2).map((tag: Tag) => (
                    <span
                      key={tag.id}
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white truncate max-w-[80px] shadow-sm"
                      style={{ backgroundColor: getTagColor(tag.color) }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
              {preview.isFeatured && (
                <div className="absolute bottom-2 left-2">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-yellow-400 text-yellow-900">
                    ⭐ Featured
                  </span>
                </div>
              )}
            </div>

            <h3 className="font-semibold text-gray-800 text-sm line-clamp-1">
              {preview.name}
            </h3>
            <p className="text-xs text-gray-500">{preview.category}</p>
            {preview.duration && (
              <p className="text-xs text-gray-400 mt-0.5">⏱ {preview.duration} menit</p>
            )}

            <div className="flex items-center gap-2 mt-1">
              <p className="text-base font-bold" style={{ color: preview.primaryColor }}>
                Rp {preview.price.toLocaleString()}
              </p>
              {preview.compareAtPrice && preview.compareAtPrice > preview.price && (
                <p className="text-xs text-gray-400 line-through">
                  Rp {preview.compareAtPrice.toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between text-[10px] text-gray-400">
          <span>🔄 Update real-time</span>
          <span>/booking/{preview.slug}</span>
        </div>
      </div>
    )
  }

  const MediaPicker = () => {
    const [search, setSearch] = useState('')

    const filteredMedia = mediaFiles.filter(file => 
      file.fileName.toLowerCase().includes(search.toLowerCase())
    )

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[80vh] flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Pilih Gambar dari Media</h2>
            <button
              onClick={() => setShowMediaPicker(false)}
              className="p-1 rounded-lg hover:bg-gray-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-4">
            <input
              type="text"
              placeholder="Cari gambar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
            />
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
              {filteredMedia.length === 0 ? (
                <p className="text-gray-500 col-span-full text-center py-8">Belum ada gambar di media</p>
              ) : (
                filteredMedia.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => {
                      setForm({ ...form, imageUrl: file.url })
                      setShowMediaPicker(false)
                      toast.success('Gambar berhasil dipilih!')
                    }}
                    className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden hover:ring-2 hover:ring-pink-500 transition-all"
                  >
                    <img 
                      src={file.url} 
                      alt={file.fileName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                      {file.fileName}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="p-4 border-t text-sm text-gray-500">
            Total: {filteredMedia.length} gambar
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/bookings" className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Tambah Layanan</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="lg:w-1/2">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
            {/* NAMA LAYANAN */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Layanan *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value
                  setForm({ 
                    ...form, 
                    name,
                    // SLUG TIDAK AUTO-GENERATE DARI NAMA
                    metaTitle: name ? generateMetaTitle(name, settings?.siteName || 'Beauty Studio') : '',
                  })
                }}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="Facial Treatment"
              />
            </div>

            {/* SLUG */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
              <input
                type="text"
                required
                value={form.slug}
                onChange={(e) => {
                  // Hanya replace spasi dengan -, sisanya manual
                  const slug = e.target.value.replace(/ /g, '-').toLowerCase()
                  setForm({ 
                    ...form, 
                    slug,
                    canonicalUrl: slug ? generateCanonicalUrl(slug, 'booking') : '',
                  })
                }}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="Ketik ulang nama layanan"
              />
            </div>

            {/* DESKRIPSI */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => {
                  const description = e.target.value
                  setForm({ 
                    ...form, 
                    description,
                    metaDescription: description && form.name ? 
                      generateMetaDescription(description, form.name, settings?.siteName || 'Beauty Studio') : 
                      form.metaDescription,
                  })
                }}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="Deskripsi layanan..."
              />
            </div>

            {/* GAMBAR LAYANAN */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Gambar Layanan</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.imageUrl}
                  onChange={(e) => {
                    const imageUrl = e.target.value
                    setForm({ 
                      ...form, 
                      imageUrl,
                      ogImageUrl: imageUrl ? generateOgImage(imageUrl, settings?.defaultOgImage || null, settings?.logoUrl || null) || '' : '',
                    })
                  }}
                  className="flex-1 mt-1 block px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                  placeholder="https://example.com/gambar-layanan.jpg"
                />
                <button
                  type="button"
                  onClick={() => setShowMediaPicker(true)}
                  className="mt-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <ImageIcon className="w-4 h-4" />
                  Pilih
                </button>
              </div>
              {form.imageUrl && (
                <div className="mt-2">
                  <img src={form.imageUrl} alt="Preview" className="w-20 h-20 object-cover rounded-lg border" />
                </div>
              )}
            </div>

            {/* FEATURED */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Featured Service</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  className="w-4 h-4 text-pink-500 rounded border-gray-300"
                />
                <span className="text-sm text-gray-600">Tampilkan di halaman utama sebagai featured</span>
              </div>
            </div>

            {/* HARGA */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp) *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                  placeholder="100000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga Coret</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.compareAtPrice}
                  onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                  placeholder="150000"
                />
              </div>
            </div>

            {/* DURASI & STATUS */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Durasi (menit) - Opsional</label>
                <input
                  type="number"
                  min="15"
                  step="15"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                  placeholder="60"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={form.isActive ? 'ACTIVE' : 'INACTIVE'}
                  onChange={(e) => setForm({ ...form, isActive: e.target.value === 'ACTIVE' })}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            {/* KATEGORI */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
              <Select
                options={getCategoryOptions()}
                value={getSelectedCategoryOption()}
                onChange={(selected) => {
                  setForm({ ...form, categoryId: selected?.value || '' })
                }}
                placeholder="Cari atau pilih kategori..."
                isClearable
                className="mt-1"
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({
                    ...base,
                    borderColor: '#D1D5DB',
                    borderRadius: '0.5rem',
                    padding: '2px',
                    '&:hover': {
                      borderColor: '#D1D5DB',
                    },
                    '&:focus-within': {
                      borderColor: '#EC4899',
                      boxShadow: '0 0 0 2px rgba(236, 72, 153, 0.2)',
                    },
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isSelected ? '#EC4899' : state.isFocused ? '#FCE7F3' : 'white',
                    color: state.isSelected ? 'white' : '#1F2937',
                    '&:hover': {
                      backgroundColor: state.isSelected ? '#EC4899' : '#FCE7F3',
                    },
                  }),
                }}
              />
            </div>

            {/* TAGS */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <Select
                isMulti
                options={getTagOptions()}
                value={getSelectedTagOptions()}
                onChange={(selected) => {
                  const ids = selected ? selected.map(item => item.value) : []
                  setForm({ ...form, tagIds: ids })
                }}
                placeholder="Cari atau pilih tags..."
                className="mt-1"
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({
                    ...base,
                    borderColor: '#D1D5DB',
                    borderRadius: '0.5rem',
                    padding: '2px',
                    '&:hover': {
                      borderColor: '#D1D5DB',
                    },
                    '&:focus-within': {
                      borderColor: '#EC4899',
                      boxShadow: '0 0 0 2px rgba(236, 72, 153, 0.2)',
                    },
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isSelected ? '#EC4899' : state.isFocused ? '#FCE7F3' : 'white',
                    color: state.isSelected ? 'white' : '#1F2937',
                    '&:hover': {
                      backgroundColor: state.isSelected ? '#EC4899' : '#FCE7F3',
                    },
                  }),
                  multiValue: (provided) => ({
                    ...provided,
                    borderRadius: '0.375rem',
                  }),
                  multiValueLabel: (provided) => ({
                    ...provided,
                    padding: '2px 8px',
                    fontSize: '0.875rem',
                  }),
                  multiValueRemove: (provided) => ({
                    ...provided,
                    borderRadius: '0 0.375rem 0.375rem 0',
                    '&:hover': {
                      backgroundColor: '#EF4444',
                      color: 'white',
                    },
                  }),
                }}
                formatOptionLabel={(option) => (
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: option.color }}
                    />
                    <span>{option.label}</span>
                  </div>
                )}
              />
              <p className="text-xs text-gray-400 mt-1">
                {form.tagIds.length > 0 ? `${form.tagIds.length} tag terpilih` : 'Cari dan pilih tags'}
              </p>
            </div>

            {/* VOUCHER */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Voucher</label>
              <Select
                isMulti
                options={getPromoOptions()}
                value={getSelectedPromoOptions()}
                onChange={(selected) => {
                  const ids = selected ? selected.map(item => item.value) : []
                  setForm({ ...form, promoIds: ids })
                }}
                placeholder="Cari atau pilih voucher..."
                className="mt-1"
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({
                    ...base,
                    borderColor: '#D1D5DB',
                    borderRadius: '0.5rem',
                    padding: '2px',
                    '&:hover': {
                      borderColor: '#D1D5DB',
                    },
                    '&:focus-within': {
                      borderColor: '#EC4899',
                      boxShadow: '0 0 0 2px rgba(236, 72, 153, 0.2)',
                    },
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isSelected ? '#EC4899' : state.isFocused ? '#FCE7F3' : 'white',
                    color: state.isSelected ? 'white' : '#1F2937',
                    '&:hover': {
                      backgroundColor: state.isSelected ? '#EC4899' : '#FCE7F3',
                    },
                  }),
                  multiValue: (provided) => ({
                    ...provided,
                    borderRadius: '0.375rem',
                  }),
                  multiValueLabel: (provided) => ({
                    ...provided,
                    padding: '2px 8px',
                    fontSize: '0.875rem',
                  }),
                  multiValueRemove: (provided) => ({
                    ...provided,
                    borderRadius: '0 0.375rem 0.375rem 0',
                    '&:hover': {
                      backgroundColor: '#EF4444',
                      color: 'white',
                    },
                  }),
                }}
              />
              <p className="text-xs text-gray-400 mt-1">
                {form.promoIds.length > 0 ? `${form.promoIds.length} voucher terpilih` : 'Cari dan pilih voucher'}
              </p>
            </div>

            {/* SEO DROPDOWN */}
            <div className="border-t border-gray-200 pt-3">
              <button
                type="button"
                onClick={() => setIsSeoOpen(!isSeoOpen)}
                className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="flex items-center gap-2 font-medium text-gray-700">
                  🔍 Advanced SEO
                  <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Auto
                  </span>
                </span>
                {isSeoOpen ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {isSeoOpen && (
                <div className="mt-3 space-y-3 border-t border-gray-200 pt-3">
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Meta Title</label>
                    <input
                      type="text"
                      value={form.metaTitle}
                      onChange={(e) => {
                        setIsAutoGenerating(true)
                        setForm({ ...form, metaTitle: e.target.value })
                        setTimeout(() => setIsAutoGenerating(false), 100)
                      }}
                      className="mt-1 block w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                      placeholder="Auto-generated from service name"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Meta Description</label>
                    <textarea
                      rows={2}
                      value={form.metaDescription}
                      onChange={(e) => {
                        setIsAutoGenerating(true)
                        setForm({ ...form, metaDescription: e.target.value })
                        setTimeout(() => setIsAutoGenerating(false), 100)
                      }}
                      className="mt-1 block w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                      placeholder="Auto-generated from description"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Canonical URL</label>
                    <input
                      type="text"
                      value={form.canonicalUrl}
                      onChange={(e) => {
                        setIsAutoGenerating(true)
                        setForm({ ...form, canonicalUrl: e.target.value })
                        setTimeout(() => setIsAutoGenerating(false), 100)
                      }}
                      className="mt-1 block w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                      placeholder="Auto-generated from slug"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">OG Image URL</label>
                    <input
                      type="text"
                      value={form.ogImageUrl}
                      onChange={(e) => {
                        setIsAutoGenerating(true)
                        setForm({ ...form, ogImageUrl: e.target.value })
                        setTimeout(() => setIsAutoGenerating(false), 100)
                      }}
                      className="mt-1 block w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                      placeholder="Auto-generated from service image"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* BUTTONS */}
            <div className="flex gap-4 pt-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 text-sm"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Menyimpan...' : 'Simpan Layanan'}
              </button>
              <Link href="/admin/bookings" className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg text-sm">
                Batal
              </Link>
            </div>
          </form>
        </div>

        <div className="lg:w-1/2">
          <ServicePreview />
        </div>
      </div>

      {showMediaPicker && <MediaPicker />}
    </div>
  )
}