'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Home, ShoppingBag, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface OrderItem {
  id: string
  productName: string
  quantity: number
  price: number
  compareAtPrice: number | null
  total: number
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerWhatsapp: string
  address: string
  city: string
  shippingCost: number
  subtotal: number
  discountAmount: number
  total: number
  paymentMethod: string
  paymentMethodName: string
  paymentAccountNumber: string
  paymentAccountName: string
  status: string
  note: string | null
  createdAt: string
  items: OrderItem[]
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get('orderId')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [adminWhatsapp, setAdminWhatsapp] = useState('')

  useEffect(() => {
    if (!orderId) {
      router.push('/')
      return
    }

    fetchOrder()
    fetchSettings()
  }, [orderId])

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`)
      if (!res.ok) {
        throw new Error('Order not found')
      }
      const data = await res.json()
      console.log('📦 Order data:', data)
      setOrder(data)
    } catch (error) {
      console.error('Error fetching order:', error)
      toast.error('Gagal memuat pesanan')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/public/settings')
      if (res.ok) {
        const data = await res.json()
        setAdminWhatsapp(data.whatsappNumber || '')
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getWhatsAppMessage = () => {
    if (!order) return ''
    const methodName = order.paymentMethodName || order.paymentMethod || '-'
    const message = `Halo Admin,%0A%0ASaya sudah melakukan pembayaran untuk pesanan:%0A%0A📋 *Order Number:* ${order.orderNumber}%0A👤 *Nama:* ${order.customerName}%0A💵 *Total:* Rp ${order.total.toLocaleString()}%0A📅 *Tanggal:* ${new Date(order.createdAt).toLocaleDateString('id-ID')}%0A💳 *Metode:* ${methodName}%0A%0A📎 *Berikut bukti pembayaran saya.*%0A%0ATerima kasih.`
    return message
  }

  const cleanWhatsapp = adminWhatsapp.replace(/[^0-9]/g, '')

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Pesanan tidak ditemukan</p>
        <Link href="/" className="text-pink-500 hover:underline mt-2 inline-block">
          Kembali ke Home
        </Link>
      </div>
    )
  }

  // Gunakan paymentMethodName, fallback ke paymentMethod jika kosong
  const methodName = order.paymentMethodName || order.paymentMethod || '-'

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Success Header */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Pesanan Berhasil!</h1>
        <p className="text-gray-600">
          Pesanan Anda telah kami terima. Kami akan segera memproses pesanan Anda.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Nomor Pesanan: <span className="font-bold text-pink-500">{order.orderNumber}</span>
        </p>
      </div>

      {/* Order Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Detail Pesanan</h2>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Tanggal</span>
            <span className="font-medium">{formatDate(order.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Status</span>
            <span className="font-medium text-yellow-600">PENDING</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Metode Pembayaran</span>
            <span className="font-medium">{methodName}</span>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-4 pt-4">
          <h3 className="font-medium text-gray-800 mb-2">Produk</h3>
          <div className="space-y-2">
            {order.items.map((item) => {
              const hasCompare = item.compareAtPrice && item.compareAtPrice > item.price
              return (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div>
                    <span className="font-medium">{item.productName}</span>
                    <span className="text-gray-400 ml-2">× {item.quantity}</span>
                    {hasCompare && (
                      <span className="text-gray-400 line-through text-xs ml-2">
                        Rp {item.compareAtPrice?.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <span className="font-medium">Rp {item.total.toLocaleString()}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="border-t border-gray-200 mt-4 pt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span>Rp {order.subtotal.toLocaleString()}</span>
          </div>
          {order.shippingCost > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500">Ongkir</span>
              <span>Rp {order.shippingCost.toLocaleString()}</span>
            </div>
          )}
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Diskon</span>
              <span>- Rp {order.discountAmount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span style={{ color: '#c4367b' }}>Rp {order.total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Informasi Pengiriman</h2>
        <div className="space-y-1 text-sm">
          <p><span className="text-gray-500">Nama:</span> {order.customerName}</p>
          <p><span className="text-gray-500">WhatsApp:</span> {order.customerWhatsapp}</p>
          <p><span className="text-gray-500">Alamat:</span> {order.address}</p>
          {order.city && <p><span className="text-gray-500">Kota:</span> {order.city}</p>}
        </div>
      </div>

      {/* Payment Details */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">💳 Detail Pembayaran</h2>
        <div className="space-y-1 text-sm">
          <p><span className="text-gray-600">Metode:</span> <span className="font-medium">{methodName}</span></p>
          {order.paymentAccountNumber && (
            <p><span className="text-gray-600">No Rekening/Akun:</span> <span className="font-mono font-medium">{order.paymentAccountNumber}</span></p>
          )}
          {order.paymentAccountName && (
            <p><span className="text-gray-600">a.n:</span> <span className="font-medium">{order.paymentAccountName}</span></p>
          )}
        </div>
        <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
          <p className="text-sm font-medium">Nominal yang harus dibayar:</p>
          <p className="text-2xl font-bold text-pink-500">Rp {order.total.toLocaleString()}</p>
        </div>
        <p className="text-xs text-blue-600 mt-3">
          ⚠️ Gunakan nominal yang sesuai untuk memudahkan verifikasi
        </p>
      </div>

      {/* WhatsApp Payment Proof Button */}
      {cleanWhatsapp && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-green-800 mb-2">📱 Kirim Bukti Pembayaran</h2>
          <p className="text-sm text-green-700 mb-4">
            Setelah melakukan pembayaran, kirim bukti transfer melalui WhatsApp untuk mempercepat proses verifikasi.
          </p>
          <a
            href={`https://wa.me/${cleanWhatsapp}?text=${getWhatsAppMessage()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-all hover:opacity-90 hover:scale-105 active:scale-95"
            style={{ backgroundColor: '#25D366' }}
          >
            <MessageCircle className="w-5 h-5" />
            Kirim Bukti Pembayaran via WhatsApp
          </a>
          <p className="text-xs text-gray-500 mt-3">
            💡 Klik tombol di atas untuk membuka chat WhatsApp dengan pesan otomatis
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        <Link
          href="/"
          className="flex-1 min-w-[150px] px-6 py-3 rounded-lg border-2 text-center font-medium transition-all hover:bg-gray-50"
          style={{ borderColor: '#c4367b', color: '#c4367b' }}
        >
          <Home className="w-4 h-4 inline mr-2" />
          Kembali ke Home
        </Link>
        <Link
          href="/products"
          className="flex-1 min-w-[150px] px-6 py-3 rounded-lg text-white text-center font-medium transition-all hover:opacity-90"
          style={{ backgroundColor: '#c4367b' }}
        >
          <ShoppingBag className="w-4 h-4 inline mr-2" />
          Belanja Lagi
        </Link>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  )
}