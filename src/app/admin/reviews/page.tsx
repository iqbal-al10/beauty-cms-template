'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Star, Package, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
}

interface Service {
  id: string
  name: string
}

interface ProductReview {
  id: string
  productId: string
  customerName: string
  rating: number
  comment: string | null
  isPublished: boolean
  createdAt: string
  product: {
    id: string
    name: string
  }
}

interface ServiceReview {
  id: string
  serviceId: string
  customerName: string
  rating: number
  comment: string | null
  isPublished: boolean
  createdAt: string
  service: {
    id: string
    name: string
  }
}

type TabType = 'product' | 'service'

export default function ReviewsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('product')
  
  // Product Reviews
  const [productReviews, setProductReviews] = useState<ProductReview[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProductReviews, setLoadingProductReviews] = useState(true)
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductReview | null>(null)
  const [productForm, setProductForm] = useState({
    productId: '',
    customerName: '',
    rating: 5,
    comment: '',
    isPublished: true,
  })

  // Service Reviews
  const [serviceReviews, setServiceReviews] = useState<ServiceReview[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loadingServiceReviews, setLoadingServiceReviews] = useState(true)
  const [showServiceForm, setShowServiceForm] = useState(false)
  const [editingService, setEditingService] = useState<ServiceReview | null>(null)
  const [serviceForm, setServiceForm] = useState({
    serviceId: '',
    customerName: '',
    rating: 5,
    comment: '',
    isPublished: true,
  })

  // Fetch Product Reviews
  const fetchProductReviews = async () => {
    try {
      setLoadingProductReviews(true)
      const res = await fetch('/api/admin/reviews')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setProductReviews(data || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Gagal memuat review produk')
      setProductReviews([])
    } finally {
      setLoadingProductReviews(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products?all=true&select=true')
      if (!res.ok) {
        setProducts([])
        return
      }
      const data = await res.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    }
  }

  // Fetch Service Reviews
  const fetchServiceReviews = async () => {
    try {
      setLoadingServiceReviews(true)
      const res = await fetch('/api/admin/service-reviews')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setServiceReviews(data || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Gagal memuat review layanan')
      setServiceReviews([])
    } finally {
      setLoadingServiceReviews(false)
    }
  }

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/admin/services?select=true')
      if (!res.ok) {
        setServices([])
        return
      }
      const data = await res.json()
      setServices(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching services:', error)
      setServices([])
    }
  }

  useEffect(() => {
    fetchProductReviews()
    fetchProducts()
    fetchServiceReviews()
    fetchServices()
  }, [])

  // ===== PRODUCT REVIEW ACTIONS =====
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!productForm.productId || !productForm.customerName.trim() || !productForm.rating) {
      toast.error('Product, customer name, dan rating harus diisi')
      return
    }

    try {
      const url = editingProduct ? `/api/admin/reviews/${editingProduct.id}` : '/api/admin/reviews'
      const method = editingProduct ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productForm),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to save')
      }

      toast.success(editingProduct ? 'Review produk berhasil diupdate!' : 'Review produk berhasil ditambahkan!')
      fetchProductReviews()
      handleProductCancel()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal menyimpan review produk')
    }
  }

  const handleDeleteProduct = async (id: string, customerName: string) => {
    if (!confirm(`Yakin ingin menghapus review dari "${customerName}"?`)) return

    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete')
      }
      toast.success(`Review dari "${customerName}" berhasil dihapus!`)
      setProductReviews(productReviews.filter(r => r.id !== id))
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal menghapus review produk')
    }
  }

  const handleEditProduct = (review: ProductReview) => {
    setEditingProduct(review)
    setProductForm({
      productId: review.productId,
      customerName: review.customerName,
      rating: review.rating,
      comment: review.comment || '',
      isPublished: review.isPublished,
    })
    setShowProductForm(true)
  }

  const handleProductCancel = () => {
    setShowProductForm(false)
    setEditingProduct(null)
    setProductForm({
      productId: '',
      customerName: '',
      rating: 5,
      comment: '',
      isPublished: true,
    })
  }

  const toggleProductPublish = async (id: string, currentStatus: boolean, customerName: string) => {
    try {
      const review = productReviews.find(r => r.id === id)
      if (!review) return
      const newStatus = !currentStatus

      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...review, isPublished: newStatus }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update')
      }

      toast.success(`Review dari "${customerName}" ${newStatus ? 'dipublikasikan' : 'di-draft'}`)
      fetchProductReviews()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal mengubah status')
    }
  }

  // ===== SERVICE REVIEW ACTIONS =====
  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!serviceForm.serviceId || !serviceForm.customerName.trim() || !serviceForm.rating) {
      toast.error('Service, customer name, dan rating harus diisi')
      return
    }

    try {
      const url = editingService ? `/api/admin/service-reviews/${editingService.id}` : '/api/admin/service-reviews'
      const method = editingService ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceForm),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to save')
      }

      toast.success(editingService ? 'Review layanan berhasil diupdate!' : 'Review layanan berhasil ditambahkan!')
      fetchServiceReviews()
      handleServiceCancel()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal menyimpan review layanan')
    }
  }

  const handleDeleteService = async (id: string, customerName: string) => {
    if (!confirm(`Yakin ingin menghapus review dari "${customerName}"?`)) return

    try {
      const res = await fetch(`/api/admin/service-reviews/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete')
      }
      toast.success(`Review dari "${customerName}" berhasil dihapus!`)
      setServiceReviews(serviceReviews.filter(r => r.id !== id))
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal menghapus review layanan')
    }
  }

  const handleEditService = (review: ServiceReview) => {
    setEditingService(review)
    setServiceForm({
      serviceId: review.serviceId,
      customerName: review.customerName,
      rating: review.rating,
      comment: review.comment || '',
      isPublished: review.isPublished,
    })
    setShowServiceForm(true)
  }

  const handleServiceCancel = () => {
    setShowServiceForm(false)
    setEditingService(null)
    setServiceForm({
      serviceId: '',
      customerName: '',
      rating: 5,
      comment: '',
      isPublished: true,
    })
  }

  const toggleServicePublish = async (id: string, currentStatus: boolean, customerName: string) => {
    try {
      const review = serviceReviews.find(r => r.id === id)
      if (!review) return
      const newStatus = !currentStatus

      const res = await fetch(`/api/admin/service-reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...review, isPublished: newStatus }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update')
      }

      toast.success(`Review dari "${customerName}" ${newStatus ? 'dipublikasikan' : 'di-draft'}`)
      fetchServiceReviews()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal mengubah status')
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

  if (loadingProductReviews || loadingServiceReviews) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Reviews</h1>
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('product')}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'product'
              ? 'border-pink-500 text-pink-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Package className="w-4 h-4 inline mr-2" />
          Product Reviews ({productReviews.length})
        </button>
        <button
          onClick={() => setActiveTab('service')}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'service'
              ? 'border-pink-500 text-pink-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Calendar className="w-4 h-4 inline mr-2" />
          Service Reviews ({serviceReviews.length})
        </button>
      </div>

      {/* ===== TAB 1: PRODUCT REVIEWS ===== */}
      {activeTab === 'product' && (
        <>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => {
                setEditingProduct(null)
                setProductForm({
                  productId: '',
                  customerName: '',
                  rating: 5,
                  comment: '',
                  isPublished: true,
                })
                setShowProductForm(!showProductForm)
              }}
              className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Review
            </button>
          </div>

          {showProductForm && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
              <h2 className="text-lg font-semibold mb-4">
                {editingProduct ? 'Edit Product Review' : 'New Product Review'}
              </h2>
              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Product *</label>
                    <select
                      required
                      value={productForm.productId}
                      onChange={(e) => setProductForm({ ...productForm, productId: e.target.value })}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                    >
                      <option value="">Select Product</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Customer Name *</label>
                    <input
                      type="text"
                      required
                      value={productForm.customerName}
                      onChange={(e) => setProductForm({ ...productForm, customerName: e.target.value })}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                      placeholder="Customer name..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Rating *</label>
                  <div className="flex gap-2 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setProductForm({ ...productForm, rating: star })}
                        className={`text-3xl transition-colors ${
                          star <= productForm.rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="text-sm text-gray-500 ml-2 mt-1">{productForm.rating}/5</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Comment</label>
                  <textarea
                    rows={3}
                    value={productForm.comment}
                    onChange={(e) => setProductForm({ ...productForm, comment: e.target.value })}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                    placeholder="Customer review..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={productForm.isPublished}
                    onChange={(e) => setProductForm({ ...productForm, isPublished: e.target.checked })}
                    className="w-4 h-4 text-pink-500 rounded border-gray-300"
                  />
                  <label className="text-sm text-gray-700">Published</label>
                </div>

                <div className="flex gap-2">
                  <button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg">
                    {editingProduct ? 'Update' : 'Save'}
                  </button>
                  <button type="button" onClick={handleProductCancel} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-200">
              {productReviews.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No product reviews found</div>
              ) : (
                productReviews.map((review) => (
                  <div key={review.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="flex">{renderStars(review.rating)}</div>
                          <h3 className="font-semibold text-gray-800">{review.customerName}</h3>
                          <span className="text-sm text-gray-400">•</span>
                          <span className="text-sm text-gray-500">{review.product?.name || 'Unknown'}</span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{review.comment}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(review.createdAt).toLocaleDateString('id-ID')}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => toggleProductPublish(review.id, review.isPublished, review.customerName)}
                          className={`px-2 py-1 text-xs rounded-full transition-colors ${
                            review.isPublished
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {review.isPublished ? '✅ Published' : '📝 Draft'}
                        </button>
                        <div className="flex gap-2">
                          <button onClick={() => handleEditProduct(review)} className="text-yellow-600 hover:text-yellow-800" title="Edit">
                            <Edit className="w-5 h-5 inline" />
                          </button>
                          <button onClick={() => handleDeleteProduct(review.id, review.customerName)} className="text-red-600 hover:text-red-800" title="Hapus">
                            <Trash2 className="w-5 h-5 inline" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
              <p className="text-sm text-gray-500">Total: <span className="font-medium text-gray-700">{productReviews.length}</span> product reviews</p>
            </div>
          </div>
        </>
      )}

      {/* ===== TAB 2: SERVICE REVIEWS ===== */}
      {activeTab === 'service' && (
        <>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => {
                setEditingService(null)
                setServiceForm({
                  serviceId: '',
                  customerName: '',
                  rating: 5,
                  comment: '',
                  isPublished: true,
                })
                setShowServiceForm(!showServiceForm)
              }}
              className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Review
            </button>
          </div>

          {showServiceForm && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
              <h2 className="text-lg font-semibold mb-4">
                {editingService ? 'Edit Service Review' : 'New Service Review'}
              </h2>
              <form onSubmit={handleServiceSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Service *</label>
                    <select
                      required
                      value={serviceForm.serviceId}
                      onChange={(e) => setServiceForm({ ...serviceForm, serviceId: e.target.value })}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                    >
                      <option value="">Select Service</option>
                      {services.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Customer Name *</label>
                    <input
                      type="text"
                      required
                      value={serviceForm.customerName}
                      onChange={(e) => setServiceForm({ ...serviceForm, customerName: e.target.value })}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                      placeholder="Customer name..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Rating *</label>
                  <div className="flex gap-2 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setServiceForm({ ...serviceForm, rating: star })}
                        className={`text-3xl transition-colors ${
                          star <= serviceForm.rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="text-sm text-gray-500 ml-2 mt-1">{serviceForm.rating}/5</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Comment</label>
                  <textarea
                    rows={3}
                    value={serviceForm.comment}
                    onChange={(e) => setServiceForm({ ...serviceForm, comment: e.target.value })}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                    placeholder="Customer review..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={serviceForm.isPublished}
                    onChange={(e) => setServiceForm({ ...serviceForm, isPublished: e.target.checked })}
                    className="w-4 h-4 text-pink-500 rounded border-gray-300"
                  />
                  <label className="text-sm text-gray-700">Published</label>
                </div>

                <div className="flex gap-2">
                  <button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg">
                    {editingService ? 'Update' : 'Save'}
                  </button>
                  <button type="button" onClick={handleServiceCancel} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-200">
              {serviceReviews.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No service reviews found</div>
              ) : (
                serviceReviews.map((review) => (
                  <div key={review.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="flex">{renderStars(review.rating)}</div>
                          <h3 className="font-semibold text-gray-800">{review.customerName}</h3>
                          <span className="text-sm text-gray-400">•</span>
                          <span className="text-sm text-gray-500">{review.service?.name || 'Unknown'}</span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{review.comment}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(review.createdAt).toLocaleDateString('id-ID')}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => toggleServicePublish(review.id, review.isPublished, review.customerName)}
                          className={`px-2 py-1 text-xs rounded-full transition-colors ${
                            review.isPublished
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {review.isPublished ? '✅ Published' : '📝 Draft'}
                        </button>
                        <div className="flex gap-2">
                          <button onClick={() => handleEditService(review)} className="text-yellow-600 hover:text-yellow-800" title="Edit">
                            <Edit className="w-5 h-5 inline" />
                          </button>
                          <button onClick={() => handleDeleteService(review.id, review.customerName)} className="text-red-600 hover:text-red-800" title="Hapus">
                            <Trash2 className="w-5 h-5 inline" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
              <p className="text-sm text-gray-500">Total: <span className="font-medium text-gray-700">{serviceReviews.length}</span> service reviews</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
