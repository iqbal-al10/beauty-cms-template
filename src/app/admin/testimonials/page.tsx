'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Image as ImageIcon, Star, Layers, X, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

interface Testimonial {
  id: string
  customerName: string
  customerPhotoUrl: string | null
  rating: number
  reviewText: string
  isPublished: boolean
  sortOrder: number
  beforeAfterId: string | null
  beforeAfter?: BeforeAfter | null
}

interface BeforeAfter {
  id: string
  title: string
  category: string
  beforeImageUrl: string
  afterImageUrl: string
  description: string | null
  sortOrder: number
  isPublished: boolean
}

interface Category {
  id: string
  name: string
}

interface MediaFile {
  id: string
  url: string
  fileName: string
  folder: string | null
}

type TabType = 'testimonials' | 'beforeafter'

export default function TestimonialsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('testimonials')
  
  // ===== MEDIA PICKER STATE =====
  const [showMediaPicker, setShowMediaPicker] = useState(false)
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [mediaSearch, setMediaSearch] = useState('')
  const [mediaLoading, setMediaLoading] = useState(false)
  const [mediaTarget, setMediaTarget] = useState<'customerPhoto' | 'beforeImage' | 'afterImage' | null>(null)

  // ===== TESTIMONIALS STATE =====
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loadingTestimonials, setLoadingTestimonials] = useState(true)
  const [showTestimonialForm, setShowTestimonialForm] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [beforeAfterList, setBeforeAfterList] = useState<BeforeAfter[]>([])
  const [testimonialForm, setTestimonialForm] = useState({
    customerName: '',
    customerPhotoUrl: '',
    rating: 5,
    reviewText: '',
    isPublished: true,
    sortOrder: 0,
    beforeAfterId: '',
  })

  // ===== BEFORE/AFTER STATE =====
  const [beforeAfterItems, setBeforeAfterItems] = useState<BeforeAfter[]>([])
  const [loadingBeforeAfter, setLoadingBeforeAfter] = useState(true)
  const [showBeforeAfterForm, setShowBeforeAfterForm] = useState(false)
  const [editingBeforeAfter, setEditingBeforeAfter] = useState<BeforeAfter | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [beforeAfterForm, setBeforeAfterForm] = useState({
    title: '',
    category: '',
    beforeImageUrl: '',
    afterImageUrl: '',
    description: '',
    sortOrder: 0,
    isPublished: true,
  })

  // ===== FETCH FUNCTIONS =====
  const fetchTestimonials = async () => {
    try {
      setLoadingTestimonials(true)
      const res = await fetch('/api/admin/testimonials')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setTestimonials(data || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Gagal memuat testimonials')
      setTestimonials([])
    } finally {
      setLoadingTestimonials(false)
    }
  }

  const fetchBeforeAfter = async () => {
    try {
      setLoadingBeforeAfter(true)
      const res = await fetch('/api/admin/before-after')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setBeforeAfterItems(data || [])
      setBeforeAfterList(data || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Gagal memuat before-after')
      setBeforeAfterItems([])
      setBeforeAfterList([])
    } finally {
      setLoadingBeforeAfter(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const [productsRes, bookingsRes] = await Promise.all([
        fetch('/api/admin/categories?all=true'),
        fetch('/api/admin/booking-categories?all=true'),
      ])

      let allCategories: { id: string; name: string }[] = []

      if (productsRes.ok) {
        const data = await productsRes.json()
        allCategories = [...allCategories, ...(data || []).map((c: any) => ({ id: `product-${c.id}`, name: c.name }))]
      }

      if (bookingsRes.ok) {
        const data = await bookingsRes.json()
        allCategories = [...allCategories, ...(data || []).map((c: any) => ({ id: `booking-${c.id}`, name: c.name }))]
      }

      setCategories(allCategories)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchMediaFiles = async () => {
    try {
      setMediaLoading(true)
      const res = await fetch('/api/admin/media?limit=50')
      if (res.ok) {
        const data = await res.json()
        setMediaFiles(data || [])
      }
    } catch (error) {
      console.error('Error fetching media files:', error)
    } finally {
      setMediaLoading(false)
    }
  }

  useEffect(() => {
    fetchTestimonials()
    fetchBeforeAfter()
    fetchCategories()
    fetchMediaFiles()
  }, [])

  // ===== RENDER STARS =====
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

  // ===== TESTIMONIAL ACTIONS =====
  const handleTestimonialSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!testimonialForm.customerName.trim() || !testimonialForm.reviewText.trim() || !testimonialForm.rating) {
      toast.error('Customer name, rating, dan review text harus diisi')
      return
    }

    try {
      const url = editingTestimonial ? `/api/admin/testimonials/${editingTestimonial.id}` : '/api/admin/testimonials'
      const method = editingTestimonial ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testimonialForm),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to save')
      }

      toast.success(editingTestimonial ? 'Testimonial berhasil diupdate!' : 'Testimonial berhasil ditambahkan!')
      fetchTestimonials()
      handleTestimonialCancel()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal menyimpan testimonial')
    }
  }

  const handleDeleteTestimonial = async (id: string, customerName: string) => {
    if (!confirm(`Yakin ingin menghapus testimonial dari "${customerName}"?`)) return

    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete')
      }
      toast.success(`Testimonial dari "${customerName}" berhasil dihapus!`)
      setTestimonials(testimonials.filter(t => t.id !== id))
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal menghapus testimonial')
    }
  }

  const handleEditTestimonial = (item: Testimonial) => {
    setEditingTestimonial(item)
    setTestimonialForm({
      customerName: item.customerName,
      customerPhotoUrl: item.customerPhotoUrl || '',
      rating: item.rating,
      reviewText: item.reviewText,
      isPublished: item.isPublished,
      sortOrder: item.sortOrder,
      beforeAfterId: item.beforeAfterId || '',
    })
    setShowTestimonialForm(true)
  }

  const handleTestimonialCancel = () => {
    setShowTestimonialForm(false)
    setEditingTestimonial(null)
    setTestimonialForm({
      customerName: '',
      customerPhotoUrl: '',
      rating: 5,
      reviewText: '',
      isPublished: true,
      sortOrder: 0,
      beforeAfterId: '',
    })
  }

  const toggleTestimonialPublish = async (id: string, currentStatus: boolean, customerName: string) => {
    try {
      const testimonial = testimonials.find(t => t.id === id)
      if (!testimonial) return
      const newStatus = !currentStatus

      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...testimonial, isPublished: newStatus }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update')
      }

      toast.success(`Testimonial dari "${customerName}" ${newStatus ? 'dipublikasikan' : 'di-draft'}`)
      fetchTestimonials()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal mengubah status')
    }
  }

  const handleViewTestimonial = (item: Testimonial) => {
    if (!item.isPublished) {
      toast.error(`Testimonial dari "${item.customerName}" masih berstatus DRAFT. Publikasikan terlebih dahulu untuk dilihat.`)
      return
    }
    const slug = item.customerName.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '')
    window.open(`/testimonials/${slug}`, '_blank')
  }

  // ===== BEFORE/AFTER ACTIONS =====
  const handleBeforeAfterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!beforeAfterForm.title.trim() || !beforeAfterForm.beforeImageUrl.trim() || !beforeAfterForm.afterImageUrl.trim()) {
      toast.error('Title, Before Image, dan After Image harus diisi')
      return
    }

    try {
      const url = editingBeforeAfter ? `/api/admin/before-after/${editingBeforeAfter.id}` : '/api/admin/before-after'
      const method = editingBeforeAfter ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(beforeAfterForm),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to save')
      }

      toast.success(editingBeforeAfter ? 'Before/After berhasil diupdate!' : 'Before/After berhasil ditambahkan!')
      fetchBeforeAfter()
      handleBeforeAfterCancel()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal menyimpan before/after')
    }
  }

  const handleDeleteBeforeAfter = async (id: string, title: string) => {
    if (!confirm(`Yakin ingin menghapus item "${title}"?`)) return

    try {
      const res = await fetch(`/api/admin/before-after/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete')
      }
      toast.success(`Item "${title}" berhasil dihapus!`)
      setBeforeAfterItems(beforeAfterItems.filter(item => item.id !== id))
      setBeforeAfterList(beforeAfterList.filter(item => item.id !== id))
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal menghapus item')
    }
  }

  const handleEditBeforeAfter = (item: BeforeAfter) => {
    setEditingBeforeAfter(item)
    setBeforeAfterForm({
      title: item.title,
      category: item.category,
      beforeImageUrl: item.beforeImageUrl,
      afterImageUrl: item.afterImageUrl,
      description: item.description || '',
      sortOrder: item.sortOrder,
      isPublished: item.isPublished,
    })
    setShowBeforeAfterForm(true)
  }

  const handleBeforeAfterCancel = () => {
    setShowBeforeAfterForm(false)
    setEditingBeforeAfter(null)
    setBeforeAfterForm({
      title: '',
      category: '',
      beforeImageUrl: '',
      afterImageUrl: '',
      description: '',
      sortOrder: 0,
      isPublished: true,
    })
  }

  const toggleBeforeAfterPublish = async (id: string, currentStatus: boolean, title: string) => {
    try {
      const item = beforeAfterItems.find(i => i.id === id)
      if (!item) return
      const newStatus = !currentStatus

      const res = await fetch(`/api/admin/before-after/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, isPublished: newStatus }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update')
      }

      toast.success(`Item "${title}" ${newStatus ? 'dipublikasikan' : 'di-draft'}`)
      fetchBeforeAfter()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal mengubah status')
    }
  }

  // ===== MEDIA PICKER =====
  const MediaPicker = () => {
    const filteredMedia = mediaFiles.filter(file => 
      file.fileName.toLowerCase().includes(mediaSearch.toLowerCase())
    )

    const handleSelectImage = (url: string) => {
      if (mediaTarget === 'customerPhoto') {
        setTestimonialForm(prev => ({ ...prev, customerPhotoUrl: url }))
      } else if (mediaTarget === 'beforeImage') {
        setBeforeAfterForm(prev => ({ ...prev, beforeImageUrl: url }))
      } else if (mediaTarget === 'afterImage') {
        setBeforeAfterForm(prev => ({ ...prev, afterImageUrl: url }))
      }
      setShowMediaPicker(false)
      toast.success('Gambar berhasil dipilih!')
    }

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
              value={mediaSearch}
              onChange={(e) => setMediaSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
            />
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {mediaLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
              </div>
            ) : filteredMedia.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Belum ada gambar di media</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {filteredMedia.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => handleSelectImage(file.url)}
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
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t text-sm text-gray-500">
            Total: {filteredMedia.length} gambar
          </div>
        </div>
      </div>
    )
  }

  if (loadingTestimonials || loadingBeforeAfter) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <div>
      {/* ===== HEADER WITH ICON ===== */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Star className="w-6 h-6 text-pink-500" />
          Testimonials
        </h1>
        {activeTab === 'testimonials' && (
          <button
            onClick={() => {
              setEditingTestimonial(null)
              setTestimonialForm({
                customerName: '',
                customerPhotoUrl: '',
                rating: 5,
                reviewText: '',
                isPublished: true,
                sortOrder: testimonials.length,
                beforeAfterId: '',
              })
              setShowTestimonialForm(!showTestimonialForm)
            }}
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Add Testimonial
          </button>
        )}
        {activeTab === 'beforeafter' && (
          <button
            onClick={() => {
              setEditingBeforeAfter(null)
              setBeforeAfterForm({
                title: '',
                category: '',
                beforeImageUrl: '',
                afterImageUrl: '',
                description: '',
                sortOrder: beforeAfterItems.length,
                isPublished: true,
              })
              setShowBeforeAfterForm(!showBeforeAfterForm)
            }}
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Add Before/After
          </button>
        )}
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('testimonials')}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'testimonials'
              ? 'border-pink-500 text-pink-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Star className="w-4 h-4 inline mr-2" /> Testimonials ({testimonials.length})
        </button>
        <button
          onClick={() => setActiveTab('beforeafter')}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'beforeafter'
              ? 'border-pink-500 text-pink-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Layers className="w-4 h-4 inline mr-2" /> Before/After ({beforeAfterItems.length})
        </button>
      </div>

      {/* ===== TAB 1: TESTIMONIALS ===== */}
      {activeTab === 'testimonials' && (
        <>
          {showTestimonialForm && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
              <h2 className="text-lg font-semibold mb-4">
                {editingTestimonial ? 'Edit Testimonial' : 'New Testimonial'}
              </h2>
              <form onSubmit={handleTestimonialSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Customer Name *</label>
                    <input
                      type="text"
                      required
                      value={testimonialForm.customerName}
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, customerName: e.target.value })}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                      placeholder="Customer name..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Customer Photo</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={testimonialForm.customerPhotoUrl}
                        onChange={(e) => setTestimonialForm({ ...testimonialForm, customerPhotoUrl: e.target.value })}
                        className="flex-1 mt-1 block px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                        placeholder="https://example.com/photo.jpg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          fetchMediaFiles()
                          setMediaTarget('customerPhoto')
                          setShowMediaPicker(true)
                        }}
                        className="mt-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center gap-2"
                      >
                        <ImageIcon className="w-4 h-4" />
                        Pilih
                      </button>
                    </div>
                    {testimonialForm.customerPhotoUrl && (
                      <div className="mt-2">
                        <img src={testimonialForm.customerPhotoUrl} alt="Preview" className="w-16 h-16 object-cover rounded-full border" />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Rating *</label>
                  <div className="flex gap-2 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setTestimonialForm({ ...testimonialForm, rating: star })}
                        className={`text-3xl transition-colors ${
                          star <= testimonialForm.rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="text-sm text-gray-500 ml-2 mt-1">{testimonialForm.rating}/5</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Review Text *</label>
                  <textarea
                    rows={3}
                    required
                    value={testimonialForm.reviewText}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, reviewText: e.target.value })}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                    placeholder="Customer review..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Before/After (optional)</label>
                  <select
                    value={testimonialForm.beforeAfterId}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, beforeAfterId: e.target.value })}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                  >
                    <option value="">None</option>
                    {beforeAfterList.filter(item => item.isPublished).map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.title} ({item.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sort Order</label>
                    <input
                      type="number"
                      value={testimonialForm.sortOrder}
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, sortOrder: parseInt(e.target.value) || 0 })}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-6">
                    <input
                      type="checkbox"
                      checked={testimonialForm.isPublished}
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, isPublished: e.target.checked })}
                      className="w-4 h-4 text-pink-500 rounded border-gray-300"
                    />
                    <label className="text-sm text-gray-700">Published</label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg">
                    {editingTestimonial ? 'Update' : 'Save'}
                  </button>
                  <button type="button" onClick={handleTestimonialCancel} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ===== TABLE TESTIMONIALS ===== */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Review</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Before/After</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {testimonials.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        No testimonials found
                      </td>
                    </tr>
                  ) : (
                    testimonials.map((item, index) => {
                      const slug = item.customerName.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '')
                      return (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {item.customerPhotoUrl ? (
                                <img src={item.customerPhotoUrl} alt={item.customerName} className="w-8 h-8 object-cover rounded-full border" />
                              ) : (
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                                  {item.customerName.charAt(0)}
                                </div>
                              )}
                              <span className="font-medium text-gray-900 text-sm">{item.customerName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex">{renderStars(item.rating)}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600 line-clamp-2 max-w-[200px]">
                              {item.reviewText}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {item.beforeAfter ? (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
                                {item.beforeAfter.title}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => toggleTestimonialPublish(item.id, item.isPublished, item.customerName)}
                              className={`px-2 py-1 text-xs rounded-full transition-colors ${
                                item.isPublished
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {item.isPublished ? '✅ Published' : '📝 Draft'}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button
                              onClick={() => handleViewTestimonial(item)}
                              className={`transition-colors ${
                                item.isPublished
                                  ? 'text-blue-600 hover:text-blue-800'
                                  : 'text-gray-400 cursor-not-allowed'
                              }`}
                              disabled={!item.isPublished}
                              title={!item.isPublished ? 'Testimonial masih draft' : 'Lihat di frontend'}
                            >
                              <Eye className="w-5 h-5 inline" />
                            </button>
                            <button
                              onClick={() => handleEditTestimonial(item)}
                              className="text-yellow-600 hover:text-yellow-800"
                              title="Edit"
                            >
                              <Edit className="w-5 h-5 inline" />
                            </button>
                            <button
                              onClick={() => handleDeleteTestimonial(item.id, item.customerName)}
                              className="text-red-600 hover:text-red-800"
                              title="Hapus"
                            >
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

            {/* ===== STATISTICS FOOTER ===== */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-between items-center flex-wrap gap-2">
              <p className="text-sm text-gray-500">
                Total: <span className="font-medium text-gray-700">{testimonials.length}</span> testimonials
              </p>
              <div className="flex gap-4 text-sm text-gray-500">
                <span>
                  Published: <span className="font-medium text-green-600">
                    {testimonials.filter(t => t.isPublished).length}
                  </span>
                </span>
                <span>
                  Draft: <span className="font-medium text-gray-600">
                    {testimonials.filter(t => !t.isPublished).length}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ===== TAB 2: BEFORE/AFTER ===== */}
      {activeTab === 'beforeafter' && (
        <>
          {showBeforeAfterForm && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
              <h2 className="text-lg font-semibold mb-4">
                {editingBeforeAfter ? 'Edit Before/After' : 'New Before/After'}
              </h2>
              <form onSubmit={handleBeforeAfterSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title *</label>
                    <input
                      type="text"
                      required
                      value={beforeAfterForm.title}
                      onChange={(e) => setBeforeAfterForm({ ...beforeAfterForm, title: e.target.value })}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                      placeholder="e.g., Acne Treatment Result"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                      value={beforeAfterForm.category}
                      onChange={(e) => setBeforeAfterForm({ ...beforeAfterForm, category: e.target.value })}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Before Image *</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={beforeAfterForm.beforeImageUrl}
                        onChange={(e) => setBeforeAfterForm({ ...beforeAfterForm, beforeImageUrl: e.target.value })}
                        className="flex-1 mt-1 block px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                        placeholder="https://example.com/before.jpg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          fetchMediaFiles()
                          setMediaTarget('beforeImage')
                          setShowMediaPicker(true)
                        }}
                        className="mt-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center gap-2"
                      >
                        <ImageIcon className="w-4 h-4" />
                        Pilih
                      </button>
                    </div>
                    {beforeAfterForm.beforeImageUrl && (
                      <div className="mt-2">
                        <img src={beforeAfterForm.beforeImageUrl} alt="Before preview" className="w-20 h-20 object-cover rounded-lg border" />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">After Image *</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={beforeAfterForm.afterImageUrl}
                        onChange={(e) => setBeforeAfterForm({ ...beforeAfterForm, afterImageUrl: e.target.value })}
                        className="flex-1 mt-1 block px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                        placeholder="https://example.com/after.jpg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          fetchMediaFiles()
                          setMediaTarget('afterImage')
                          setShowMediaPicker(true)
                        }}
                        className="mt-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center gap-2"
                      >
                        <ImageIcon className="w-4 h-4" />
                        Pilih
                      </button>
                    </div>
                    {beforeAfterForm.afterImageUrl && (
                      <div className="mt-2">
                        <img src={beforeAfterForm.afterImageUrl} alt="After preview" className="w-20 h-20 object-cover rounded-lg border" />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    rows={2}
                    value={beforeAfterForm.description}
                    onChange={(e) => setBeforeAfterForm({ ...beforeAfterForm, description: e.target.value })}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                    placeholder="Brief description..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sort Order</label>
                    <input
                      type="number"
                      value={beforeAfterForm.sortOrder}
                      onChange={(e) => setBeforeAfterForm({ ...beforeAfterForm, sortOrder: parseInt(e.target.value) || 0 })}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-6">
                    <input
                      type="checkbox"
                      checked={beforeAfterForm.isPublished}
                      onChange={(e) => setBeforeAfterForm({ ...beforeAfterForm, isPublished: e.target.checked })}
                      className="w-4 h-4 text-pink-500 rounded border-gray-300"
                    />
                    <label className="text-sm text-gray-700">Published</label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg">
                    {editingBeforeAfter ? 'Update' : 'Save'}
                  </button>
                  <button type="button" onClick={handleBeforeAfterCancel} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-200">
              {beforeAfterItems.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No before/after items found</div>
              ) : (
                beforeAfterItems.map((item) => (
                  <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex gap-2 flex-shrink-0">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden relative">
                          {item.beforeImageUrl ? (
                            <img src={item.beforeImageUrl} alt="Before" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <span className="absolute bottom-0 left-0 right-0 text-[8px] bg-black/50 text-white text-center">Before</span>
                        </div>
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden relative">
                          {item.afterImageUrl ? (
                            <img src={item.afterImageUrl} alt="After" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <span className="absolute bottom-0 left-0 right-0 text-[8px] bg-black/50 text-white text-center">After</span>
                        </div>
                      </div>

                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{item.title}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span className="px-2 py-0.5 bg-gray-100 rounded">{item.category}</span>
                          {item.description && <span>{item.description}</span>}
                          <span className="text-xs text-gray-400">Order: {item.sortOrder}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => toggleBeforeAfterPublish(item.id, item.isPublished, item.title)}
                          className={`px-2 py-1 text-xs rounded-full transition-colors ${
                            item.isPublished
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {item.isPublished ? '✅ Published' : '📝 Draft'}
                        </button>
                        <div className="flex gap-2">
                          <button onClick={() => handleEditBeforeAfter(item)} className="text-yellow-600 hover:text-yellow-800" title="Edit">
                            <Edit className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleDeleteBeforeAfter(item.id, item.title)} className="text-red-600 hover:text-red-800" title="Hapus">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
              <p className="text-sm text-gray-500">Total: <span className="font-medium text-gray-700">{beforeAfterItems.length}</span> items</p>
            </div>
          </div>
        </>
      )}

      {/* ===== MEDIA PICKER MODAL ===== */}
      {showMediaPicker && <MediaPicker />}
    </div>
  )
}