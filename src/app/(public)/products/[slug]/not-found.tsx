import Link from 'next/link'

export default function ProductNotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-md mx-auto">
        <div className="text-6xl mb-6">🔍</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Product Not Found
        </h1>
        <p className="text-gray-500 mb-8">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <Link
          href="/products"
          className="inline-block px-6 py-3 rounded-lg text-white font-semibold transition-colors hover:opacity-90"
          style={{ backgroundColor: '#c4367b' }}
        >
          Browse Products
        </Link>
      </div>
    </div>
  )
}
