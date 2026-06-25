'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'

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

const CATEGORIES = ['Facial', 'Acne', 'Scar', 'Whitening', 'Wrinkle', 'Other']

export default function BeforeAfterPage() {
  const [items, setItems] = useState<BeforeAfter[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<BeforeAfter | null>(null)
  const [form, setForm] = useState({
    title: '',
    category: 'Facial',
    beforeImageUrl: '',
    afterImageUrl: '',
    description: '',
    sortOrder: 0,
    isPublished: true,
  })

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/admin/before-after')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setItems(data || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Gagal memuat data')
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.title.trim() || !form.beforeImageUrl.trim() || !form.afterImageUrl.trim()) {
      toast.error('Title, Before Image, dan After Image harus diisi')
      return
    }

    try {
      const url = editing ? `/api/admin/before-after/${editing.id}` : '/api/admin/before-after'
      const method = editing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          sortOrder: parseInt(form.sortOrder.toString()) || 0,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to save')
      }

      toast.success(editing ? 'Item berhasil diupdate!' : 'Item berhasil ditambahkan!')
      fetchItems()
      handleCancel()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal menyimpan item')
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Yakin ingin menghapus item "${title}"?`)) return

    try {
      const res = await fetch(`/api/admin/before-after/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete')
      }

      toast.success(`Item "${title}" berhasil dihapus!`)
      setItems(items.filter(item => item.id !== id))
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal menghapus item')
    }
  }

  const handleEdit = (item: BeforeAfter) => {
    setEditing(item)
    setForm({
      title: item.title,
      category: item.category,
      beforeImageUrl: item.beforeImageUrl,
      afterImageUrl: item.afterImageUrl,
      description: item.description || '',
      sortOrder: item.sortOrder,
      isPublished: item.isPublished,
    })
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditing(null)
    setForm({
      title: '',
      category: 'Facial',
      beforeImageUrl: '',
      afterImageUrl: '',
      description: '',
      sortOrder: 0,
      isPublished: true,
    })
  }

  const togglePublish = async (id: string, currentStatus: boolean, title: string) => {
    try {
      // Cari item yang akan diupdate
      const item = items.find(i => i.id === id)
      if (!item) {
        toast.error('Item tidak ditemukan')
        return
      }

      const newStatus = !currentStatus

      // Kirim update dengan semua data, bukan hanya status
      const res = await fetch(`/api/admin/before-after/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: item.title,
          category: item.category,
          beforeImageUrl: item.beforeImageUrl,
          afterImageUrl: item.afterImageUrl,
          description: item.description || '',
          sortOrder: item.sortOrder,
          isPublished: newStatus,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update')
      }

      toast.success(`Item "${title}" ${newStatus ? 'dipublikasikan' : 'di-draft'}`)
      fetchItems()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal mengubah status')
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
        <h1 className="text-2xl font-bold text-gray-800">Before / After Gallery</h1>
        <button
          onClick={() => {
            setEditing(null)
            setForm({
              title: '',
              category: 'Facial',
              beforeImageUrl: '',
              afterImageUrl: '',
              description: '',
              sortOrder: items.length,
              isPublished: true,
            })
            setShowForm(!showForm)
          }}
          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Item
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editing ? 'Edit Item' : 'New Item'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                  placeholder="e.g., Acne Treatment Result"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Before Image URL *</label>
                <input
                  type="text"
                  required
                  value={form.beforeImageUrl}
                  onChange={(e) => setForm({ ...form, beforeImageUrl: e.target.value })}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                  placeholder="https://example.com/before.jpg"
                />
                {form.beforeImageUrl && (
                  <div className="mt-2">
                    <img src={form.beforeImageUrl} alt="Before preview" className="w-20 h-20 object-cover rounded-lg border" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">After Image URL *</label>
                <input
                  type="text"
                  required
                  value={form.afterImageUrl}
                  onChange={(e) => setForm({ ...form, afterImageUrl: e.target.value })}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                  placeholder="https://example.com/after.jpg"
                />
                {form.afterImageUrl && (
                  <div className="mt-2">
                    <img src={form.afterImageUrl} alt="After preview" className="w-20 h-20 object-cover rounded-lg border" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description (optional)</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="Brief description of the treatment..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Sort Order</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                  className="w-4 h-4 text-pink-500 rounded border-gray-300"
                />
                <label className="text-sm text-gray-700">Published</label>
              </div>
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
          {items.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No items found</div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  {/* Preview Images */}
                  <div className="flex gap-2 flex-shrink-0">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden relative">
                      {item.beforeImageUrl ? (
                        <img src={item.beforeImageUrl} alt="Before" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      )}
                      <span className="absolute bottom-0 left-0 right-0 text-[8px] bg-black/50 text-white text-center">Before</span>
                    </div>
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden relative">
                      {item.afterImageUrl ? (
                        <img src={item.afterImageUrl} alt="After" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      )}
                      <span className="absolute bottom-0 left-0 right-0 text-[8px] bg-black/50 text-white text-center">After</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{item.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="px-2 py-0.5 bg-gray-100 rounded">{item.category}</span>
                      {item.description && <span>{item.description}</span>}
                      <span className="text-xs text-gray-400">Order: {item.sortOrder}</span>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => togglePublish(item.id, item.isPublished, item.title)}
                      className={`px-2 py-1 text-xs rounded-full transition-colors ${
                        item.isPublished
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {item.isPublished ? '✅ Published' : '📝 Draft'}
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-yellow-600 hover:text-yellow-800"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.title)}
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
            Total: <span className="font-medium text-gray-700">{items.length}</span> items
          </p>
        </div>
      </div>
    </div>
  )
}
