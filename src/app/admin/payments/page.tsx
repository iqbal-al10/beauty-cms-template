'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Save, X, QrCode, CreditCard, Wallet } from 'lucide-react'
import toast from 'react-hot-toast'

interface PaymentMethod {
  id: string
  name: string
  type: string
  accountNumber: string | null
  accountName: string | null
  qrCodeUrl: string | null
  isActive: boolean
  sortOrder: number
}

const PAYMENT_TYPES = [
  { value: 'bank', label: '🏦 Bank', icon: CreditCard },
  { value: 'ewallet', label: '📱 E-Wallet', icon: Wallet },
  { value: 'qris', label: '📱 QRIS', icon: QrCode },
]

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<PaymentMethod | null>(null)
  const [form, setForm] = useState({
    name: '',
    type: 'bank',
    accountNumber: '',
    accountName: '',
    qrCodeUrl: '',
    isActive: true,
    sortOrder: 0,
  })

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const res = await fetch('/api/admin/payments')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setPayments(data || [])
    } catch (error) {
      console.error('Error fetching payments:', error)
      toast.error('Gagal memuat data pembayaran')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.name.trim()) {
      toast.error('Nama metode pembayaran wajib diisi')
      return
    }

    try {
      const url = '/api/admin/payments'
      const method = editing ? 'PUT' : 'POST'
      const payload = editing ? { ...form, id: editing.id } : form

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to save')
      }

      toast.success(editing ? 'Metode pembayaran berhasil diupdate!' : 'Metode pembayaran berhasil ditambahkan!')
      fetchPayments()
      handleCancel()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal menyimpan')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus "${name}"?`)) return

    try {
      const res = await fetch(`/api/admin/payments?id=${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete')
      }

      toast.success(`"${name}" berhasil dihapus!`)
      setPayments(payments.filter(p => p.id !== id))
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal menghapus')
    }
  }

  const handleEdit = (payment: PaymentMethod) => {
    setEditing(payment)
    setForm({
      name: payment.name,
      type: payment.type,
      accountNumber: payment.accountNumber || '',
      accountName: payment.accountName || '',
      qrCodeUrl: payment.qrCodeUrl || '',
      isActive: payment.isActive,
      sortOrder: payment.sortOrder,
    })
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditing(null)
    setForm({
      name: '',
      type: 'bank',
      accountNumber: '',
      accountName: '',
      qrCodeUrl: '',
      isActive: true,
      sortOrder: 0,
    })
  }

  const toggleActive = async (id: string, currentStatus: boolean, name: string) => {
    const payment = payments.find(p => p.id === id)
    if (!payment) return

    try {
      const res = await fetch('/api/admin/payments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payment,
          isActive: !currentStatus,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update')
      }

      toast.success(`"${name}" ${!currentStatus ? 'diaktifkan' : 'dinonaktifkan'}`)
      fetchPayments()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal mengubah status')
    }
  }

  const getTypeLabel = (type: string) => {
    const found = PAYMENT_TYPES.find(t => t.value === type)
    return found ? found.label : type
  }

  const getTypeIcon = (type: string) => {
    const found = PAYMENT_TYPES.find(t => t.value === type)
    return found ? found.icon : Wallet
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
        <h1 className="text-2xl font-bold text-gray-800">Payment Methods</h1>
        <button
          onClick={() => {
            setEditing(null)
            setForm({
              name: '',
              type: 'bank',
              accountNumber: '',
              accountName: '',
              qrCodeUrl: '',
              isActive: true,
              sortOrder: payments.length,
            })
            setShowForm(!showForm)
          }}
          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Payment Method
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editing ? 'Edit Payment Method' : 'New Payment Method'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                  placeholder="e.g., BCA, Gopay, QRIS"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type *</label>
                <select
                  required
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                >
                  {PAYMENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Number</label>
                <input
                  type="text"
                  value={form.accountNumber}
                  onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                  placeholder="e.g., 1234567890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Name</label>
                <input
                  type="text"
                  value={form.accountName}
                  onChange={(e) => setForm({ ...form, accountName: e.target.value })}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                  placeholder="e.g., PT Beauty Studio"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">QR Code Image URL (for QRIS)</label>
              <input
                type="text"
                value={form.qrCodeUrl}
                onChange={(e) => setForm({ ...form, qrCodeUrl: e.target.value })}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="https://example.com/qris.png"
              />
              {form.qrCodeUrl && (
                <div className="mt-2">
                  <img src={form.qrCodeUrl} alt="QR Code preview" className="w-24 h-24 object-contain border rounded-lg" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 text-pink-500 rounded border-gray-300"
                />
                <label className="text-sm text-gray-700">Active</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Sort Order</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                  className="mt-1 block w-24 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-200">
          {payments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No payment methods found</div>
          ) : (
            payments.map((payment) => {
              const Icon = getTypeIcon(payment.type)
              return (
                <div key={payment.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-800">{payment.name}</h3>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {getTypeLabel(payment.type)}
                          </span>
                        </div>
                        {payment.accountNumber && (
                          <p className="text-sm text-gray-500">No: {payment.accountNumber}</p>
                        )}
                        {payment.accountName && (
                          <p className="text-sm text-gray-500">A/n: {payment.accountName}</p>
                        )}
                        {payment.qrCodeUrl && (
                          <p className="text-xs text-gray-400">QR Code available</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleActive(payment.id, payment.isActive, payment.name)}
                        className={`px-2 py-1 text-xs rounded-full transition-colors ${
                          payment.isActive
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {payment.isActive ? '✅ Active' : '❌ Inactive'}
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(payment)}
                          className="text-yellow-600 hover:text-yellow-800"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(payment.id, payment.name)}
                          className="text-red-600 hover:text-red-800"
                          title="Hapus"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Total: <span className="font-medium text-gray-700">{payments.length}</span> payment methods
          </p>
        </div>
      </div>
    </div>
  )
}
