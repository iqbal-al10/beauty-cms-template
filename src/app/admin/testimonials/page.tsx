'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Star } from 'lucide-react'
import toast from 'react-hot-toast'

interface Testimonial {
  id: string
  customerName: string
  rating: number
  reviewText: string
  isPublished: boolean
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Testimonial | null>(null)
  const [form, setForm] = useState({
    customerName: '',
    rating: 5,
    reviewText: '',
    isPublished: true,
  })

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const res = await fetch('/api/admin/testimonials')
      const data = await res.json()
      setTestimonials(data)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Gagal memuat testimonial')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.customerName.trim() || !form.reviewText.trim()) {
      toast.error('Nama dan review harus diisi')
      return
    }

    try {
      const url = editing ? `/api/admin/testimonials/${editing.id}` : '/api/admin/testimonials'
      const method = editing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        toast.success(editing ? 'Testimonial berhasil diupdate!' : 'Testimonial berhasil ditambahkan!')
        fetchTestimonials()
        setShowForm(false)
        setEditing(null)
        setForm({ customerName: '', rating: 5, reviewText: '', isPublished: true })
      } else {
        toast.error('Gagal menyimpan testimonial')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error saat menyimpan testimonial')
    }
  }

  const handleDelete = async (id: string, customerName: string) => {
    if (!confirm(`Yakin ingin menghapus testimonial dari "${customerName}"?`)) return

    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success(`Testimonial dari "${customerName}" berhasil dihapus!`)
        setTestimonials(testimonials.filter(t => t.id !== id))
      } else {
        toast.error('Gagal menghapus testimonial')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error saat menghapus testimonial')
    }
  }

  const handleEdit = (testimonial: Testimonial) => {
    setEditing(testimonial)
    setForm({
      customerName: testimonial.customerName,
      rating: testimonial.rating,
      reviewText: testimonial.reviewText,
      isPublished: testimonial.isPublished,
    })
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditing(null)
    setForm({ customerName: '', rating: 5, reviewText: '', isPublished: true })
  }

  const togglePublish = async (id: string, currentStatus: boolean, customerName: string) => {
    try {
      const testimonial = testimonials.find(t => t.id === id)
      if (!testimonial) return

      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...testimonial,
          isPublished: !currentStatus,
        }),
      })

      if (res.ok) {
        const newStatus = !currentStatus
        toast.success(`Testimonial dari "${customerName}" ${newStatus ? 'dipublikasikan' : 'di-unpublish'}`)
        fetchTestimonials()
      } else {
        toast.error('Gagal mengubah status')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error saat mengubah status')
    }
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
        <h1 className="text-2xl font-bold text-gray-800">Testimonial</h1>
        <button
          onClick={() => {
            setEditing(null)
            setForm({ customerName: '', rating: 5, reviewText: '', isPublished: true })
            setShowForm(!showForm)
          }}
          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Tambah Testimonial
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editing ? 'Edit Testimonial' : 'Testimonial Baru'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama Customer</label>
              <input
                type="text"
                required
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="Nama customer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Rating (1-5)</label>
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
              <label className="block text-sm font-medium text-gray-700">Review</label>
              <textarea
                required
                rows={4}
                value={form.reviewText}
                onChange={(e) => setForm({ ...form, reviewText: e.target.value })}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="Tulis review customer..."
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                className="w-4 h-4 text-pink-500 rounded border-gray-300"
              />
              <label className="text-sm text-gray-700">Publikasikan</label>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg"
              >
                {editing ? 'Update' : 'Simpan'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
              >
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Review</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {testimonials.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Belum ada testimonial</td>
                </tr>
              ) : (
                testimonials.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{t.customerName}</td>
                    <td className="px-6 py-4">
                      <div className="flex text-yellow-400">
                        {Array.from({ length: t.rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{t.reviewText}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => togglePublish(t.id, t.isPublished, t.customerName)}
                        className={`px-2 py-1 text-xs rounded-full transition-colors ${
                          t.isPublished
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {t.isPublished ? '✅ Published' : '📝 Draft'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleEdit(t)} className="text-yellow-600 hover:text-yellow-800">
                        <Edit className="w-5 h-5 inline" />
                      </button>
                      <button onClick={() => handleDelete(t.id, t.customerName)} className="text-red-600 hover:text-red-800">
                        <Trash2 className="w-5 h-5 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <p className="text-sm text-gray-500">Total: <span className="font-medium text-gray-700">{testimonials.length}</span> testimonial</p>
        </div>
      </div>
    </div>
  )
}
