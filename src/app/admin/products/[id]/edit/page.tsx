'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Eye } from 'lucide-react'
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

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  compareAtPrice: number | null
  stock: number
  status: string
  categoryId: string
  imageUrl: string | null
  category?: { name: string } | null
  metaTitle: string | null
  metaDescription: string | null
  canonicalUrl: string | null
  ogImageUrl: string | null
  tags: Tag[]
}

interface Settings {
  colorPrimary: string
  colorSecondary: string
}

const PRESET_COLORS = [
  { value: 'bg-red-500', hex: '#ad0000', label: 'Red' },
  { value: 'bg-blue-500', hex: '#0054ad', label: 'Blue' },
  { value: 'bg-green-500', hex: '#00ad3f', label: 'Green' },
  { value: 'bg-yellow-500', hex: '#c7c402', label: 'Yellow' },
  { value: 'bg-purple-500', hex: '#8d00ad', label: 'Purple' },
  { value: 'bg-pink-500', hex: '#c4367b', label: 'Pink' },
  { value: 'bg-orange-500', hex: '#F97316', label: 'Orange' },
  { value: 'bg-cyan-500', hex: '#0096ad', label: 'Cyan' },
  { value: 'bg-indigo-500', hex: '#6366F1', label: 'Indigo' },
  { value: 'bg-gray-500', hex: '#9e959b', label: 'Gray' },
]

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)
  const [form, setForm] = useState<Product>({
    id: '',
    name: '',
    slug: '',
    description: '',
    price: 0,
    compareAtPrice: null,
    stock: 0,
    status: 'DRAFT',
    categoryId: '',
    imageUrl: null,
    metaTitle: '',
    metaDescription: '',
    canonicalUrl: '',
    ogImageUrl: '',
    tags: [],
  })

  useEffect(() => {
    fetchProduct()
    fetchCategories()
    fetchTags()
    fetchSettings()
  }, [])

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/admin/products/${params.id}`)
      if (!res.ok) {
        toast.error('Produk tidak ditemukan')
        router.push('/admin/products')
        return
      }
      const data = await res.json()
      setForm({
        ...data,
        compareAtPrice: data.compareAtPrice || null,
        imageUrl: data.imageUrl || null,
      })
      setSelectedTagIds(data.tags?.map((t: Tag) => t.id) || [])
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Gagal memuat produk')
      router.push('/admin/products')
    } finally {
      setFetching(false)
    }
  }

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
      const payload = {
        ...form,
        price: parseFloat(form.price.toString()),
        compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice.toString()) : null,
        stock: parseInt(form.stock.toString()),
        imageUrl: form.imageUrl || null,
      }

      const res = await fetch(`/api/admin/products/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update product')
      }

      if (selectedTagIds.length > 0) {
        await fetch(`/api/admin/products/${params.id}/tags`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tagIds: selectedTagIds }),
        })
      }

      toast.success('Produk berhasil diupdate!')
      router.push('/admin/products')
      router.refresh()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Error saat mengupdate produk')
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
      price: form.price || 0,
      compareAtPrice: form.compareAtPrice || null,
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
                />
              ) : (
                <span className="text-4xl">🧴</span>
              )}
              
              {/* TAGS DI KIRI ATAS FOTO - TANPA SALE */}
              {preview.tags.length > 0 && (
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {preview.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag.id}
                      className="px-1.5 py-0.5 text-[10px] text-white rounded-full font-medium shadow-sm"
                      style={{ backgroundColor: getTagColor(tag.color) }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
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

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/products" className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Edit Produk</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="lg:w-1/2">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
            {/* Form fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama Produk *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value
                  setForm({ 
                    ...form, 
                    name, 
                    slug: name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '') 
                  })
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
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Gambar Produk (URL dari Media)</label>
              <input
                type="text"
                value={form.imageUrl || ''}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="https://... (copy dari Media Manager)"
              />
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
                  onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Harga Coret</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.compareAtPrice || ''}
                  onChange={(e) => setForm({ 
                    ...form, 
                    compareAtPrice: e.target.value ? parseFloat(e.target.value) : null 
                  })}
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
                  onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
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
                {loading ? 'Menyimpan...' : 'Update Produk'}
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
    </div>
  )
}
