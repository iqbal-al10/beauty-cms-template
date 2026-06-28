'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
  price: number
}

interface PromoProduct {
  id: string
  productId: string
  product: Product
}

interface Promo {
  id: string
  title: string
  type: string
  voucherCode: string | null
  discountValue: number | null
  discountType: string | null
  startDate: string
  endDate: string
  bannerUrl: string | null
  isActive: boolean
  products: PromoProduct[]
}

const PROMO_TYPES = ['FLASH_SALE', 'DISCOUNT', 'VOUCHER', 'BUNDLE']
const DISCOUNT_TYPES = ['PERCENTAGE', 'FIXED']

export default function PromosPage() {
  const [promos, setPromos] = useState<Promo[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Promo | null>(null)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [form, setForm] = useState({
    title: '',
    type: 'DISCOUNT',
    voucherCode: '',
    discountValue: '',
    discountType: 'PERCENTAGE',
    startDate: '',
    endDate: '',
    bannerUrl: '',
    isActive: true,
  })

  useEffect(() => {
    fetchPromos()
    fetchProducts()
  }, [])

  const fetchPromos = async () => {
    try {
      const res = await fetch('/api/admin/promos')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setPromos(data || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Gagal memuat promos')
      setPromos([])
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products?all=true')
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
    
    if (!form.title.trim() || !form.startDate || !form.endDate) {
      toast.error('Title, Start Date, dan End Date harus diisi')
      return
    }

    if (form.type === 'VOUCHER' && !form.voucherCode.trim()) {
      toast.error('Kode Voucher wajib diisi untuk tipe VOUCHER')
      return
    }

    if (selectedProducts.length === 0) {
      toast.error('Pilih minimal satu produk')
      return
    }

    try {
      const url = editing ? `/api/admin/promos/${editing.id}` : '/api/admin/promos'
      const method = editing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          voucherCode: form.type === 'VOUCHER' ? form.voucherCode.toUpperCase() : null,
          discountValue: form.discountValue ? parseFloat(form.discountValue) : null,
          productIds: selectedProducts,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save')
      }

      toast.success(editing ? 'Promo berhasil diupdate!' : 'Promo berhasil ditambahkan!')
      fetchPromos()
      handleCancel()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal menyimpan promo')
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Yakin ingin menghapus promo "${title}"?`)) return

    try {
      const res = await fetch(`/api/admin/promos/${id}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete')
      }

      toast.success(`Promo "${title}" berhasil dihapus!`)
      setPromos(promos.filter(p => p.id !== id))
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal menghapus promo')
    }
  }

  const handleEdit = (promo: Promo) => {
    setEditing(promo)
    setForm({
      title: promo.title,
      type: promo.type,
      voucherCode: promo.voucherCode || '',
      discountValue: promo.discountValue?.toString() || '',
      discountType: promo.discountType || 'PERCENTAGE',
      startDate: promo.startDate.split('T')[0],
      endDate: promo.endDate.split('T')[0],
      bannerUrl: promo.bannerUrl || '',
      isActive: promo.isActive,
    })
    setSelectedProducts(promo.products.map(p => p.productId))
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditing(null)
    setForm({
      title: '',
      type: 'DISCOUNT',
      voucherCode: '',
      discountValue: '',
      discountType: 'PERCENTAGE',
      startDate: '',
      endDate: '',
      bannerUrl: '',
      isActive: true,
    })
    setSelectedProducts([])
  }

  const toggleActive = async (id: string, currentStatus: boolean, title: string) => {
    try {
      const promo = promos.find(p => p.id === id)
      if (!promo) {
        toast.error('Promo tidak ditemukan')
        return
      }

      const newStatus = !currentStatus

      const res = await fetch(`/api/admin/promos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...promo,
          isActive: newStatus,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update')
      }

      toast.success(`Promo "${title}" ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`)
      fetchPromos()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal mengubah status')
    }
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      FLASH_SALE: 'Flash Sale',
      DISCOUNT: 'Discount',
      VOUCHER: 'Voucher',
      BUNDLE: 'Bundle',
    }
    return labels[type] || type
  }

  const getDiscountLabel = (promo: Promo) => {
    if (promo.discountType === 'PERCENTAGE') {
      return `${promo.discountValue}%`
    } else if (promo.discountType === 'FIXED') {
      return `Rp ${promo.discountValue?.toLocaleString()}`
    }
    return '-'
  }

  const getStatus = (promo: Promo) => {
    const now = new Date()
    const start = new Date(promo.startDate)
    const end = new Date(promo.endDate)
    
    if (!promo.isActive) return 'Inactive'
    if (now < start) return 'Upcoming'
    if (now > end) return 'Expired'
    return 'Active'
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Active: 'bg-green-100 text-green-700',
      Upcoming: 'bg-blue-100 text-blue-700',
      Expired: 'bg-gray-100 text-gray-700',
      Inactive: 'bg-red-100 text-red-700',
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
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
        <h1 className="text-2xl font-bold text-gray-800">Promo</h1>
        <button
          onClick={() => {
            setEditing(null)
            setForm({
              title: '',
              type: 'DISCOUNT',
              voucherCode: '',
              discountValue: '',
              discountType: 'PERCENTAGE',
              startDate: '',
              endDate: '',
              bannerUrl: '',
              isActive: true,
            })
            setSelectedProducts([])
            setShowForm(!showForm)
          }}
          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Promo
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6 max-h-[80vh] overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">
            {editing ? 'Edit Promo' : 'New Promo'}
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
                  placeholder="e.g., Summer Sale 2024"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                >
                  {PROMO_TYPES.map((type) => (
                    <option key={type} value={type}>{getTypeLabel(type)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* VOUCHER CODE - HANYA MUNCUL JIKA TYPE = VOUCHER */}
            {form.type === 'VOUCHER' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Kode Voucher *
                  <span className="text-xs text-gray-400 ml-2">(akan otomatis uppercase)</span>
                </label>
                <input
                  type="text"
                  required={form.type === 'VOUCHER'}
                  value={form.voucherCode}
                  onChange={(e) => setForm({ ...form, voucherCode: e.target.value.toUpperCase() })}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                  placeholder="e.g., SUMMER20"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Customer akan memasukkan kode ini di halaman booking/order
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Discount Type</label>
                <select
                  value={form.discountType}
                  onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                >
                  {DISCOUNT_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Discount Value</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.discountValue}
                  onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                  placeholder={form.discountType === 'PERCENTAGE' ? '10' : '50000'}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date *</label>
                <input
                  type="date"
                  required
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date *</label>
                <input
                  type="date"
                  required
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Banner URL (optional)</label>
              <input
                type="text"
                value={form.bannerUrl}
                onChange={(e) => setForm({ ...form, bannerUrl: e.target.value })}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="https://example.com/banner.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Products *</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
                {products.length === 0 ? (
                  <p className="text-gray-500 text-sm col-span-full">Tidak ada produk</p>
                ) : (
                  products.map((product) => (
                    <label key={product.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProducts([...selectedProducts, product.id])
                          } else {
                            setSelectedProducts(selectedProducts.filter(id => id !== product.id))
                          }
                        }}
                        className="w-4 h-4 text-pink-500 rounded border-gray-300"
                      />
                      <span className="truncate">{product.name}</span>
                    </label>
                  ))
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">Pilih {selectedProducts.length} produk</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4 text-pink-500 rounded border-gray-300"
              />
              <label className="text-sm text-gray-700">Active</label>
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-200">
          {promos.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No promotions found</div>
          ) : (
            promos.map((promo) => {
              const status = getStatus(promo)
              const isVoucher = promo.type === 'VOUCHER'
              return (
                <div key={promo.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-semibold text-gray-800">{promo.title}</h3>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                          {getTypeLabel(promo.type)}
                        </span>
                        {isVoucher && promo.voucherCode && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700">
                            Kode: {promo.voucherCode}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(status)}`}>
                          {status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 flex-wrap">
                        <span>Discount: {getDiscountLabel(promo)}</span>
                        <span>{promo.products?.length || 0} products</span>
                        <span>
                          {new Date(promo.startDate).toLocaleDateString()} - {new Date(promo.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleActive(promo.id, promo.isActive, promo.title)}
                        className={`px-2 py-1 text-xs rounded-full transition-colors ${
                          promo.isActive
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {promo.isActive ? 'Active' : 'Inactive'}
                      </button>
                      <button
                        onClick={() => handleEdit(promo)}
                        className="text-yellow-600 hover:text-yellow-800"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(promo.id, promo.title)}
                        className="text-red-600 hover:text-red-800"
                        title="Hapus"
                      >
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
          <p className="text-sm text-gray-500">
            Total: <span className="font-medium text-gray-700">{promos.length}</span> promotions
          </p>
        </div>
      </div>
    </div>
  )
}
