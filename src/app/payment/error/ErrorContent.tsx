'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { XCircle, Home, RefreshCw, Calendar, User, Phone, Mail, MapPin, CreditCard, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'

interface Booking {
  id: string
  customerName: string
  whatsapp: string
  email: string | null
  address: string | null
  bookingDate: string
  bookingTime: string
  status: string
  service: { name: string; price: number; duration: number } | null
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerWhatsapp: string
  email: string | null
  address: string
  total: number
  paymentMethodName: string
  status: string
  items: { productName: string; quantity: number }[]
}

export default function ErrorContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get('order_id')
  const errorMsg = searchParams.get('error') || ''
  const [lastBookingService, setLastBookingService] = useState<string>('')
  const [data, setData] = useState<any>(null)
  const [isBooking, setIsBooking] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedServiceId = localStorage.getItem('last_booking_service')
    if (savedServiceId) {
      setLastBookingService(savedServiceId)
    }
  }, [])

  useEffect(() => {
    if (!orderId) {
      router.push('/')
      return
    }
    fetchData()
    toast.error('❌ Pembayaran gagal', { duration: 5000 })
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
    } catch (err: any) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!orderId) return null

  const handleRetry = () => {
    if (isBooking) {
      const serviceId = lastBookingService || ''
      if (serviceId) {
        router.push(`/booking/booking?service=${serviceId}`)
      } else {
        router.push('/booking')
      }
    } else {
      router.push('/cart')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">❌ Pembayaran Gagal</h1>
        <p className="text-gray-600 mb-2">Terjadi kesalahan saat memproses pembayaran.</p>
        {errorMsg && <p className="text-sm text-red-500 mb-4 bg-red-100/50 p-3 rounded-lg">{errorMsg}</p>}
        <p className="text-sm text-gray-500 mb-6">Silakan coba lagi dengan metode pembayaran yang lain, atau hubungi admin jika masalah berlanjut.</p>

        {orderId && (
          <div className="bg-white rounded-lg p-4 mb-6 inline-block shadow-sm">
            <p className="text-xs text-gray-500">ID Transaksi</p>
            <p className="font-mono font-bold text-gray-800 text-sm">{orderId}</p>
          </div>
        )}

        {/* Info Singkat */}
        {data && (
          <div className="bg-white rounded-lg p-4 mb-6 text-left space-y-1 text-sm">
            <p><span className="text-gray-500">Pelanggan:</span> {data.customerName || data.customer_name}</p>
            <p><span className="text-gray-500">Total:</span> <span className="font-bold text-pink-500">Rp {(data.total || data.price || 0).toLocaleString()}</span></p>
            {isBooking && data.service && (
              <p><span className="text-gray-500">Layanan:</span> {data.service.name}</p>
            )}
            {!isBooking && data.items && (
              <p><span className="text-gray-500">Produk:</span> {data.items.length} item</p>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={handleRetry} 
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-all hover:opacity-90" 
            style={{ backgroundColor: '#c4367b' }}
          >
            <RefreshCw className="w-4 h-4" /> {isBooking ? 'Coba Booking Lagi' : 'Coba Lagi'}
          </button>
          <Link href="/" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 font-medium transition-all hover:bg-gray-50" style={{ borderColor: '#c4367b', color: '#c4367b' }}>
            <Home className="w-4 h-4" /> Kembali ke Home
          </Link>
        </div>

        <div className="mt-6 p-4 bg-red-100/50 rounded-lg text-sm text-red-800">
          <p>💡 Pastikan data pembayaran Anda sudah benar.</p>
          <p className="mt-1">📧 Jika masalah berlanjut, hubungi admin via WhatsApp/Email.</p>
        </div>
      </div>
    </div>
  )
}