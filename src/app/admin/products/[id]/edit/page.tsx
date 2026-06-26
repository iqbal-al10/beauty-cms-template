'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
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
  stock: number
  status: string
  categoryId: string
  metaTitle: string | null
  metaDescription: string | null
  canonicalUrl: string | null
  ogImageUrl: string | null
  tags: Tag[]
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [form, setForm] = useState<Product>({
    id: '',
    name: '',
    slug: '',
    description: '',
    price: 0,
    stock: 0,
    status: 'DRAFT',
    categoryId: '',
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
      setForm(data)
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
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchTags = async () => {
    try {
      const res = await fetch('/api/admin/tags')
      const data = await res.json()
      setTags(data)
    } catch (error) {
      console.error('Error fetching tags:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`/api/admin/products/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price.toString()),
          stock: parseInt(form.stock.toString()),
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update product')
      }

      await fetch(`/api/admin/products/${params.id}/tags`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagIds: selectedTagIds }),
      })

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

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4 max-w-2xl">
        {/* Nama Produk */}
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
            rows={3}
            value={form.description || ''}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Harga *</label>
            <input
              type="number"
              required
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Stok *</label>
            <input
              type="number"
              required
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) })}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Kategori *</label>
            <select
              required
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
            >
              <option value="">Pilih Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
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

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Tags</label>
          <select
            multiple
            value={selectedTagIds}
            onChange={(e) => {
              const options = Array.from(e.target.selectedOptions, option => option.value)
              setSelectedTagIds(options)
            }}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 min-h-[100px]"
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
          {selectedTagIds.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedTagIds.map((tagId) => {
                const tag = tags.find(t => t.id === tagId)
                return tag ? (
                  <span key={tag.id} className={`px-2 py-1 text-xs text-white rounded-full ${tag.color || 'bg-gray-500'}`}>
                    {tag.name}
                  </span>
                ) : null
              })}
            </div>
          )}
        </div>

        {/* ===== SEO FIELDS ===== */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🔍 SEO</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Meta Title</label>
              <input
                type="text"
                value={form.metaTitle || ''}
                onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="SEO title (max 60 chars)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Meta Description</label>
              <textarea
                rows={2}
                value={form.metaDescription || ''}
                onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="SEO description (max 160 chars)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Canonical URL</label>
              <input
                type="text"
                value={form.canonicalUrl || ''}
                onChange={(e) => setForm({ ...form, canonicalUrl: e.target.value })}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="https://example.com/canonical-url"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">OG Image URL</label>
              <input
                type="text"
                value={form.ogImageUrl || ''}
                onChange={(e) => setForm({ ...form, ogImageUrl: e.target.value })}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="https://example.com/og-image.jpg"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Menyimpan...' : 'Update Produk'}
          </button>
          <Link href="/admin/products" className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg">
            Batal
          </Link>
        </div>
      </form>
    </div>
  )
}
