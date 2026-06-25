'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Star } from 'lucide-react'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
}

interface Review {
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

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Review | null>(null)
  const [form, setForm] = useState({
    productId: '',
    customerName: '',
    rating: 5,
    comment: '',
    isPublished: true,
  })

  useEffect(() => {
    fetchReviews()
    fetchProducts()
  }, [])

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/admin/reviews')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setReviews(data || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Gagal memuat review')
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products?select=true')
      if (!res.ok) throw new Error('Failed to fetch products')
      const data = await res.json()
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.productId || !form.customerName.trim() || !form.rating) {
      toast.error('Product, customer name, dan rating harus diisi')
      return
    }

    try {
      const url = editing ? `/api/admin/reviews/${editing.id}` : '/api/admin/reviews'
      const method = editing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to save')
      }

      toast.success(editing ? 'Review berhasil diupdate!' : 'Review berhasil ditambahkan!')
      fetchReviews()
      handleCancel()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal menyimpan review')
    }
  }

  const handleDelete = async (id: string, customerName: string) => {
    if (!confirm(`Yakin ingin menghapus review dari "${customerName}"?`)) return

    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete')
      }

      toast.success(`Review dari "${customerName}" berhasil dihapus!`)
      setReviews(reviews.filter(r => r.id !== id))
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal menghapus review')
    }
  }

  const handleEdit = (review: Review) => {
    setEditing(review)
    setForm({
      productId: review.productId,
      customerName: review.customerName,
      rating: review.rating,
      comment: review.comment || '',
      isPublished: review.isPublished,
    })
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditing(null)
    setForm({
      productId: '',
      customerName: '',
      rating: 5,
      comment: '',
      isPublished: true,
    })
  }

  const togglePublish = async (id: string, currentStatus: boolean, customerName: string) => {
    try {
      const review = reviews.find(r => r.id === id)
      if (!review) {
        toast.error('Review tidak ditemukan')
        return
      }

      const newStatus = !currentStatus

      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...review,
          isPublished: newStatus,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update')
      }

      toast.success(`Review dari "${customerName}" ${newStatus ? 'dipublikasikan' : 'di-draft'}`)
      fetchReviews()
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">⭐ Product Reviews</h1>
        <button
          onClick={() => {
            setEditing(null)
            setForm({
              productId: '',
              customerName: '',
              rating: 5,
              comment: '',
              isPublished: true,
            })
            setShowForm(!showForm)
          }}
          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Review
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editing ? 'Edit Review' : 'New Review'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Product *</label>
                <select
                  required
                  value={form.productId}
                  onChange={(e) => setForm({ ...form, productId: e.target.value })}
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
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
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
                    onClick={() => setForm({ ...form, rating: star })}
                    className={`text-3xl transition-colors ${
                      star <= form.rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'
                    }`}
                  >
                    ★
                  </button>
                ))}
                <span className="text-sm text-gray-500 ml-2 mt-1">{form.rating}/5</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Comment</label>
              <textarea
                rows={3}
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="Customer review..."
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                className="w-4 h-4 text-pink-500 rounded border-gray-300"
              />
              <label className="text-sm text-gray-700">Published</label>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg"
              >
                {editing ? 'Update' : 'Save'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-200">
          {reviews.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No reviews found</div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  {/* Rating & Info */}
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

                  {/* Status & Actions */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => togglePublish(review.id, review.isPublished, review.customerName)}
                      className={`px-2 py-1 text-xs rounded-full transition-colors ${
                        review.isPublished
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {review.isPublished ? '✅ Published' : '📝 Draft'}
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(review)}
                        className="text-yellow-600 hover:text-yellow-800"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(review.id, review.customerName)}
                        className="text-red-600 hover:text-red-800"
                        title="Hapus"
                      >
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
          <p className="text-sm text-gray-500">
            Total: <span className="font-medium text-gray-700">{reviews.length}</span> reviews
          </p>
        </div>
      </div>
    </div>
  )
}
