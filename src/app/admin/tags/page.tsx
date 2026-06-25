'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Tag {
  id: string
  name: string
  slug: string
  color: string | null
  createdAt: string
}

const COLORS = [
  { value: 'bg-red-500', label: 'Red' },
  { value: 'bg-blue-500', label: 'Blue' },
  { value: 'bg-green-500', label: 'Green' },
  { value: 'bg-yellow-500', label: 'Yellow' },
  { value: 'bg-purple-500', label: 'Purple' },
  { value: 'bg-pink-500', label: 'Pink' },
  { value: 'bg-orange-500', label: 'Orange' },
  { value: 'bg-teal-500', label: 'Teal' },
]

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Tag | null>(null)
  const [form, setForm] = useState({
    name: '',
    slug: '',
    color: 'bg-red-500',
  })

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    try {
      const res = await fetch('/api/admin/tags')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setTags(data || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Gagal memuat tags')
      setTags([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error('Name dan slug harus diisi')
      return
    }

    try {
      const url = editing ? `/api/admin/tags/${editing.id}` : '/api/admin/tags'
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

      toast.success(editing ? 'Tag berhasil diupdate!' : 'Tag berhasil ditambahkan!')
      fetchTags()
      handleCancel()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal menyimpan tag')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus tag "${name}"?`)) return

    try {
      const res = await fetch(`/api/admin/tags/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete')
      }

      toast.success(`Tag "${name}" berhasil dihapus!`)
      setTags(tags.filter(t => t.id !== id))
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal menghapus tag')
    }
  }

  const handleEdit = (tag: Tag) => {
    setEditing(tag)
    setForm({
      name: tag.name,
      slug: tag.slug,
      color: tag.color || 'bg-red-500',
    })
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditing(null)
    setForm({
      name: '',
      slug: '',
      color: 'bg-red-500',
    })
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
        <h1 className="text-2xl font-bold text-gray-800">Product Tags</h1>
        <button
          onClick={() => {
            setEditing(null)
            setForm({ name: '', slug: '', color: 'bg-red-500' })
            setShowForm(!showForm)
          }}
          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Tag
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editing ? 'Edit Tag' : 'New Tag'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => {
                    const name = e.target.value
                    setForm({
                      ...form,
                      name,
                      slug: name.toLowerCase().replace(/ /g, '-'),
                    })
                  }}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                  placeholder="e.g., Best Seller"
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
                  placeholder="best-seller"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Color</label>
              <div className="flex gap-3 mt-2 flex-wrap">
                {COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setForm({ ...form, color: color.value })}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      form.color === color.value
                        ? 'border-gray-800 scale-110'
                        : 'border-gray-300 hover:scale-105'
                    } ${color.value}`}
                    title={color.label}
                  />
                ))}
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
          {tags.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No tags found</div>
          ) : (
            tags.map((tag) => (
              <div key={tag.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {tag.color && (
                      <span className={`w-4 h-4 rounded-full ${tag.color}`} />
                    )}
                    <span className="font-semibold text-gray-800">{tag.name}</span>
                    <span className="text-sm text-gray-400">•</span>
                    <span className="text-sm text-gray-500">{tag.slug}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(tag)}
                      className="text-yellow-600 hover:text-yellow-800"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(tag.id, tag.name)}
                      className="text-red-600 hover:text-red-800"
                      title="Hapus"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Total: <span className="font-medium text-gray-700">{tags.length}</span> tags
          </p>
        </div>
      </div>
    </div>
  )
}
