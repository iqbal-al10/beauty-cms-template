import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Star } from 'lucide-react'

export default async function HomePage() {
  const featuredProducts = await prisma.product.findMany({
    where: { isFeatured: true, status: 'PUBLISHED' },
    take: 4,
    include: { category: true },
  })

  const testimonials = await prisma.testimonial.findMany({
    where: { isPublished: true },
    take: 3,
    orderBy: { createdAt: 'desc' },
  })

  const settings = await prisma.settings.findUnique({
    where: { id: 'default' },
  })

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-pink-100 to-purple-100 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4">
            {settings?.siteName || 'Beauty Studio'}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover premium skincare and beauty products for your glowing skin
          </p>
          <Link
            href="/products"
            className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors inline-block"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">
            Featured Products
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 border border-gray-100"
              >
                <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-4xl">🧴</span>
                </div>
                <h3 className="font-semibold text-gray-800">{product.name}</h3>
                <p className="text-sm text-gray-500">{product.category?.name}</p>
                <p className="text-lg font-bold text-pink-500 mt-2">
                  Rp {product.price.toLocaleString()}
                </p>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link
              href="/products"
              className="text-pink-500 hover:text-pink-600 font-medium"
            >
              View All Products →
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">
              What Our Customers Say
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex text-yellow-400 mb-2">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">"{testimonial.reviewText}"</p>
                  <p className="font-semibold text-gray-800">- {testimonial.customerName}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
