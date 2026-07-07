'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Home, ShoppingBag, Download } from 'lucide-react'
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
    toast.success('✅ Pembayaran berhasil!', { duration: 5000 })
  }, [orderId, router])

  // Cek apakah dari booking atau order
  const isBooking = orderId?.startsWith('B-')
  const detailPath = isBooking ? `/booking` : `/products`

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          ✅ Pembayaran Berhasil!
        </h1>
        
        <p className="text-gray-600 mb-2">
          Pesanan Anda telah dibayar dan sedang diproses.
        </p>
        
        <p className="text-sm text-gray-500 mb-6">
          Kami akan segera mengirimkan konfirmasi via WhatsApp/Email.
        </p>

        {/* Order ID */}
        {orderId && (
          <div className="bg-white rounded-lg p-4 mb-6 inline-block shadow-sm">
            <p className="text-xs text-gray-500">ID Transaksi</p>
            <p className="font-mono font-bold text-gray-800 text-sm">{orderId}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-all hover:opacity-90"
            style={{ backgroundColor: '#c4367b' }}
          >
            <Home className="w-4 h-4" />
            Kembali ke Home
          </Link>
          
          <Link
            href={detailPath}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 font-medium transition-all hover:bg-gray-50"
            style={{ borderColor: '#c4367b', color: '#c4367b' }}
          >
            <ShoppingBag className="w-4 h-4" />
            {isBooking ? 'Lihat Layanan' : 'Belanja Lagi'}
          </Link>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-green-100/50 rounded-lg text-sm text-green-800">
          <p>📧 Email konfirmasi akan dikirim ke alamat email Anda.</p>
          <p className="mt-1">📱 Atau hubungi admin via WhatsApp jika ada pertanyaan.</p>
        </div>
      </div>
    </div>
  )
}