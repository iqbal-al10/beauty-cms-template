'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Save, X, Eye, EyeOff } from 'lucide-react'
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
  createdAt: string
}

const PAYMENT_TYPES = ['BANK', 'QRIS', 'EWALLET', 'MIDTRANS']
const PAYMENT_TYPE_LABELS: Record<string, string> = {
  BANK: '🏦 Bank Transfer',
  QRIS: '📱 QRIS',
  EWALLET: '📱 E-Wallet',
  MIDTRANS: '💳 Midtrans',
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<PaymentMethod | null>(null)
  const [form, setForm] = useState({
    name: '',
    type: 'BANK',
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
      setPayments(data)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Gagal memuat metode pembayaran')
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
      const url = editing ? `/api/admin/payments` : '/api/admin/payments'
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
      toast.error(error.message || 'Gagal menyimpan metode pembayaran')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus metode pembayaran "${name}"?`)) return

    try {
      const res = await fetch(`/api/admin/payments?id=${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete')
      }

      toast.success(`Metode pembayaran "${name}" berhasil dihapus!`)
      fetchPayments()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal menghapus metode pembayaran')
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
      type: 'BANK',
      accountNumber: '',
      accountName: '',
      qrCodeUrl: '',
      isActive: true,
      sortOrder: 0,
    })
  }

  const toggleActive = async (id: string, currentStatus: boolean, name: string) => {
    try {
      const payment = payments.find(p => p.id === id)
      if (!payment) return
      const newStatus = !currentStatus
      
      const res = await fetch('/api/admin/payments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payment, isActive: newStatus }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update')
      }

      toast.success(`Metode pembayaran "${name}" ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`)
      fetchPayments()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal mengubah status')
    }
  }

  const getTypeLabel = (type: string) => {
    return PAYMENT_TYPE_LABELS[type] || type
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'BANK': return 'bg-blue-100 text-blue-700'
      case 'QRIS': return 'bg-green-100 text-green-700'
      case 'EWALLET': return 'bg-purple-100 text-purple-700'
      case 'MIDTRANS': return 'bg-pink-100 text-pink-700'
      default: return 'bg-gray-100 text-gray-700'
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
        <h1 className="text-2xl font-bold text-gray-800">💳 Payment Methods</h1>
        <button
          onClick={() => { setEditing(null); setForm({ name: '', type: 'BANK', accountNumber: '', accountName: '', qrCodeUrl: '', isActive: true, sortOrder: 0 }); setShowForm(!showForm) }}
          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tambah Metode
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit Metode Pembayaran' : 'Tambah Metode Pembayaran'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nama *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                  placeholder="BCA, Gopay, QRIS, dll"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipe *</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                >
                  {PAYMENT_TYPES.map((type) => (
                    <option key={type} value={type}>{getTypeLabel(type)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nomor Rekening / Akun</label>
                <input
                  type="text"
                  value={form.accountNumber}
                  onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                  placeholder="1234567890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nama Pemilik Akun</label>
                <input
                  type="text"
                  value={form.accountName}
                  onChange={(e) => setForm({ ...form, accountName: e.target.value })}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                  placeholder="PT Beauty Studio"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">QR Code URL</label>
              <input
                type="text"
                value={form.qrCodeUrl}
                onChange={(e) => setForm({ ...form, qrCodeUrl: e.target.value })}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="https://example.com/qr-code.png"
              />
              <p className="text-xs text-gray-400 mt-1">URL gambar QRIS (jika ada)</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4 text-pink-500 rounded border-gray-300"
              />
              <label className="text-sm text-gray-700">Aktif</label>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Save className="w-4 h-4" />
                {editing ? 'Update' : 'Simpan'}
              </button>
              <button type="button" onClick={handleCancel} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg">
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nomor Akun</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {payments.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Belum ada metode pembayaran</td></tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-800">{payment.name}</div>
                    {payment.accountName && (
                      <div className="text-xs text-gray-500">{payment.accountName}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(payment.type)}`}>
                      {getTypeLabel(payment.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {payment.accountNumber || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleActive(payment.id, payment.isActive, payment.name)}
                      className={`px-2 py-1 text-xs rounded-full transition-colors ${
                        payment.isActive
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {payment.isActive ? '✅ Aktif' : '❌ Nonaktif'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => handleEdit(payment)} className="text-yellow-600 hover:text-yellow-800">
                      <Edit className="w-5 h-5 inline" />
                    </button>
                    <button onClick={() => handleDelete(payment.id, payment.name)} className="text-red-600 hover:text-red-800">
                      <Trash2 className="w-5 h-5 inline" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <p className="text-sm text-gray-500">Total: <span className="font-medium text-gray-700">{payments.length}</span> metode pembayaran</p>
        </div>
      </div>
    </div>
  )
}