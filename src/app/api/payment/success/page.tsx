'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get('order_id')

  useEffect(() => {
    if (!orderId) {
      router.push('/')
      return
    }
    toast.success('✅ Pembayaran berhasil!')
  }, [orderId, router])

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Pembayaran Berhasil!</h1>
        <p className="text-gray-600 mb-6">
          Pesanan Anda telah dibayar dan sedang diproses.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-2.5 rounded-lg text-white font-medium hover:opacity-90"
            style={{ backgroundColor: '#c4367b' }}
          >
            Kembali ke Home
          </Link>
          <Link
            href="/products"
            className="px-6 py-2.5 rounded-lg border-2 font-medium hover:bg-gray-50"
            style={{ borderColor: '#c4367b', color: '#c4367b' }}
          >
            Belanja Lagi
          </Link>
        </div>
      </div>
    </div>
  )
}