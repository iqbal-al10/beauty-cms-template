'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { XCircle, Home, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ErrorContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get('order_id')
  const errorMsg = searchParams.get('error') || ''

  useEffect(() => {
    if (!orderId) {
      router.push('/')
      return
    }
    toast.error('❌ Pembayaran gagal', { duration: 5000 })
  }, [orderId, router])

  if (!orderId) return null

  const handleRetry = () => {
    router.push('/cart')
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

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={handleRetry} className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-all hover:opacity-90" style={{ backgroundColor: '#c4367b' }}>
            <RefreshCw className="w-4 h-4" /> Coba Lagi
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