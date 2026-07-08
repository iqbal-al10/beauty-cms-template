'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Home, ShoppingBag, MessageCircle, Calendar, Clock, User, Phone, Mail, MapPin, CreditCard, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'

interface Service {
  id: string
  name: string
  price: number
  duration: number
}

interface Booking {
  id: string
  customerName: string
  whatsapp: string
  email: string | null
  address: string | null
  bookingDate: string
  bookingTime: string
  notes: string | null
  status: string
  midtransOrderId: string | null
  service: Service | null
  totalPrice?: number
}

interface OrderItem {
  id: string
  productName: string
  quantity: number
  price: number
  total: number
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerWhatsapp: string
  email: string | null
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

export default function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get('order_id')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<Booking | Order | null>(null)
  const [isBooking, setIsBooking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orderId) {
      router.push('/')
      return
    }

    toast.success('✅ Pembayaran berhasil!', { duration: 5000 })
    
    // Hapus last_booking_service dari localStorage setelah sukses
    if (orderId?.startsWith('B-')) {
      localStorage.removeItem('last_booking_service')
    }

    fetchData()
  }, [orderId, router])

  const fetchData = async () => {
    try {
      setLoading(true)
      const isBookingOrder = orderId?.startsWith('B-') || false
      setIsBooking(isBookingOrder)

      const endpoint = isBookingOrder 
        ? `/api/public/booking-detail?orderId=${orderId}`
        : `/api/public/order-detail?orderId=${orderId}`

      const res = await fetch(endpoint)
      
      if (!res.ok) {
        throw new Error('Data not found')
      }

      const result = await res.json()
      setData(result)
      setError(null)
    } catch (err: any) {
      console.error('Error fetching data:', err)
      setError(err.message || 'Gagal memuat data')
      toast.error('Gagal memuat detail pesanan')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">❌ Data Tidak Ditemukan</h1>
          <p className="text-gray-600 mb-6">{error || 'Maaf, data pesanan tidak ditemukan.'}</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-all hover:opacity-90" style={{ backgroundColor: '#c4367b' }}>
            <Home className="w-4 h-4" /> Kembali ke Home
          </Link>
        </div>
      </div>
    )
  }

  // ===== RENDER BOOKING SUCCESS =====
  if (isBooking) {
    const booking = data as Booking
    const service = booking.service
    const totalPrice = service?.price || 0
    const adminWhatsapp = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || ''

    const waMessage = `Halo Admin,%0A%0ASaya sudah melakukan booking:%0A%0A📋 *Booking ID:* ${booking.id}%0A👤 *Nama:* ${booking.customerName}%0A📱 *WA:* ${booking.whatsapp}%0A📧 *Email:* ${booking.email || '-'}%0A📍 *Alamat:* ${booking.address || '-'}%0A💵 *Total:* Rp ${totalPrice.toLocaleString()}%0A📅 *Tanggal:* ${new Date(booking.bookingDate).toLocaleDateString('id-ID')}%0A⏰ *Waktu:* ${booking.bookingTime}%0A📎 *Berikut bukti pembayaran saya.*`

    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">✅ Booking Berhasil!</h1>
          <p className="text-gray-600">Pembayaran Anda telah berhasil. Booking Anda sedang diproses.</p>
        </div>

        {/* Detail Booking */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-pink-500" />
            Detail Booking
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-500">ID Booking</span>
              <span className="font-medium font-mono">{booking.id.slice(0, 12)}...</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-500">Layanan</span>
              <span className="font-medium">{service?.name || '-'}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-500">Tanggal</span>
              <span className="font-medium">{new Date(booking.bookingDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-500">Waktu</span>
              <span className="font-medium">{booking.bookingTime}</span>
            </div>
            {service?.duration && (
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Durasi</span>
                <span className="font-medium">{service.duration} menit</span>
              </div>
            )}
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-500">Status</span>
              <span className="font-medium text-yellow-600">PENDING</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-gray-500 font-semibold">Total</span>
              <span className="font-bold text-pink-500 text-lg">Rp {totalPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-pink-500" />
            Informasi Pelanggan
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <span>{booking.customerName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{booking.whatsapp}</span>
            </div>
            {booking.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{booking.email}</span>
              </div>
            )}
            {booking.address && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{booking.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* WhatsApp Button */}
        {adminWhatsapp && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-green-800 mb-2 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Kirim Bukti Pembayaran
            </h2>
            <p className="text-sm text-green-700 mb-4">
              Setelah melakukan pembayaran, kirim bukti transfer melalui WhatsApp untuk mempercepat proses verifikasi.
            </p>
            <a
              href={`https://wa.me/${adminWhatsapp.replace(/[^0-9]/g, '')}?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-all hover:opacity-90 hover:scale-105 active:scale-95"
              style={{ backgroundColor: '#25D366' }}
            >
              <MessageCircle className="w-5 h-5" />
              Kirim Bukti via WhatsApp
            </a>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-4">
          <Link href="/" className="flex-1 min-w-[150px] px-6 py-3 rounded-lg border-2 text-center font-medium transition-all hover:bg-gray-50" style={{ borderColor: '#c4367b', color: '#c4367b' }}>
            <Home className="w-4 h-4 inline mr-2" />
            Kembali ke Home
          </Link>
          <Link href="/booking" className="flex-1 min-w-[150px] px-6 py-3 rounded-lg text-white text-center font-medium transition-all hover:opacity-90" style={{ backgroundColor: '#c4367b' }}>
            <ShoppingBag className="w-4 h-4 inline mr-2" />
            Lihat Layanan
          </Link>
        </div>
      </div>
    )
  }

  // ===== RENDER ORDER SUCCESS =====
  const order = data as Order

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">✅ Pesanan Berhasil!</h1>
        <p className="text-gray-600">Pesanan Anda telah dibayar dan sedang diproses.</p>
        <p className="text-sm text-gray-500 mt-2">Nomor Pesanan: <span className="font-bold text-pink-500">{order.orderNumber}</span></p>
      </div>

      {/* Order Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Detail Pesanan</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="text-gray-500">Tanggal</span>
            <span className="font-medium">{new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="text-gray-500">Status</span>
            <span className="font-medium text-yellow-600">PENDING</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="text-gray-500">Metode Pembayaran</span>
            <span className="font-medium">{order.paymentMethodName || order.paymentMethod || '-'}</span>
          </div>
          {order.paymentAccountNumber && (
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-500">No Rekening/Akun</span>
              <span className="font-mono font-medium">{order.paymentAccountNumber}</span>
            </div>
          )}
          {order.paymentAccountName && (
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-500">a.n</span>
              <span className="font-medium">{order.paymentAccountName}</span>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="border-t border-gray-200 mt-4 pt-4">
          <h3 className="font-medium text-gray-800 mb-2">Produk</h3>
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                <div>
                  <span className="font-medium">{item.productName}</span>
                  <span className="text-gray-400 ml-2">× {item.quantity}</span>
                </div>
                <span className="font-medium">Rp {item.total.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
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
          <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
            <span>Total</span>
            <span className="text-pink-500">Rp {order.total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Informasi Pengiriman</h2>
        <div className="space-y-1 text-sm">
          <p><span className="text-gray-500">Nama:</span> {order.customerName}</p>
          <p><span className="text-gray-500">WhatsApp:</span> {order.customerWhatsapp}</p>
          <p><span className="text-gray-500">Email:</span> {order.email || '-'}</p>
          <p><span className="text-gray-500">Alamat:</span> {order.address}</p>
          {order.city && <p><span className="text-gray-500">Kota:</span> {order.city}</p>}
          {order.note && <p><span className="text-gray-500">Catatan:</span> {order.note}</p>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        <Link href="/" className="flex-1 min-w-[150px] px-6 py-3 rounded-lg border-2 text-center font-medium transition-all hover:bg-gray-50" style={{ borderColor: '#c4367b', color: '#c4367b' }}>
          <Home className="w-4 h-4 inline mr-2" />
          Kembali ke Home
        </Link>
        <Link href="/products" className="flex-1 min-w-[150px] px-6 py-3 rounded-lg text-white text-center font-medium transition-all hover:opacity-90" style={{ backgroundColor: '#c4367b' }}>
          <ShoppingBag className="w-4 h-4 inline mr-2" />
          Belanja Lagi
        </Link>
      </div>
    </div>
  )
}