'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react'
import toast from 'react-hot-toast'

interface FAQ {
  id: string
  question: string
  answer: string
  sortOrder: number
  isActive: boolean
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<FAQ | null>(null)
  const [form, setForm] = useState({
    question: '',
    answer: '',
    sortOrder: 0,
    isActive: true,
  })

  useEffect(() => {
    fetchFaqs()
  }, [])

  const fetchFaqs = async () => {
    try {
      const res = await fetch('/api/admin/faq')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setFaqs(data || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Gagal memuat FAQ')
      setFaqs([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.question.trim() || !form.answer.trim()) {
      toast.error('Question dan Answer harus diisi')
      return
    }

    try {
      const url = editing ? `/api/admin/faq/${editing.id}` : '/api/admin/faq'
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

      toast.success(editing ? 'FAQ berhasil diupdate!' : 'FAQ berhasil ditambahkan!')
      fetchFaqs()
      handleCancel()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal menyimpan FAQ')
    }
  }

  const handleDelete = async (id: string, question: string) => {
    if (!confirm(`Yakin ingin menghapus FAQ "${question}"?`)) return

    try {
      const res = await fetch(`/api/admin/faq/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete')
      }

      toast.success(`FAQ "${question}" berhasil dihapus!`)
      setFaqs(faqs.filter(f => f.id !== id))
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal menghapus FAQ')
    }
  }

  const handleEdit = (faq: FAQ) => {
    setEditing(faq)
    setForm({
      question: faq.question,
      answer: faq.answer,
      sortOrder: faq.sortOrder,
      isActive: faq.isActive,
    })
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditing(null)
    setForm({ question: '', answer: '', sortOrder: faqs.length, isActive: true })
  }

  const toggleActive = async (id: string, currentStatus: boolean, question: string) => {
    try {
      const faq = faqs.find(f => f.id === id)
      if (!faq) {
        toast.error('FAQ tidak ditemukan')
        return
      }

      const newStatus = !currentStatus

      const res = await fetch(`/api/admin/faq/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: faq.question,
          answer: faq.answer,
          sortOrder: faq.sortOrder,
          isActive: newStatus,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update')
      }

      toast.success(`FAQ "${question}" ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`)
      fetchFaqs()
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
        <h1 className="text-2xl font-bold text-gray-800">FAQ</h1>
        <button
          onClick={() => {
            setEditing(null)
            setForm({ question: '', answer: '', sortOrder: faqs.length, isActive: true })
            setShowForm(!showForm)
          }}
          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add FAQ
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editing ? 'Edit FAQ' : 'New FAQ'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Question *</label>
              <input
                type="text"
                required
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="Pertanyaan yang sering diajukan..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Answer *</label>
              <textarea
                required
                rows={3}
                value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="Jawaban untuk pertanyaan..."
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
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 text-pink-500 rounded border-gray-300"
                />
                <label className="text-sm text-gray-700">Active</label>
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Question</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Answer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {faqs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Belum ada FAQ
                  </td>
                </tr>
              ) : (
                faqs.map((faq, index) => (
                  <tr key={faq.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {faq.sortOrder || index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{faq.question}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-sm truncate">
                      {faq.answer}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(faq.id, faq.isActive, faq.question)}
                        className={`px-2 py-1 text-xs rounded-full transition-colors ${
                          faq.isActive
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {faq.isActive ? '✅ Active' : '❌ Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(faq)}
                        className="text-yellow-600 hover:text-yellow-800"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(faq.id, faq.question)}
                        className="text-red-600 hover:text-red-800"
                        title="Hapus"
                      >
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
          <p className="text-sm text-gray-500">
            Total: <span className="font-medium text-gray-700">{faqs.length}</span> FAQs
          </p>
        </div>
      </div>
    </div>
  )
}
