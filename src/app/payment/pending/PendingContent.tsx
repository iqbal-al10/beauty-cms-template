'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Clock, Home, RefreshCw, Calendar, User, Phone, Mail, MapPin, CreditCard, DollarSign } from 'lucide-react'
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

export default function PendingContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get('order_id')
  const [countdown, setCountdown] = useState(30)
  const [isChecking, setIsChecking] = useState(false)
  const [data, setData] = useState<any>(null)
  const [isBooking, setIsBooking] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderId) {
      router.push('/')
      return
    }
    fetchData()
    toast.loading('⏳ Menunggu pembayaran...', { duration: 3000 })
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
      toast.error('Gagal memuat detail pesanan')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleCheckStatus = async () => {
    setIsChecking(true)
    try {
      console.log('🔍 Checking status for orderId:', orderId)
      
      const res = await fetch(`/api/payment/status?orderId=${orderId}`)
      
      console.log('📊 API response status:', res.status)
      
      if (!res.ok) {
        const text = await res.text()
        console.error('❌ API response body:', text)
        throw new Error('Gagal mengecek status')
      }
      
      const result = await res.json()
      console.log('📊 Status check result:', JSON.stringify(result, null, 2))
      
      if (result.status === 'settlement' || result.paymentStatus === 'PAID') {
        toast.success('✅ Pembayaran berhasil!')
        window.location.href = `/payment/success?order_id=${orderId}`
      } else if (result.status === 'deny' || result.paymentStatus === 'FAILED') {
        toast.error('❌ Pembayaran gagal')
        window.location.href = `/payment/error?order_id=${orderId}`
      } else {
        toast.loading('⏳ Masih menunggu pembayaran...')
        setCountdown(30)
      }
    } catch (error) {
      console.error('Error checking status:', error)
      toast.error('Gagal mengecek status')
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    if (countdown === 0 && !loading) {
      handleCheckStatus()
    }
  }, [countdown, loading])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Clock className="w-10 h-10 text-yellow-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">⏳ Menunggu Pembayaran</h1>
        <p className="text-gray-600 mb-2">Kami menunggu konfirmasi pembayaran Anda.</p>
        <p className="text-sm text-gray-500 mb-6">
          Silakan selesaikan pembayaran Anda melalui metode yang telah dipilih.
          <br />Halaman ini akan otomatis terupdate setelah pembayaran berhasil.
        </p>

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

        <div className="mb-6">
          <p className="text-sm text-gray-500">Cek status otomatis dalam <span className="font-bold text-yellow-600">{countdown}</span> detik</p>
          <div className="w-full max-w-xs mx-auto bg-gray-200 rounded-full h-2 mt-2">
            <div className="h-2 rounded-full transition-all duration-1000" style={{ width: `${(countdown / 30) * 100}%`, backgroundColor: '#eab308' }} />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={handleCheckStatus} 
            disabled={isChecking} 
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-all hover:opacity-90 disabled:opacity-50" 
            style={{ backgroundColor: '#c4367b' }}
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Memeriksa...' : 'Cek Status Sekarang'}
          </button>
          <Link href="/" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 font-medium transition-all hover:bg-gray-50" style={{ borderColor: '#c4367b', color: '#c4367b' }}>
            <Home className="w-4 h-4" /> Kembali ke Home
          </Link>
        </div>

        <div className="mt-6 p-4 bg-yellow-100/50 rounded-lg text-sm text-yellow-800">
          <p>💡 Jika sudah melakukan pembayaran, tunggu beberapa saat hingga sistem memproses.</p>
          <p className="mt-1">📱 Atau hubungi admin via WhatsApp untuk konfirmasi manual.</p>
        </div>
      </div>
    </div>
  )
}