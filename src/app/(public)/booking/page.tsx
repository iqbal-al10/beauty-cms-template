'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
  price: number
  stock: number
}

export default function BookingPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    customerName: '',
    customerWhatsapp: '',
    productId: '',
    quantity: 1,
    note: '',
  })

  const primaryColor = '#c4367b'

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/public/products?limit=100')
      if (res.ok) {
        const data = await res.json()
        setProducts(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Gagal memuat produk')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('✅ Pesanan berhasil dibuat! Tunggu konfirmasi admin.')
        setForm({
          customerName: '',
          customerWhatsapp: '',
          productId: '',
          quantity: 1,
          note: '',
        })
        // Refresh produk untuk update stok
        fetchProducts()
      } else {
        toast.error(data.error || 'Gagal membuat pesanan')
      }
    } catch (error) {
      console.error('Error submitting order:', error)
      toast.error('Terjadi kesalahan')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedProduct = products.find(p => p.id === form.productId)
  const maxQuantity = selectedProduct?.stock || 0

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: primaryColor }} />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Booking / Order</h1>
      <p className="text-gray-500 mb-8">Isi form di bawah untuk memesan produk</p>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nama Lengkap *</label>
          <input
            type="text"
            required
            value={form.customerName}
            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-colors"
            style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
            placeholder="Masukkan nama Anda"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">No. WhatsApp *</label>
          <input
            type="tel"
            required
            value={form.customerWhatsapp}
            onChange={(e) => setForm({ ...form, customerWhatsapp: e.target.value })}
            className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-colors"
            style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
            placeholder="08xxxxxxxxxx"
          />
          <p className="text-xs text-gray-400 mt-1">Contoh: 6281234567890</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Pilih Produk *</label>
          <select
            required
            value={form.productId}
            onChange={(e) => {
              const product = products.find(p => p.id === e.target.value)
              setForm({ 
                ...form, 
                productId: e.target.value,
                quantity: 1,
              })
            }}
            className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-colors"
            style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
          >
            <option value="">-- Pilih Produk --</option>
            {products
              .filter(p => p.stock > 0)
              .map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - Rp {product.price.toLocaleString()} (Stok: {product.stock})
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Jumlah *</label>
          <input
            type="number"
            required
            min="1"
            max={maxQuantity || 999}
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })}
            className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-colors"
            style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
          />
          {selectedProduct && (
            <p className="text-xs text-gray-400 mt-1">Stok tersedia: {selectedProduct.stock} unit</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Catatan (Opsional)</label>
          <textarea
            rows={3}
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-colors"
            style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
            placeholder="Catatan tambahan..."
          />
        </div>

        {selectedProduct && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              Total: <span className="font-bold text-lg" style={{ color: primaryColor }}>
                Rp {(selectedProduct.price * form.quantity).toLocaleString()}
              </span>
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !form.productId}
          className="w-full py-3 rounded-lg text-white font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
          style={{ backgroundColor: primaryColor }}
        >
          {submitting ? 'Memproses...' : 'Pesan Sekarang'}
        </button>

        <p className="text-xs text-gray-400 text-center mt-2">
          * Pesanan akan diproses setelah admin mengkonfirmasi via WhatsApp
        </p>
      </form>
    </div>
  )
}
