'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Clock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PaymentPendingPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get('order_id')

  useEffect(() => {
    if (!orderId) {
      router.push('/')
      return
    }
    toast.info('⏳ Menunggu pembayaran...')
  }, [orderId, router])

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-10 h-10 text-yellow-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Menunggu Pembayaran</h1>
        <p className="text-gray-600 mb-6">
          Kami menunggu konfirmasi pembayaran Anda. Silakan selesaikan pembayaran Anda.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-2.5 rounded-lg text-white font-medium hover:opacity-90"
            style={{ backgroundColor: '#c4367b' }}
          >
            Kembali ke Home
          </Link>
        </div>
      </div>
    </div>
  )
}