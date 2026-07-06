'use client'

import { useEffect, useState } from 'react'
import { 
  Plus, Edit, Trash2, Save, X, Layers, Clock, DollarSign, 
  Tag, ShoppingBag, Image as ImageIcon, Eye, Search, 
  Check, Star, Filter, Ticket
} from 'lucide-react'
import Link from 'next/link'
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
  imageUrl: string | null
  isFeatured: boolean
  isActive: boolean
  metaTitle: string | null
  metaDescription: string | null
  canonicalUrl: string | null
  ogImageUrl: string | null
  createdAt: string
  tags: BookingTag[]
  promos: PromoBooking[]
}

interface BookingCategory {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  sortOrder: number
  isActive: boolean
  createdAt: string
}

interface BookingTag {
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
  services: { serviceId: string }[]
}

interface PromoBooking {
  id: string
  promoId: string
  serviceId: string
  createdAt: string
  promo?: Promo
}

interface MediaFile {
  id: string
  url: string
  fileName: string
  folder: string | null
}

type TabType = 'services' | 'categories' | 'tags' | 'promos'

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

const ICON_OPTIONS = [
  { value: '🧖', label: '🧖 Facial' },
  { value: '💆', label: '💆 Body' },
  { value: '💇', label: '💇 Hair' },
  { value: '💅', label: '💅 Nail' },
  { value: '💄', label: '💄 Makeup' },
  { value: '🧘', label: '🧘 Spa' },
  { value: '🏋️', label: '🏋️ Fitness' },
  { value: '💊', label: '💊 Health' },
  { value: '🌿', label: '🌿 Herbal' },
  { value: '📦', label: '📦 Other' },
]

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('services')
  
  // ===== MEDIA PICKER STATE =====
  const [showMediaPicker, setShowMediaPicker] = useState(false)
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  
  // ===== SERVICE STATE =====
  const [services, setServices] = useState<Service[]>([])
  const [loadingServices, setLoadingServices] = useState(true)
  const [showServiceForm, setShowServiceForm] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [serviceForm, setServiceForm] = useState({
    name: '',
    slug: '',
    description: '',
    duration: 60,
    price: '',
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

  // ===== BOOKING CATEGORY STATE =====
  const [categories, setCategories] = useState<BookingCategory[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<BookingCategory | null>(null)
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '📦',
    sortOrder: 0,
    isActive: true,
  })

  // ===== BOOKING TAG STATE =====
  const [tags, setTags] = useState<BookingTag[]>([])
  const [loadingTags, setLoadingTags] = useState(true)
  const [showTagForm, setShowTagForm] = useState(false)
  const [editingTag, setEditingTag] = useState<BookingTag | null>(null)
  const [tagForm, setTagForm] = useState({
    name: '',
    slug: '',
    color: 'bg-red-500',
  })
  const [customTagColor, setCustomTagColor] = useState('#EF4444')

  // ===== BOOKING PROMO STATE =====
  const [promos, setPromos] = useState<Promo[]>([])
  const [loadingPromos, setLoadingPromos] = useState(true)
  const [showPromoForm, setShowPromoForm] = useState(false)
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null)
  const [allServices, setAllServices] = useState<{ id: string; name: string }[]>([])
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
  const [promoForm, setPromoForm] = useState({
    code: '',
    discount: '',
    startDate: '',
    endDate: '',
    isActive: true,
  })

  // ===== FETCH FUNCTIONS =====
  const fetchServices = async () => {
    try {
      setLoadingServices(true)
      const res = await fetch('/api/admin/services')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setServices(data || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Gagal memuat layanan')
      setServices([])
    } finally {
      setLoadingServices(false)
    }
  }

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true)
      const res = await fetch('/api/admin/booking-categories')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setCategories(data || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Gagal memuat kategori booking')
      setCategories([])
    } finally {
      setLoadingCategories(false)
    }
  }

  const fetchTags = async () => {
    try {
      setLoadingTags(true)
      const res = await fetch('/api/admin/booking-tags')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setTags(data || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Gagal memuat tag booking')
      setTags([])
    } finally {
      setLoadingTags(false)
    }
  }

  const fetchPromos = async () => {
    try {
      setLoadingPromos(true)
      const res = await fetch('/api/admin/booking-promos')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setPromos(data || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Gagal memuat promo booking')
      setPromos([])
    } finally {
      setLoadingPromos(false)
    }
  }

  const fetchAllServices = async () => {
    try {
      const res = await fetch('/api/admin/services?select=true')
      if (!res.ok) {
        setAllServices([])
        return
      }
      const data = await res.json()
      setAllServices(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching services:', error)
      setAllServices([])
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

  useEffect(() => {
    fetchServices()
    fetchCategories()
    fetchTags()
    fetchPromos()
    fetchAllServices()
    fetchMediaFiles()
  }, [])

  // ===== GENERATE SLUG =====
  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').trim()
  }

  // ===== FORMAT CURRENCY =====
  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`
  }

  // ===== GET TAG COLOR =====
  const getTagDisplayColor = (color: string | null) => {
    if (!color) return '#6B7280'
    if (color.startsWith('#')) return color
    const preset = PRESET_COLORS.find(p => p.value === color)
    if (preset) return preset.hex
    return '#6B7280'
  }

  // ===== SERVICE ACTIONS =====
  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!serviceForm.name.trim() || !serviceForm.slug.trim() || !serviceForm.price || parseFloat(serviceForm.price) <= 0) {
      toast.error('Nama, slug, dan harga harus diisi dengan benar')
      return
    }
    if (!serviceForm.categoryId) {
      toast.error('Kategori harus dipilih')
      return
    }
    try {
      const url = editingService ? `/api/admin/services/${editingService.id}` : '/api/admin/services'
      const method = editingService ? 'PUT' : 'POST'
      const payload = {
        ...serviceForm,
        price: parseFloat(serviceForm.price),
        duration: parseInt(serviceForm.duration.toString()),
        imageUrl: serviceForm.imageUrl || null,
        tagIds: serviceForm.tagIds,
        promoIds: serviceForm.promoIds,
      }
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to save')
      }
      toast.success(editingService ? 'Layanan berhasil diupdate!' : 'Layanan berhasil ditambahkan!')
      fetchServices()
      handleServiceCancel()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal menyimpan layanan')
    }
  }

  const handleDeleteService = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus layanan "${name}"?`)) return
    try {
      const res = await fetch(`/api/admin/services/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete')
      }
      toast.success(`Layanan "${name}" berhasil dihapus!`)
      setServices(services.filter(s => s.id !== id))
      setSelectedIds(selectedIds.filter(sid => sid !== id))
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal menghapus layanan')
    }
  }

  const handleEditService = (service: Service) => {
    setEditingService(service)
    setServiceForm({
      name: service.name,
      slug: service.slug,
      description: service.description || '',
      duration: service.duration,
      price: service.price.toString(),
      categoryId: service.categoryId,
      imageUrl: service.imageUrl || '',
      isFeatured: service.isFeatured,
      isActive: service.isActive,
      metaTitle: service.metaTitle || '',
      metaDescription: service.metaDescription || '',
      canonicalUrl: service.canonicalUrl || '',
      ogImageUrl: service.ogImageUrl || '',
      tagIds: service.tags?.map((t: BookingTag) => t.id) || [],
      promoIds: service.promos?.map((p: PromoBooking) => p.promoId) || [],
    })
    setShowServiceForm(true)
  }

  const handleServiceCancel = () => {
    setShowServiceForm(false)
    setEditingService(null)
    setServiceForm({
      name: '',
      slug: '',
      description: '',
      duration: 60,
      price: '',
      categoryId: '',
      imageUrl: '',
      isFeatured: false,
      isActive: true,
      metaTitle: '',
      metaDescription: '',
      canonicalUrl: '',
      ogImageUrl: '',
      tagIds: [],
      promoIds: [],
    })
  }

  const toggleServiceActive = async (id: string, currentStatus: boolean, name: string) => {
    try {
      const service = services.find(s => s.id === id)
      if (!service) return
      const newStatus = !currentStatus
      const res = await fetch(`/api/admin/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...service, isActive: newStatus }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update')
      }
      toast.success(`Layanan "${name}" ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`)
      fetchServices()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal mengubah status')
    }
  }

  const toggleServiceFeatured = async (id: string, currentStatus: boolean, name: string) => {
    try {
      const service = services.find(s => s.id === id)
      if (!service) return
      const newStatus = !currentStatus
      const res = await fetch(`/api/admin/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...service, isFeatured: newStatus }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update')
      }
      toast.success(`Layanan "${name}" ${newStatus ? 'di-featured' : 'di-unfeatured'}`)
      fetchServices()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal mengubah status featured')
    }
  }

  // ===== BULK ACTIONS =====
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.error('Pilih minimal satu layanan')
      return
    }
    if (!confirm(`Yakin ingin menghapus ${selectedIds.length} layanan?`)) return
    try {
      let successCount = 0
      for (const id of selectedIds) {
        const res = await fetch(`/api/admin/services/${id}`, { method: 'DELETE' })
        if (res.ok) successCount++
      }
      if (successCount > 0) {
        toast.success(`${successCount} layanan berhasil dihapus!`)
        setServices(services.filter(s => !selectedIds.includes(s.id)))
        setSelectedIds([])
        setSelectAll(false)
      } else {
        toast.error('Gagal menghapus layanan')
      }
    } catch (error) {
      console.error('Error bulk deleting services:', error)
      toast.error('Error saat menghapus layanan')
    }
  }

  const handleBulkStatus = async (isActive: boolean) => {
    if (selectedIds.length === 0) {
      toast.error('Pilih minimal satu layanan')
      return
    }
    try {
      let successCount = 0
      for (const id of selectedIds) {
        const service = services.find(s => s.id === id)
        if (service) {
          const res = await fetch(`/api/admin/services/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...service, isActive }),
          })
          if (res.ok) successCount++
        }
      }
      if (successCount > 0) {
        toast.success(`${successCount} layanan berhasil diupdate!`)
        fetchServices()
        setSelectedIds([])
        setSelectAll(false)
      } else {
        toast.error('Gagal mengupdate layanan')
      }
    } catch (error) {
      console.error('Error bulk updating services:', error)
      toast.error('Error saat mengupdate layanan')
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
      const url = editingCategory ? `/api/admin/booking-categories/${editingCategory.id}` : '/api/admin/booking-categories'
      const method = editingCategory ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(categoryForm) })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to save')
      }
      toast.success(editingCategory ? 'Kategori booking berhasil diupdate!' : 'Kategori booking berhasil ditambahkan!')
      fetchCategories()
      handleCategoryCancel()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal menyimpan kategori booking')
    }
  }

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus kategori booking "${name}"?`)) return
    try {
      const res = await fetch(`/api/admin/booking-categories/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete')
      }
      toast.success(`Kategori booking "${name}" berhasil dihapus!`)
      setCategories(categories.filter(c => c.id !== id))
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal menghapus kategori booking')
    }
  }

  const handleEditCategory = (category: BookingCategory) => {
    setEditingCategory(category)
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || '📦',
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
      description: '',
      icon: '📦',
      sortOrder: 0,
      isActive: true,
    })
  }

  const toggleCategoryActive = async (id: string, currentStatus: boolean, name: string) => {
    try {
      const category = categories.find(c => c.id === id)
      if (!category) return
      const newStatus = !currentStatus
      const res = await fetch(`/api/admin/booking-categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...category, isActive: newStatus }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update')
      }
      toast.success(`Kategori booking "${name}" ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`)
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
      const url = editingTag ? `/api/admin/booking-tags/${editingTag.id}` : '/api/admin/booking-tags'
      const method = editingTag ? 'PUT' : 'POST'
      const payload = { name: tagForm.name, slug: tagForm.slug, color: tagForm.color }
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (res.ok) {
        toast.success(editingTag ? 'Tag booking berhasil diupdate!' : 'Tag booking berhasil ditambahkan!')
        fetchTags()
        handleTagCancel()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Gagal menyimpan tag booking')
      }
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal menyimpan tag booking')
    }
  }

  const handleDeleteTag = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus tag booking "${name}"?`)) return
    try {
      const res = await fetch(`/api/admin/booking-tags/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success(`Tag booking "${name}" berhasil dihapus!`)
        setTags(tags.filter(t => t.id !== id))
      } else {
        toast.error('Gagal menghapus tag booking')
      }
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal menghapus tag booking')
    }
  }

  const handleEditTag = (tag: BookingTag) => {
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
    if (selectedServiceIds.length === 0) {
      toast.error('Pilih minimal satu layanan')
      return
    }

    try {
      const url = editingPromo ? `/api/admin/booking-promos/${editingPromo.id}` : '/api/admin/booking-promos'
      const method = editingPromo ? 'PUT' : 'POST'
      const payload = {
        code: promoForm.code.toUpperCase(),
        discount: parseFloat(promoForm.discount),
        startDate: promoForm.startDate,
        endDate: promoForm.endDate,
        isActive: promoForm.isActive,
        serviceIds: selectedServiceIds,
      }
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (res.ok) {
        toast.success(editingPromo ? 'Voucher berhasil diupdate!' : 'Voucher berhasil ditambahkan!')
        fetchPromos()
        handlePromoCancel()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Gagal menyimpan voucher')
      }
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal menyimpan voucher')
    }
  }

  const handleDeletePromo = async (id: string, code: string) => {
    if (!confirm(`Yakin ingin menghapus voucher "${code}"?`)) return
    try {
      const res = await fetch(`/api/admin/booking-promos/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success(`Voucher "${code}" berhasil dihapus!`)
        setPromos(promos.filter(p => p.id !== id))
      } else {
        toast.error('Gagal menghapus voucher')
      }
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal menghapus voucher')
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
    setSelectedServiceIds(promo.services?.map((p) => p.serviceId) || [])
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
    setSelectedServiceIds([])
  }

  const togglePromoActive = async (id: string, currentStatus: boolean, code: string) => {
    try {
      const promo = promos.find(p => p.id === id)
      if (!promo) return
      const newStatus = !currentStatus
      const res = await fetch(`/api/admin/booking-promos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...promo, isActive: newStatus }),
      })
      if (res.ok) {
        toast.success(`Voucher "${code}" ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`)
        fetchPromos()
      } else {
        toast.error('Gagal mengubah status voucher')
      }
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal mengubah status voucher')
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

  // ===== FILTERED SERVICES =====
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          service.slug.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !filterCategory || service.categoryId === filterCategory
    return matchesSearch && matchesCategory
  })

  // ===== MEDIA PICKER COMPONENT =====
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
                      setServiceForm({ ...serviceForm, imageUrl: file.url })
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

  if (loadingServices || loadingCategories || loadingTags || loadingPromos) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  // ===== RENDER HEADER BUTTON =====
  const renderHeaderButton = () => {
    switch (activeTab) {
      case 'services':
        return (
          <button
            onClick={() => {
              setEditingService(null)
              setServiceForm({
                name: '',
                slug: '',
                description: '',
                duration: 60,
                price: '',
                categoryId: '',
                imageUrl: '',
                isFeatured: false,
                isActive: true,
                metaTitle: '',
                metaDescription: '',
                canonicalUrl: '',
                ogImageUrl: '',
                tagIds: [],
                promoIds: [],
              })
              setShowServiceForm(!showServiceForm)
            }}
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Plus className="w-5 h-5" /> Add Services
          </button>
        )
      case 'categories':
        return (
          <button
            onClick={() => {
              setEditingCategory(null)
              setCategoryForm({
                name: '',
                slug: '',
                description: '',
                icon: '📦',
                sortOrder: categories.length,
                isActive: true,
              })
              setShowCategoryForm(!showCategoryForm)
            }}
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Plus className="w-5 h-5" /> Add Category
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
            <Plus className="w-5 h-5" /> Add Tag
          </button>
        )
      case 'promos':
        return (
          <button
            onClick={() => {
              setEditingPromo(null)
              setPromoForm({ code: '', discount: '', startDate: '', endDate: '', isActive: true })
              setSelectedServiceIds([])
              setShowPromoForm(!showPromoForm)
            }}
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Plus className="w-5 h-5" /> Add Voucher
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
        <h1 className="text-2xl font-bold text-gray-800">📅 Booking</h1>
        {renderHeaderButton()}
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
        <button onClick={() => setActiveTab('services')} className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'services' ? 'border-pink-500 text-pink-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          <Clock className="w-4 h-4 inline mr-2" /> Layanan ({services.length})
        </button>
        <button onClick={() => setActiveTab('categories')} className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'categories' ? 'border-pink-500 text-pink-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          <Layers className="w-4 h-4 inline mr-2" /> Kategori ({categories.length})
        </button>
        <button onClick={() => setActiveTab('tags')} className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'tags' ? 'border-pink-500 text-pink-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          <Tag className="w-4 h-4 inline mr-2" /> Tags ({tags.length})
        </button>
        <button onClick={() => setActiveTab('promos')} className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'promos' ? 'border-pink-500 text-pink-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          <Ticket className="w-4 h-4 inline mr-2" /> Vouchers ({promos.length})
        </button>
      </div>

      {/* ===== TAB 1: SERVICES ===== */}
      {activeTab === 'services' && (
        <>
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex flex-wrap gap-2 flex-1">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari layanan..."
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
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {selectedIds.length > 0 && (
            <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 mb-4 flex items-center gap-4 flex-wrap">
              <span className="text-sm text-pink-700 font-medium">{selectedIds.length} layanan dipilih</span>
              <button onClick={() => handleBulkStatus(true)} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1"><Check className="w-4 h-4" /> Aktif</button>
              <button onClick={() => handleBulkStatus(false)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1"><X className="w-4 h-4" /> Nonaktif</button>
              <button onClick={handleBulkDelete} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1"><Trash2 className="w-4 h-4" /> Hapus</button>
              <button onClick={() => { setSelectedIds([]); setSelectAll(false) }} className="text-gray-500 hover:text-gray-700 text-sm">Batal</button>
            </div>
          )}

          {showServiceForm && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
              <h2 className="text-lg font-semibold mb-4">{editingService ? 'Edit Layanan' : 'Tambah Layanan'}</h2>
              <form onSubmit={handleServiceSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nama Layanan *</label>
                    <input type="text" required value={serviceForm.name} onChange={(e) => { const name = e.target.value; setServiceForm({ ...serviceForm, name, slug: generateSlug(name) }) }} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400" placeholder="Contoh: Facial Treatment" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Slug *</label>
                    <input type="text" required value={serviceForm.slug} onChange={(e) => setServiceForm({ ...serviceForm, slug: e.target.value.toLowerCase().replace(/ /g, '-') })} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400" placeholder="facial-treatment" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Kategori *</label>
                    <select
                      required
                      value={serviceForm.categoryId}
                      onChange={(e) => setServiceForm({ ...serviceForm, categoryId: e.target.value })}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                    >
                      <option value="">Pilih Kategori</option>
                      {categories.filter(c => c.isActive).map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.icon || '📁'} {cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Durasi (menit) *</label>
                    <input type="number" required min="15" step="15" value={serviceForm.duration} onChange={(e) => setServiceForm({ ...serviceForm, duration: parseInt(e.target.value) || 0 })} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400" placeholder="60" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Harga (Rp) *</label>
                    <input type="number" required min="0" step="1000" value={serviceForm.price} onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400" placeholder="100000" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                  <textarea rows={2} value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400" placeholder="Deskripsi layanan..." />
                </div>

                {/* GAMBAR LAYANAN - MEDIA PICKER */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gambar Layanan</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={serviceForm.imageUrl}
                      onChange={(e) => setServiceForm({ ...serviceForm, imageUrl: e.target.value })}
                      className="flex-1 mt-1 block px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                      placeholder="https://example.com/gambar-layanan.jpg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        fetchMediaFiles()
                        setShowMediaPicker(true)
                      }}
                      className="mt-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <ImageIcon className="w-4 h-4" />
                      Pilih
                    </button>
                  </div>
                  {serviceForm.imageUrl && (
                    <div className="mt-2">
                      <img src={serviceForm.imageUrl} alt="Preview" className="w-20 h-20 object-cover rounded-lg border" />
                    </div>
                  )}
                </div>

                {/* FEATURED TOGGLE */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={serviceForm.isFeatured}
                    onChange={(e) => setServiceForm({ ...serviceForm, isFeatured: e.target.checked })}
                    className="w-4 h-4 text-pink-500 rounded border-gray-300"
                  />
                  <label className="text-sm text-gray-700">
                    <Star className="w-4 h-4 inline mr-1 text-yellow-400" />
                    Featured Service (tampil di halaman utama)
                  </label>
                </div>

                {/* TAGS */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tags</label>
                  <div className="mt-1 grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
                    {tags.length === 0 ? (
                      <p className="text-gray-500 text-sm col-span-full">Belum ada tag. Buat tag dulu di tab Tags.</p>
                    ) : (
                      tags.map((tag) => (
                        <label key={tag.id} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={serviceForm.tagIds.includes(tag.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setServiceForm({ ...serviceForm, tagIds: [...serviceForm.tagIds, tag.id] })
                              } else {
                                setServiceForm({ ...serviceForm, tagIds: serviceForm.tagIds.filter(id => id !== tag.id) })
                              }
                            }}
                            className="w-4 h-4 text-pink-500 rounded border-gray-300"
                          />
                          <span className="truncate">{tag.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Pilih {serviceForm.tagIds.length} tag</p>
                </div>

                {/* PROMOS (VOUCHERS) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Voucher</label>
                  <div className="mt-1 grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
                    {promos.length === 0 ? (
                      <p className="text-gray-500 text-sm col-span-full">Belum ada voucher. Buat voucher dulu di tab Vouchers.</p>
                    ) : (
                      promos.filter(p => p.isActive).map((promo) => (
                        <label key={promo.id} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={serviceForm.promoIds.includes(promo.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setServiceForm({ ...serviceForm, promoIds: [...serviceForm.promoIds, promo.id] })
                              } else {
                                setServiceForm({ ...serviceForm, promoIds: serviceForm.promoIds.filter(id => id !== promo.id) })
                              }
                            }}
                            className="w-4 h-4 text-pink-500 rounded border-gray-300"
                          />
                          <span className="truncate">{promo.code} (Rp {promo.discount.toLocaleString()})</span>
                        </label>
                      ))
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Pilih {serviceForm.promoIds.length} voucher</p>
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={serviceForm.isActive} onChange={(e) => setServiceForm({ ...serviceForm, isActive: e.target.checked })} className="w-4 h-4 text-pink-500 rounded border-gray-300" />
                  <label className="text-sm text-gray-700">Aktif (dapat dipilih customer)</label>
                </div>

                {/* SEO FIELDS */}
                <div className="border-t border-gray-200 pt-3">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">🔍 SEO</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Meta Title</label>
                      <input
                        type="text"
                        value={serviceForm.metaTitle}
                        onChange={(e) => setServiceForm({ ...serviceForm, metaTitle: e.target.value })}
                        className="mt-1 block w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                        placeholder="Judul untuk SEO (max 60 chars)"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Meta Description</label>
                      <textarea
                        rows={2}
                        value={serviceForm.metaDescription}
                        onChange={(e) => setServiceForm({ ...serviceForm, metaDescription: e.target.value })}
                        className="mt-1 block w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                        placeholder="Deskripsi untuk SEO (max 160 chars)"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Canonical URL</label>
                      <input
                        type="text"
                        value={serviceForm.canonicalUrl}
                        onChange={(e) => setServiceForm({ ...serviceForm, canonicalUrl: e.target.value })}
                        className="mt-1 block w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                        placeholder="https://example.com/canonical-url"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">OG Image URL</label>
                      <input
                        type="text"
                        value={serviceForm.ogImageUrl}
                        onChange={(e) => setServiceForm({ ...serviceForm, ogImageUrl: e.target.value })}
                        className="mt-1 block w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                        placeholder="https://example.com/og-image.jpg"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <Save className="w-4 h-4" /> {editingService ? 'Update' : 'Simpan'}
                  </button>
                  <button type="button" onClick={handleServiceCancel} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg">
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left"><input type="checkbox" checked={selectAll} onChange={() => { if (selectAll) { setSelectedIds([]) } else { setSelectedIds(filteredServices.map(s => s.id)) } setSelectAll(!selectAll) }} className="w-4 h-4 text-pink-500 rounded border-gray-300" /></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tags</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Featured</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredServices.length === 0 ? (
                    <tr><td colSpan={10} className="px-6 py-8 text-center text-gray-500">Belum ada layanan</td></tr>
                  ) : (
                    filteredServices.map((service) => {
                      const isChecked = selectedIds.includes(service.id)
                      return (
                        <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4"><input type="checkbox" checked={isChecked} onChange={() => { if (isChecked) { setSelectedIds(selectedIds.filter(id => id !== service.id)) } else { setSelectedIds([...selectedIds, service.id]) } }} className="w-4 h-4 text-pink-500 rounded border-gray-300" /></td>
                          <td className="px-6 py-4">
                            {service.imageUrl ? (
                              <img src={service.imageUrl} alt={service.name} className="w-12 h-12 object-cover rounded-lg" />
                            ) : (
                              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">🧖</div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{service.name}</div>
                            {service.description && <div className="text-xs text-gray-500">{service.description}</div>}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {service.category?.name || '-'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {service.tags && service.tags.length > 0 ? (
                                service.tags.slice(0, 2).map((tag) => (
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
                              {service.tags && service.tags.length > 2 && (
                                <span className="text-xs text-gray-400">+{service.tags.length - 2}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-gray-400" /> {service.duration} menit</span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(service.price)}</td>
                          <td className="px-6 py-4">
                            <button onClick={() => toggleServiceFeatured(service.id, service.isFeatured, service.name)} className={`px-2 py-1 text-xs rounded-full transition-colors ${service.isFeatured ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                              {service.isFeatured ? '⭐ Yes' : 'No'}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <button onClick={() => toggleServiceActive(service.id, service.isActive, service.name)} className={`px-2 py-1 text-xs rounded-full transition-colors ${service.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                              {service.isActive ? '✅ Published' : '📝 Draft'}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => handleEditService(service)} 
                                className="p-1 rounded-lg hover:bg-yellow-50 text-yellow-600 hover:text-yellow-800 transition-colors"
                                title="Edit Layanan"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteService(service.id, service.name)} 
                                className="p-1 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-800 transition-colors"
                                title="Hapus Layanan"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                              <Link 
                                href={`/booking/${service.slug}`} 
                                target="_blank" 
                                className="p-1 rounded-lg hover:bg-blue-50 text-blue-600 hover:text-blue-800 transition-colors"
                                title="Lihat di Frontend"
                              >
                                <Eye className="w-5 h-5" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-between items-center">
              <p className="text-sm text-gray-500">Total: <span className="font-medium text-gray-700">{filteredServices.length}</span> layanan</p>
              <p className="text-sm text-gray-500">Aktif: <span className="font-medium text-green-600">{filteredServices.filter(s => s.isActive).length}</span> | Featured: <span className="font-medium text-yellow-600">{filteredServices.filter(s => s.isFeatured).length}</span></p>
            </div>
          </div>
        </>
      )}

      {/* ===== TAB 2: CATEGORIES ===== */}
      {activeTab === 'categories' && (
        <>
          {showCategoryForm && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
              <h2 className="text-lg font-semibold mb-4">{editingCategory ? 'Edit Kategori Booking' : 'Tambah Kategori Booking'}</h2>
              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700">Nama Kategori *</label><input type="text" required value={categoryForm.name} onChange={(e) => { const name = e.target.value; setCategoryForm({ ...categoryForm, name, slug: generateSlug(name) }) }} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400" placeholder="Contoh: Facial Treatment" /></div>
                  <div><label className="block text-sm font-medium text-gray-700">Slug *</label><input type="text" required value={categoryForm.slug} onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value.toLowerCase().replace(/ /g, '-') })} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400" placeholder="facial-treatment" /></div>
                </div>
                <div><label className="block text-sm font-medium text-gray-700">Deskripsi</label><textarea rows={2} value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400" placeholder="Deskripsi kategori..." /></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700">Icon</label><select value={categoryForm.icon} onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400">{ICON_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}</select></div>
                  <div><label className="block text-sm font-medium text-gray-700">Sort Order</label><input type="number" value={categoryForm.sortOrder} onChange={(e) => setCategoryForm({ ...categoryForm, sortOrder: parseInt(e.target.value) || 0 })} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400" /></div>
                  <div className="flex items-center gap-2 mt-6"><input type="checkbox" checked={categoryForm.isActive} onChange={(e) => setCategoryForm({ ...categoryForm, isActive: e.target.checked })} className="w-4 h-4 text-pink-500 rounded border-gray-300" /><label className="text-sm text-gray-700">Aktif</label></div>
                </div>
                <div className="flex gap-2"><button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Save className="w-4 h-4" /> {editingCategory ? 'Update' : 'Simpan'}</button><button type="button" onClick={handleCategoryCancel} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg">Batal</button></div>
              </form>
            </div>
          )}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Icon</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categories.length === 0 ? (<tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Belum ada kategori booking</td></tr>) : (
                  categories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-2xl">{category.icon || '📦'}</td>
                      <td className="px-6 py-4"><div className="text-sm font-medium text-gray-900">{category.name}</div>{category.description && <div className="text-xs text-gray-500">{category.description}</div>}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{category.slug}</td>
                      <td className="px-6 py-4"><button onClick={() => toggleCategoryActive(category.id, category.isActive, category.name)} className={`px-2 py-1 text-xs rounded-full transition-colors ${category.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{category.isActive ? '✅ Aktif' : '❌ Nonaktif'}</button></td>
                      <td className="px-6 py-4 text-right space-x-2"><button onClick={() => handleEditCategory(category)} className="text-yellow-600 hover:text-yellow-800"><Edit className="w-5 h-5 inline" /></button><button onClick={() => handleDeleteCategory(category.id, category.name)} className="text-red-600 hover:text-red-800"><Trash2 className="w-5 h-5 inline" /></button></td>
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
              <h2 className="text-lg font-semibold mb-4">{editingTag ? 'Edit Tag Booking' : 'Tambah Tag Booking'}</h2>
              <form onSubmit={handleTagSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700">Nama Tag *</label><input type="text" required value={tagForm.name} onChange={(e) => { const name = e.target.value; setTagForm({ ...tagForm, name, slug: generateSlug(name) }) }} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400" placeholder="Contoh: Premium" /></div><div><label className="block text-sm font-medium text-gray-700">Slug *</label><input type="text" required value={tagForm.slug} onChange={(e) => setTagForm({ ...tagForm, slug: e.target.value.toLowerCase().replace(/ /g, '-') })} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400" placeholder="premium" /></div></div>
                <div><label className="block text-sm font-medium text-gray-700">Warna</label><div className="flex flex-wrap gap-2 mb-2">{PRESET_COLORS.map((color) => (<button key={color.value} type="button" onClick={() => handleTagColorSelect(color.value, color.hex)} className={`w-8 h-8 rounded-full border-2 transition-all ${tagForm.color === color.value ? 'border-gray-800 scale-110' : 'border-gray-300 hover:scale-105'}`} style={{ backgroundColor: color.hex }} title={color.label} />))}</div><div className="flex items-center gap-2"><span className="text-sm text-gray-500">Custom:</span><input type="color" value={customTagColor} onChange={(e) => { const hex = e.target.value; setTagForm({ ...tagForm, color: hex }); setCustomTagColor(hex) }} className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer p-1" /></div><div className="mt-2"><span className="text-sm text-gray-500">Preview:</span><span className="ml-2 px-3 py-1 text-xs text-white rounded-full" style={{ backgroundColor: getTagDisplayColor(tagForm.color) }}>{tagForm.name || 'Tag Preview'}</span></div></div>
                <div className="flex gap-2"><button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Save className="w-4 h-4" /> {editingTag ? 'Update' : 'Simpan'}</button><button type="button" onClick={handleTagCancel} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg">Batal</button></div>
              </form>
            </div>
          )}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-200">
              {tags.length === 0 ? (<div className="p-8 text-center text-gray-500">Belum ada tag booking</div>) : (
                tags.map((tag) => {
                  const tagColor = getTagDisplayColor(tag.color)
                  return (
                    <div key={tag.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                      <div className="flex items-center gap-3"><span className="w-4 h-4 rounded-full" style={{ backgroundColor: typeof tagColor === 'string' ? tagColor : '#6B7280' }} /><span className="font-semibold text-gray-800">{tag.name}</span><span className="text-sm text-gray-400">•</span><span className="text-sm text-gray-500">{tag.slug}</span></div>
                      <div className="flex gap-2"><button onClick={() => handleEditTag(tag)} className="text-yellow-600 hover:text-yellow-800"><Edit className="w-5 h-5" /></button><button onClick={() => handleDeleteTag(tag.id, tag.name)} className="text-red-600 hover:text-red-800"><Trash2 className="w-5 h-5" /></button></div>
                    </div>
                  )
                })
              )}
            </div>
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200"><p className="text-sm text-gray-500">Total: <span className="font-medium text-gray-700">{tags.length}</span> tag booking</p></div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Layanan *</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
                    {allServices.length === 0 ? (
                      <p className="text-gray-500 text-sm col-span-full">Tidak ada layanan</p>
                    ) : (
                      allServices.map((s) => (
                        <label key={s.id} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={selectedServiceIds.includes(s.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedServiceIds([...selectedServiceIds, s.id])
                              } else {
                                setSelectedServiceIds(selectedServiceIds.filter(id => id !== s.id))
                              }
                            }}
                            className="w-4 h-4 text-pink-500 rounded border-gray-300"
                          />
                          <span className="truncate">{s.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Pilih {selectedServiceIds.length} layanan</p>
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
                            <span>{promo.services?.length || 0} layanan</span>
                            <span>Mulai: {new Date(promo.startDate).toLocaleDateString()}</span>
                            <span>Selesai: {new Date(promo.endDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => togglePromoActive(promo.id, promo.isActive, promo.code)} className={`px-2 py-1 text-xs rounded-full transition-colors ${promo.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
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

      {/* ===== MEDIA PICKER MODAL ===== */}
      {showMediaPicker && <MediaPicker />}
    </div>
  )
}