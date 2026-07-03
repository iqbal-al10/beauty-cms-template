'use client'

import { useEffect, useState } from 'react'
import { 
  Plus, Edit, Trash2, Save, X, Layers, Clock, DollarSign, 
  Tag, ShoppingBag, Image as ImageIcon, Eye, Search, 
  Check, Star, Filter, Package, Ticket
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  compareAtPrice: number | null
  stock: number
  status: string
  isFeatured: boolean
  categoryId: string
  category?: { id: string; name: string } | null
  imageUrl: string | null
  metaTitle: string | null
  metaDescription: string | null
  canonicalUrl: string | null
  ogImageUrl: string | null
  createdAt: string
  tags: ProductTag[]
  promos: PromoProduct[]
}

interface Category {
  id: string
  name: string
  slug: string
  sortOrder: number
  isActive: boolean
  createdAt: string
}

interface ProductTag {
  id: string
  name: string
  slug: string
  color: string | null
  createdAt: string
}

interface Promo {
  id: string
  code: string
  discount: number
  startDate: string
  endDate: string
  isActive: boolean
  createdAt: string
  products: { productId: string }[]
}

interface PromoProduct {
  id: string
  promoId: string
  productId: string
  createdAt: string
  promo?: Promo
}

type TabType = 'products' | 'categories' | 'tags' | 'promos'

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

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('products')
  
  // ===== PRODUCT STATE =====
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')

  // ===== CATEGORY STATE =====
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    sortOrder: 0,
    isActive: true,
  })

  // ===== TAG STATE =====
  const [tags, setTags] = useState<ProductTag[]>([])
  const [loadingTags, setLoadingTags] = useState(true)
  const [showTagForm, setShowTagForm] = useState(false)
  const [editingTag, setEditingTag] = useState<ProductTag | null>(null)
  const [tagForm, setTagForm] = useState({
    name: '',
    slug: '',
    color: 'bg-red-500',
  })
  const [customTagColor, setCustomTagColor] = useState('#EF4444')

  // ===== PROMO STATE =====
  const [promos, setPromos] = useState<Promo[]>([])
  const [loadingPromos, setLoadingPromos] = useState(true)
  const [showPromoForm, setShowPromoForm] = useState(false)
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null)
  const [allProducts, setAllProducts] = useState<{ id: string; name: string }[]>([])
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [promoForm, setPromoForm] = useState({
    code: '',
    discount: '',
    startDate: '',
    endDate: '',
    isActive: true,
  })

  // ===== FETCH FUNCTIONS =====
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true)
      const res = await fetch('/api/admin/products')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setProducts(data || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Gagal memuat produk')
      setProducts([])
    } finally {
      setLoadingProducts(false)
    }
  }

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true)
      const res = await fetch('/api/admin/categories')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setCategories(data || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Gagal memuat kategori')
      setCategories([])
    } finally {
      setLoadingCategories(false)
    }
  }

  const fetchTags = async () => {
    try {
      setLoadingTags(true)
      const res = await fetch('/api/admin/tags')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setTags(data || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Gagal memuat tag')
      setTags([])
    } finally {
      setLoadingTags(false)
    }
  }

  const fetchPromos = async () => {
    try {
      setLoadingPromos(true)
      const res = await fetch('/api/admin/promos')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setPromos(data || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Gagal memuat promo')
      setPromos([])
    } finally {
      setLoadingPromos(false)
    }
  }

  const fetchAllProducts = async () => {
    try {
      const res = await fetch('/api/admin/products?all=true&select=true')
      if (!res.ok) {
        setAllProducts([])
        return
      }
      const data = await res.json()
      setAllProducts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching products:', error)
      setAllProducts([])
    }
  }

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    fetchTags()
    fetchPromos()
    fetchAllProducts()
  }, [])

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').trim()
  }

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`
  }

  const getTagDisplayColor = (color: string | null) => {
    if (!color) return '#6B7280'
    if (color.startsWith('#')) return color
    const preset = PRESET_COLORS.find(p => p.value === color)
    if (preset) return preset.hex
    return '#6B7280'
  }

  // ===== PRODUCT ACTIONS =====
  const toggleProductStatus = async (id: string, currentStatus: string, name: string) => {
    try {
      const product = products.find(p => p.id === id)
      if (!product) return
      const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...product, status: newStatus }),
      })
      if (res.ok) {
        toast.success(`Produk "${name}" ${newStatus === 'PUBLISHED' ? 'dipublikasikan' : 'di-draft'}`)
        fetchProducts()
      } else {
        toast.error('Gagal mengubah status')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error saat mengubah status')
    }
  }

  const toggleProductFeatured = async (id: string, currentStatus: boolean, name: string) => {
    try {
      const product = products.find(p => p.id === id)
      if (!product) return
      const newStatus = !currentStatus
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...product, isFeatured: newStatus }),
      })
      if (res.ok) {
        toast.success(`Produk "${name}" ${newStatus ? 'di-featured' : 'di-unfeatured'}`)
        fetchProducts()
      } else {
        toast.error('Gagal mengubah status featured')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error saat mengubah status featured')
    }
  }

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus produk "${name}"?`)) return
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success(`Produk "${name}" berhasil dihapus!`)
        setProducts(products.filter(p => p.id !== id))
        setSelectedIds(selectedIds.filter(sid => sid !== id))
      } else {
        toast.error('Gagal menghapus produk')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Error saat menghapus produk')
    }
  }

  // ===== BULK ACTIONS =====
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.error('Pilih minimal satu produk')
      return
    }
    if (!confirm(`Yakin ingin menghapus ${selectedIds.length} produk?`)) return
    try {
      let successCount = 0
      for (const id of selectedIds) {
        const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
        if (res.ok) successCount++
      }
      if (successCount > 0) {
        toast.success(`${successCount} produk berhasil dihapus!`)
        setProducts(products.filter(p => !selectedIds.includes(p.id)))
        setSelectedIds([])
        setSelectAll(false)
      } else {
        toast.error('Gagal menghapus produk')
      }
    } catch (error) {
      console.error('Error bulk deleting products:', error)
      toast.error('Error saat menghapus produk')
    }
  }

  const handleBulkStatus = async (status: string) => {
    if (selectedIds.length === 0) {
      toast.error('Pilih minimal satu produk')
      return
    }
    try {
      let successCount = 0
      for (const id of selectedIds) {
        const product = products.find(p => p.id === id)
        if (product) {
          const res = await fetch(`/api/admin/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...product, status }),
          })
          if (res.ok) successCount++
        }
      }
      if (successCount > 0) {
        toast.success(`${successCount} produk berhasil diupdate!`)
        fetchProducts()
        setSelectedIds([])
        setSelectAll(false)
      } else {
        toast.error('Gagal mengupdate produk')
      }
    } catch (error) {
      console.error('Error bulk updating products:', error)
      toast.error('Error saat mengupdate produk')
    }
  }

  // ===== CATEGORY ACTIONS =====
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryForm.name.trim() || !categoryForm.slug.trim()) {
      toast.error('Nama dan slug harus diisi')
      return
    }
    try {
      const url = editingCategory ? `/api/admin/categories/${editingCategory.id}` : '/api/admin/categories'
      const method = editingCategory ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(categoryForm) })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to save')
      }
      toast.success(editingCategory ? 'Kategori berhasil diupdate!' : 'Kategori berhasil ditambahkan!')
      fetchCategories()
      handleCategoryCancel()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal menyimpan kategori')
    }
  }

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus kategori "${name}"?`)) return
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete')
      }
      toast.success(`Kategori "${name}" berhasil dihapus!`)
      setCategories(categories.filter(c => c.id !== id))
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal menghapus kategori')
    }
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
    })
    setShowCategoryForm(true)
  }

  const handleCategoryCancel = () => {
    setShowCategoryForm(false)
    setEditingCategory(null)
    setCategoryForm({
      name: '',
      slug: '',
      sortOrder: 0,
      isActive: true,
    })
  }

  const toggleCategoryActive = async (id: string, currentStatus: boolean, name: string) => {
    try {
      const category = categories.find(c => c.id === id)
      if (!category) return
      const newStatus = !currentStatus
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...category, isActive: newStatus }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update')
      }
      toast.success(`Kategori "${name}" ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`)
      fetchCategories()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal mengubah status')
    }
  }

  // ===== TAG ACTIONS =====
  const handleTagSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tagForm.name.trim() || !tagForm.slug.trim()) {
      toast.error('Nama dan slug harus diisi')
      return
    }
    try {
      const url = editingTag ? `/api/admin/tags/${editingTag.id}` : '/api/admin/tags'
      const method = editingTag ? 'PUT' : 'POST'
      const payload = { name: tagForm.name, slug: tagForm.slug, color: tagForm.color }
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (res.ok) {
        toast.success(editingTag ? 'Tag berhasil diupdate!' : 'Tag berhasil ditambahkan!')
        fetchTags()
        handleTagCancel()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Gagal menyimpan tag')
      }
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal menyimpan tag')
    }
  }

  const handleDeleteTag = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus tag "${name}"?`)) return
    try {
      const res = await fetch(`/api/admin/tags/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success(`Tag "${name}" berhasil dihapus!`)
        setTags(tags.filter(t => t.id !== id))
      } else {
        toast.error('Gagal menghapus tag')
      }
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal menghapus tag')
    }
  }

  const handleEditTag = (tag: ProductTag) => {
    setEditingTag(tag)
    setTagForm({
      name: tag.name,
      slug: tag.slug,
      color: tag.color || 'bg-red-500',
    })
    const isPreset = PRESET_COLORS.some(p => p.value === tag.color)
    setCustomTagColor(isPreset ? '#EF4444' : (tag.color || '#EF4444'))
    setShowTagForm(true)
  }

  const handleTagCancel = () => {
    setShowTagForm(false)
    setEditingTag(null)
    setTagForm({ name: '', slug: '', color: 'bg-red-500' })
    setCustomTagColor('#EF4444')
  }

  const handleTagColorSelect = (colorValue: string, hex: string) => {
    setTagForm({ ...tagForm, color: colorValue })
    setCustomTagColor(hex)
  }

  // ===== PROMO ACTIONS =====
  const handlePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!promoForm.code.trim()) {
      toast.error('Kode Voucher harus diisi')
      return
    }
    if (!promoForm.discount || parseFloat(promoForm.discount) <= 0) {
      toast.error('Nominal diskon harus diisi dan lebih dari 0')
      return
    }
    if (!promoForm.startDate || !promoForm.endDate) {
      toast.error('Tanggal mulai dan selesai harus diisi')
      return
    }
    if (selectedProductIds.length === 0) {
      toast.error('Pilih minimal satu produk')
      return
    }

    try {
      const url = editingPromo ? `/api/admin/promos/${editingPromo.id}` : '/api/admin/promos'
      const method = editingPromo ? 'PUT' : 'POST'
      const payload = {
        code: promoForm.code.toUpperCase(),
        discount: parseFloat(promoForm.discount),
        startDate: promoForm.startDate,
        endDate: promoForm.endDate,
        isActive: promoForm.isActive,
        productIds: selectedProductIds,
      }
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (res.ok) {
        toast.success(editingPromo ? 'Promo berhasil diupdate!' : 'Promo berhasil ditambahkan!')
        fetchPromos()
        handlePromoCancel()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Gagal menyimpan promo')
      }
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal menyimpan promo')
    }
  }

  const handleDeletePromo = async (id: string, code: string) => {
    if (!confirm(`Yakin ingin menghapus promo "${code}"?`)) return
    try {
      const res = await fetch(`/api/admin/promos/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success(`Promo "${code}" berhasil dihapus!`)
        setPromos(promos.filter(p => p.id !== id))
      } else {
        toast.error('Gagal menghapus promo')
      }
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal menghapus promo')
    }
  }

  const handleEditPromo = (promo: Promo) => {
    setEditingPromo(promo)
    setPromoForm({
      code: promo.code,
      discount: promo.discount.toString(),
      startDate: promo.startDate.split('T')[0],
      endDate: promo.endDate.split('T')[0],
      isActive: promo.isActive,
    })
    setSelectedProductIds(promo.products?.map((p) => p.productId) || [])
    setShowPromoForm(true)
  }

  const handlePromoCancel = () => {
    setShowPromoForm(false)
    setEditingPromo(null)
    setPromoForm({
      code: '',
      discount: '',
      startDate: '',
      endDate: '',
      isActive: true,
    })
    setSelectedProductIds([])
  }

  const togglePromoActive = async (id: string, currentStatus: boolean, code: string) => {
    try {
      const promo = promos.find(p => p.id === id)
      if (!promo) return
      const newStatus = !currentStatus
      const res = await fetch(`/api/admin/promos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...promo, isActive: newStatus }),
      })
      if (res.ok) {
        toast.success(`Promo "${code}" ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`)
        fetchPromos()
      } else {
        toast.error('Gagal mengubah status promo')
      }
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal mengubah status promo')
    }
  }

  const getPromoStatus = (promo: Promo) => {
    const now = new Date()
    const start = new Date(promo.startDate)
    const end = new Date(promo.endDate)
    if (!promo.isActive) return { label: 'Inactive', color: 'bg-red-100 text-red-700' }
    if (now < start) return { label: 'Upcoming', color: 'bg-blue-100 text-blue-700' }
    if (now > end) return { label: 'Expired', color: 'bg-gray-100 text-gray-700' }
    return { label: 'Active', color: 'bg-green-100 text-green-700' }
  }

  // ===== FILTERED PRODUCTS =====
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.slug.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !filterCategory || product.categoryId === filterCategory
    return matchesSearch && matchesCategory
  })

  if (loadingProducts || loadingCategories || loadingTags || loadingPromos) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  // ===== RENDER HEADER BUTTON =====
  const renderHeaderButton = () => {
    switch (activeTab) {
      case 'products':
        return (
          <Link
            href="/admin/products/new"
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Plus className="w-5 h-5" /> Tambah Produk
          </Link>
        )
      case 'categories':
        return (
          <button
            onClick={() => {
              setEditingCategory(null)
              setCategoryForm({ name: '', slug: '', sortOrder: categories.length, isActive: true })
              setShowCategoryForm(!showCategoryForm)
            }}
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Plus className="w-5 h-5" /> Tambah Kategori
          </button>
        )
      case 'tags':
        return (
          <button
            onClick={() => {
              setEditingTag(null)
              setTagForm({ name: '', slug: '', color: 'bg-red-500' })
              setShowTagForm(!showTagForm)
            }}
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Plus className="w-5 h-5" /> Tambah Tag
          </button>
        )
      case 'promos':
        return (
          <button
            onClick={() => {
              setEditingPromo(null)
              setPromoForm({ code: '', discount: '', startDate: '', endDate: '', isActive: true })
              setSelectedProductIds([])
              setShowPromoForm(!showPromoForm)
            }}
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Plus className="w-5 h-5" /> Tambah Voucher
          </button>
        )
      default:
        return null
    }
  }

  return (
    <div>
      {/* ===== HEADER WITH BUTTON ===== */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📦 Products</h1>
        {renderHeaderButton()}
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
        <button onClick={() => setActiveTab('products')} className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'products' ? 'border-pink-500 text-pink-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          <Package className="w-4 h-4 inline mr-2" /> Products ({products.length})
        </button>
        <button onClick={() => setActiveTab('categories')} className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'categories' ? 'border-pink-500 text-pink-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          <Layers className="w-4 h-4 inline mr-2" /> Categories ({categories.length})
        </button>
        <button onClick={() => setActiveTab('tags')} className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'tags' ? 'border-pink-500 text-pink-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          <Tag className="w-4 h-4 inline mr-2" /> Tags ({tags.length})
        </button>
        <button onClick={() => setActiveTab('promos')} className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'promos' ? 'border-pink-500 text-pink-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          <Ticket className="w-4 h-4 inline mr-2" /> Vouchers ({promos.length})
        </button>
      </div>

      {/* ===== TAB 1: PRODUCTS ===== */}
      {activeTab === 'products' && (
        <>
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex flex-wrap gap-2 flex-1">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari produk..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 appearance-none"
                >
                  <option value="">Semua Kategori</option>
                  {categories.filter(c => c.isActive).map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {selectedIds.length > 0 && (
            <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 mb-4 flex items-center gap-4 flex-wrap">
              <span className="text-sm text-pink-700 font-medium">{selectedIds.length} produk dipilih</span>
              <button onClick={() => handleBulkStatus('PUBLISHED')} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1"><Check className="w-4 h-4" /> Publish</button>
              <button onClick={() => handleBulkStatus('DRAFT')} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1"><X className="w-4 h-4" /> Draft</button>
              <button onClick={handleBulkDelete} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1"><Trash2 className="w-4 h-4" /> Hapus</button>
              <button onClick={() => { setSelectedIds([]); setSelectAll(false) }} className="text-gray-500 hover:text-gray-700 text-sm">Batal</button>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input 
                        type="checkbox" 
                        checked={selectAll} 
                        onChange={() => { 
                          if (selectAll) { 
                            setSelectedIds([]) 
                          } else { 
                            setSelectedIds(filteredProducts.map(p => p.id)) 
                          } 
                          setSelectAll(!selectAll) 
                        }} 
                        className="w-4 h-4 text-pink-500 rounded border-gray-300" 
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gambar</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tags</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stok</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Featured</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
                        Belum ada produk. <Link href="/admin/products/new" className="text-pink-500 hover:underline">Tambah produk pertama</Link>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => {
                      const isChecked = selectedIds.includes(product.id)
                      const productTags = product.tags || []
                      return (
                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <input 
                              type="checkbox" 
                              checked={isChecked} 
                              onChange={() => { 
                                if (isChecked) { 
                                  setSelectedIds(selectedIds.filter(id => id !== product.id)) 
                                } else { 
                                  setSelectedIds([...selectedIds, product.id]) 
                                } 
                              }} 
                              className="w-4 h-4 text-pink-500 rounded border-gray-300" 
                            />
                          </td>
                          <td className="px-6 py-4">
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded-lg" />
                            ) : (
                              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">🧴</div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            {product.description && <div className="text-xs text-gray-500">{product.description}</div>}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {product.category?.name || '-'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {productTags.length > 0 ? (
                                productTags.slice(0, 2).map((tag) => (
                                  <span
                                    key={tag.id}
                                    className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white truncate max-w-[60px]"
                                    style={{ backgroundColor: getTagDisplayColor(tag.color) }}
                                  >
                                    {tag.name}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-gray-400">-</span>
                              )}
                              {productTags.length > 2 && (
                                <span className="text-xs text-gray-400">+{productTags.length - 2}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {formatCurrency(product.price)}
                            {product.compareAtPrice && product.compareAtPrice > product.price && (
                              <span className="text-xs text-gray-400 line-through ml-1">
                                {formatCurrency(product.compareAtPrice)}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              product.stock > 10 ? 'bg-green-100 text-green-700' : 
                              product.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 
                              'bg-red-100 text-red-700'
                            }`}>
                              {product.stock} unit
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button 
                              onClick={() => toggleProductFeatured(product.id, product.isFeatured, product.name)} 
                              className={`px-2 py-1 text-xs rounded-full transition-colors ${
                                product.isFeatured ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {product.isFeatured ? '⭐ Yes' : 'No'}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <button 
                              onClick={() => toggleProductStatus(product.id, product.status, product.name)} 
                              className={`px-2 py-1 text-xs rounded-full transition-colors ${
                                product.status === 'PUBLISHED' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {product.status === 'PUBLISHED' ? '✅ Published' : '📝 Draft'}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <Link href={`/admin/products/${product.id}`} className="text-blue-600 hover:text-blue-800">
                              <Eye className="w-5 h-5 inline" />
                            </Link>
                            <Link href={`/admin/products/${product.id}/edit`} className="text-yellow-600 hover:text-yellow-800">
                              <Edit className="w-5 h-5 inline" />
                            </Link>
                            <button onClick={() => handleDeleteProduct(product.id, product.name)} className="text-red-600 hover:text-red-800">
                              <Trash2 className="w-5 h-5 inline" />
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-between items-center">
              <p className="text-sm text-gray-500">Total: <span className="font-medium text-gray-700">{filteredProducts.length}</span> produk</p>
              <p className="text-sm text-gray-500">
                Published: <span className="font-medium text-green-600">{filteredProducts.filter(p => p.status === 'PUBLISHED').length}</span> 
                | Draft: <span className="font-medium text-gray-600">{filteredProducts.filter(p => p.status === 'DRAFT').length}</span> 
                | Featured: <span className="font-medium text-yellow-600">{filteredProducts.filter(p => p.isFeatured).length}</span>
              </p>
            </div>
          </div>
        </>
      )}

      {/* ===== TAB 2: CATEGORIES ===== */}
      {activeTab === 'categories' && (
        <>
          {showCategoryForm && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
              <h2 className="text-lg font-semibold mb-4">{editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}</h2>
              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nama Kategori *</label>
                    <input 
                      type="text" 
                      required 
                      value={categoryForm.name} 
                      onChange={(e) => { 
                        const name = e.target.value; 
                        setCategoryForm({ ...categoryForm, name, slug: generateSlug(name) }) 
                      }} 
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400" 
                      placeholder="Contoh: Skincare" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Slug *</label>
                    <input 
                      type="text" 
                      required 
                      value={categoryForm.slug} 
                      onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value.toLowerCase().replace(/ /g, '-') })} 
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400" 
                      placeholder="skincare" 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sort Order</label>
                    <input 
                      type="number" 
                      value={categoryForm.sortOrder} 
                      onChange={(e) => setCategoryForm({ ...categoryForm, sortOrder: parseInt(e.target.value) || 0 })} 
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400" 
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-6">
                    <input 
                      type="checkbox" 
                      checked={categoryForm.isActive} 
                      onChange={(e) => setCategoryForm({ ...categoryForm, isActive: e.target.checked })} 
                      className="w-4 h-4 text-pink-500 rounded border-gray-300" 
                    />
                    <label className="text-sm text-gray-700">Aktif</label>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <Save className="w-4 h-4" /> {editingCategory ? 'Update' : 'Simpan'}
                  </button>
                  <button type="button" onClick={handleCategoryCancel} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg">
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categories.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Belum ada kategori</td></tr>
                ) : (
                  categories.map((category, index) => (
                    <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{category.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{category.slug}</td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => toggleCategoryActive(category.id, category.isActive, category.name)} 
                          className={`px-2 py-1 text-xs rounded-full transition-colors ${
                            category.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {category.isActive ? '✅ Aktif' : '❌ Nonaktif'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => handleEditCategory(category)} className="text-yellow-600 hover:text-yellow-800">
                          <Edit className="w-5 h-5 inline" />
                        </button>
                        <button onClick={() => handleDeleteCategory(category.id, category.name)} className="text-red-600 hover:text-red-800">
                          <Trash2 className="w-5 h-5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-between items-center">
              <p className="text-sm text-gray-500">Total: <span className="font-medium text-gray-700">{categories.length}</span> kategori</p>
              <p className="text-sm text-gray-500">Aktif: <span className="font-medium text-green-600">{categories.filter(c => c.isActive).length}</span></p>
            </div>
          </div>
        </>
      )}

      {/* ===== TAB 3: TAGS ===== */}
      {activeTab === 'tags' && (
        <>
          {showTagForm && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
              <h2 className="text-lg font-semibold mb-4">{editingTag ? 'Edit Tag' : 'Tambah Tag'}</h2>
              <form onSubmit={handleTagSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nama Tag *</label>
                    <input 
                      type="text" 
                      required 
                      value={tagForm.name} 
                      onChange={(e) => { 
                        const name = e.target.value; 
                        setTagForm({ ...tagForm, name, slug: generateSlug(name) }) 
                      }} 
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400" 
                      placeholder="Contoh: Best Seller" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Slug *</label>
                    <input 
                      type="text" 
                      required 
                      value={tagForm.slug} 
                      onChange={(e) => setTagForm({ ...tagForm, slug: e.target.value.toLowerCase().replace(/ /g, '-') })} 
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400" 
                      placeholder="best-seller" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Warna</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {PRESET_COLORS.map((color) => (
                      <button 
                        key={color.value} 
                        type="button" 
                        onClick={() => handleTagColorSelect(color.value, color.hex)} 
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          tagForm.color === color.value ? 'border-gray-800 scale-110' : 'border-gray-300 hover:scale-105'
                        }`} 
                        style={{ backgroundColor: color.hex }} 
                        title={color.label} 
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Custom:</span>
                    <input 
                      type="color" 
                      value={customTagColor} 
                      onChange={(e) => { 
                        const hex = e.target.value; 
                        setTagForm({ ...tagForm, color: hex }); 
                        setCustomTagColor(hex) 
                      }} 
                      className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer p-1" 
                    />
                  </div>
                  <div className="mt-2">
                    <span className="text-sm text-gray-500">Preview:</span>
                    <span className="ml-2 px-3 py-1 text-xs text-white rounded-full" style={{ backgroundColor: getTagDisplayColor(tagForm.color) }}>
                      {tagForm.name || 'Tag Preview'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <Save className="w-4 h-4" /> {editingTag ? 'Update' : 'Simpan'}
                  </button>
                  <button type="button" onClick={handleTagCancel} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg">
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-200">
              {tags.length === 0 ? (
                <div className="p-8 text-center text-gray-500">Belum ada tag</div>
              ) : (
                tags.map((tag) => {
                  const tagColor = getTagDisplayColor(tag.color)
                  return (
                    <div key={tag.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-4 h-4 rounded-full" style={{ backgroundColor: typeof tagColor === 'string' ? tagColor : '#6B7280' }} />
                        <span className="font-semibold text-gray-800">{tag.name}</span>
                        <span className="text-sm text-gray-400">•</span>
                        <span className="text-sm text-gray-500">{tag.slug}</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEditTag(tag)} className="text-yellow-600 hover:text-yellow-800">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDeleteTag(tag.id, tag.name)} className="text-red-600 hover:text-red-800">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
              <p className="text-sm text-gray-500">Total: <span className="font-medium text-gray-700">{tags.length}</span> tags</p>
            </div>
          </div>
        </>
      )}

      {/* ===== TAB 4: VOUCHERS (PROMOS) ===== */}
      {activeTab === 'promos' && (
        <>
          {showPromoForm && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
              <h2 className="text-lg font-semibold mb-4">{editingPromo ? 'Edit Voucher' : 'Tambah Voucher'}</h2>
              <form onSubmit={handlePromoSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Kode Voucher *</label>
                    <input
                      type="text"
                      required
                      value={promoForm.code}
                      onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                      placeholder="SUMMER20"
                    />
                    <p className="text-xs text-gray-400 mt-1">Kode akan otomatis uppercase</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nominal Diskon (Rp) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="1000"
                      value={promoForm.discount}
                      onChange={(e) => setPromoForm({ ...promoForm, discount: e.target.value })}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                      placeholder="50000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tanggal Mulai *</label>
                    <input
                      type="date"
                      required
                      value={promoForm.startDate}
                      onChange={(e) => setPromoForm({ ...promoForm, startDate: e.target.value })}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tanggal Selesai *</label>
                    <input
                      type="date"
                      required
                      value={promoForm.endDate}
                      onChange={(e) => setPromoForm({ ...promoForm, endDate: e.target.value })}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Produk *</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
                    {allProducts.length === 0 ? (
                      <p className="text-gray-500 text-sm col-span-full">Tidak ada produk</p>
                    ) : (
                      allProducts.map((p) => (
                        <label key={p.id} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={selectedProductIds.includes(p.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProductIds([...selectedProductIds, p.id])
                              } else {
                                setSelectedProductIds(selectedProductIds.filter(id => id !== p.id))
                              }
                            }}
                            className="w-4 h-4 text-pink-500 rounded border-gray-300"
                          />
                          <span className="truncate">{p.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Pilih {selectedProductIds.length} produk</p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={promoForm.isActive}
                    onChange={(e) => setPromoForm({ ...promoForm, isActive: e.target.checked })}
                    className="w-4 h-4 text-pink-500 rounded border-gray-300"
                  />
                  <label className="text-sm text-gray-700">Aktif</label>
                </div>

                <div className="flex gap-2">
                  <button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <Save className="w-4 h-4" /> {editingPromo ? 'Update' : 'Simpan'}
                  </button>
                  <button type="button" onClick={handlePromoCancel} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg">
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-200">
              {promos.length === 0 ? (
                <div className="p-8 text-center text-gray-500">Belum ada voucher</div>
              ) : (
                promos.map((promo) => {
                  const status = getPromoStatus(promo)
                  return (
                    <div key={promo.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="font-semibold text-gray-800">{promo.code}</h3>
                            <span className="px-2 py-0.5 text-xs rounded-full bg-pink-100 text-pink-700">
                              Rp {promo.discount.toLocaleString()}
                            </span>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${status.color}`}>
                              {status.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 flex-wrap">
                            <span>{promo.products?.length || 0} produk</span>
                            <span>Mulai: {new Date(promo.startDate).toLocaleDateString()}</span>
                            <span>Selesai: {new Date(promo.endDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => togglePromoActive(promo.id, promo.isActive, promo.code)} 
                            className={`px-2 py-1 text-xs rounded-full transition-colors ${
                              promo.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                          >
                            {promo.isActive ? '✅ Active' : '❌ Inactive'}
                          </button>
                          <button onClick={() => handleEditPromo(promo)} className="text-yellow-600 hover:text-yellow-800">
                            <Edit className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleDeletePromo(promo.id, promo.code)} className="text-red-600 hover:text-red-800">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
              <p className="text-sm text-gray-500">Total: <span className="font-medium text-gray-700">{promos.length}</span> voucher</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}