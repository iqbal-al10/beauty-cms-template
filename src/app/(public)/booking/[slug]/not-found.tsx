import Link from 'next/link'

export default function BookingNotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-md mx-auto">
        <div className="text-6xl mb-6">🔍</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Layanan Tidak Ditemukan
        </h1>
        <p className="text-gray-500 mb-8">
          Layanan yang Anda cari tidak tersedia atau telah dihapus.
        </p>
        <Link
          href="/booking"
          className="inline-block px-6 py-3 rounded-full text-white font-semibold transition-colors hover:opacity-90"
          style={{ backgroundColor: '#c4367b' }}
        >
          Kembali ke Booking
        </Link>
      </div>
    </div>
  )
}