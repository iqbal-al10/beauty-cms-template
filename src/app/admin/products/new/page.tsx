'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Eye, Image as ImageIcon, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface Category {
  id: string
  name: string
}

interface Tag {
  id: string
  name: string
  color: string | null
}

interface MediaFile {
  id: string
  url: string
  fileName: string
  folder: string | null
}

interface Settings {
  colorPrimary: string
  colorSecondary: string
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

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [showMediaPicker, setShowMediaPicker] = useState(false)
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    compareAtPrice: '',
    stock: '',
    status: 'DRAFT',
    categoryId: '',
    imageUrl: '',
    metaTitle: '',
    metaDescription: '',
    canonicalUrl: '',
    ogImageUrl: '',
  })

  useEffect(() => {
    fetchCategories()
    fetchTags()
    fetchSettings()
    fetchMediaFiles()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories')
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
      const res = await fetch('/api/admin/tags')
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

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings')
      if (res.ok) {
        const data = await res.json()
        setSettings({
          colorPrimary: data.colorPrimary || '#c4367b',
          colorSecondary: data.colorSecondary || '#f5dbe8',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : null,
          stock: parseInt(form.stock),
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create product')
      }

      const product = await res.json()

      if (selectedTagIds.length > 0) {
        await fetch(`/api/admin/products/${product.id}/tags`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tagIds: selectedTagIds }),
        })
      }

      toast.success('Produk berhasil ditambahkan!')
      router.push('/admin/products')
      router.refresh()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Error saat menambahkan produk')
    } finally {
      setLoading(false)
    }
  }

  const getPreviewData = () => {
    const selectedCategory = categories.find(c => c.id === form.categoryId)
    const selectedTags = tags.filter(t => selectedTagIds.includes(t.id))
    const primaryColor = settings?.colorPrimary || '#c4367b'

    return {
      name: form.name || 'Product Name',
      price: parseFloat(form.price) || 0,
      compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : null,
      category: selectedCategory?.name || 'Category',
      status: form.status,
      tags: selectedTags,
      primaryColor,
      slug: form.slug || 'product-slug',
      imageUrl: form.imageUrl || null,
    }
  }

  const ProductPreview = () => {
    const preview = getPreviewData()

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Live Preview
          </h3>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            preview.status === 'PUBLISHED' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-yellow-100 text-yellow-700'
          }`}>
            {preview.status === 'PUBLISHED' ? 'Published' : 'Draft'}
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
                      fallback.innerHTML = '<span class="text-4xl">🧴</span>'
                      parent.appendChild(fallback)
                    }
                  }}
                />
              ) : (
                <span className="text-4xl">🧴</span>
              )}
              {preview.compareAtPrice && preview.compareAtPrice > preview.price && (
                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  SALE
                </span>
              )}
            </div>

            <h3 className="font-semibold text-gray-800 text-sm line-clamp-1">
              {preview.name}
            </h3>
            <p className="text-xs text-gray-500">{preview.category}</p>

            {preview.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {preview.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="px-1.5 py-0.5 text-[10px] text-white rounded-full font-medium"
                    style={{ backgroundColor: getTagColor(tag.color) }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
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
          <span>/products/{preview.slug}</span>
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
        <Link href="/admin/products" className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Tambah Produk</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="lg:w-1/2">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama Produk *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value
                  setForm({ ...form, name, slug: name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '') })
                }}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Slug *</label>
              <input
                type="text"
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
              />
            </div>

            {/* Gambar Produk - DENGAN TOMBOL PILIH DARI MEDIA */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Gambar Produk</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="flex-1 mt-1 block px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                  placeholder="URL gambar atau pilih dari media"
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Harga *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Harga Coret</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.compareAtPrice}
                  onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Stok *</label>
                <input
                  type="number"
                  required
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Kategori *</label>
              <select
                required
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
              >
                <option value="">Pilih Kategori</option>
                {categories.length === 0 ? (
                  <option value="" disabled>Loading categories...</option>
                ) : (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Tags</label>
              <select
                multiple
                value={selectedTagIds}
                onChange={(e) => {
                  const options = Array.from(e.target.selectedOptions, option => option.value)
                  setSelectedTagIds(options)
                }}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 min-h-[80px]"
              >
                {tags.length === 0 ? (
                  <option value="" disabled>Belum ada tag. Buat tag dulu di menu Tags.</option>
                ) : (
                  tags.map((tag) => (
                    <option key={tag.id} value={tag.id}>{tag.name}</option>
                  ))
                )}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                {selectedTagIds.length > 0 ? `Terpilih: ${selectedTagIds.length} tag` : 'Hold Ctrl/Cmd untuk pilih multiple tags'}
              </p>
            </div>

            <div className="border-t border-gray-200 pt-3">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">🔍 SEO</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Meta Title</label>
                  <input
                    type="text"
                    value={form.metaTitle || ''}
                    onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                    className="mt-1 block w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                    placeholder="SEO title (max 60 chars)"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Meta Description</label>
                  <textarea
                    rows={2}
                    value={form.metaDescription || ''}
                    onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                    className="mt-1 block w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                    placeholder="SEO description (max 160 chars)"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Canonical URL</label>
                  <input
                    type="text"
                    value={form.canonicalUrl || ''}
                    onChange={(e) => setForm({ ...form, canonicalUrl: e.target.value })}
                    className="mt-1 block w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                    placeholder="https://example.com/canonical-url"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">OG Image URL</label>
                  <input
                    type="text"
                    value={form.ogImageUrl || ''}
                    onChange={(e) => setForm({ ...form, ogImageUrl: e.target.value })}
                    className="mt-1 block w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                    placeholder="https://example.com/og-image.jpg"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 text-sm"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Menyimpan...' : 'Simpan Produk'}
              </button>
              <Link href="/admin/products" className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg text-sm">
                Batal
              </Link>
            </div>
          </form>
        </div>

        <div className="lg:w-1/2 sticky top-6">
          <ProductPreview />
        </div>
      </div>

      {/* Media Picker Modal */}
      {showMediaPicker && <MediaPicker />}
    </div>
  )
}
