'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Clock, Home, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PaymentPendingPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get('order_id')
  const [countdown, setCountdown] = useState(30)
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    if (!orderId) {
      router.push('/')
      return
    }
    toast.loading('⏳ Menunggu pembayaran...', { duration: 3000 })
  }, [orderId, router])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleCheckStatus = async () => {
    setIsChecking(true)
    try {
      const res = await fetch(`/api/payment/status?orderId=${orderId}`)
      const data = await res.json()
      
      if (data.status === 'PAID' || data.status === 'settlement') {
        toast.success('✅ Pembayaran berhasil!')
        window.location.href = `/payment/success?order_id=${orderId}`
      } else if (data.status === 'FAILED' || data.status === 'deny') {
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
    if (countdown === 0) {
      handleCheckStatus()
    }
  }, [countdown])

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Clock className="w-10 h-10 text-yellow-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">⏳ Menunggu Pembayaran</h1>
        
        <p className="text-gray-600 mb-2">
          Kami menunggu konfirmasi pembayaran Anda.
        </p>
        
        <p className="text-sm text-gray-500 mb-6">
          Silakan selesaikan pembayaran Anda melalui metode yang telah dipilih.
          <br />
          Halaman ini akan otomatis terupdate setelah pembayaran berhasil.
        </p>

        {orderId && (
          <div className="bg-white rounded-lg p-4 mb-6 inline-block shadow-sm">
            <p className="text-xs text-gray-500">ID Transaksi</p>
            <p className="font-mono font-bold text-gray-800 text-sm">{orderId}</p>
          </div>
        )}

        <div className="mb-6">
          <p className="text-sm text-gray-500">
            Cek status otomatis dalam <span className="font-bold text-yellow-600">{countdown}</span> detik
          </p>
          <div className="w-full max-w-xs mx-auto bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="h-2 rounded-full transition-all duration-1000"
              style={{ 
                width: `${(countdown / 30) * 100}%`,
                backgroundColor: '#eab308'
              }}
            />
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
          
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 font-medium transition-all hover:bg-gray-50"
            style={{ borderColor: '#c4367b', color: '#c4367b' }}
          >
            <Home className="w-4 h-4" />
            Kembali ke Home
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