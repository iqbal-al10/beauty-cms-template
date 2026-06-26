import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
  })

  if (!product) return {}

  const settings = await prisma.settings.findUnique({
    where: { id: 'default' },
  })

  return {
    title: product.metaTitle || product.name,
    description: product.metaDescription || product.description || '',
    alternates: {
      canonical: product.canonicalUrl || undefined,
    },
    openGraph: {
      title: product.metaTitle || product.name,
      description: product.metaDescription || product.description || '',
      images: [product.ogImageUrl || settings?.defaultOgImage || '/og-image.jpg'],
    },
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
    },
  })

  if (!product) {
    notFound()
  }

  const settings = await prisma.settings.findUnique({
    where: { id: 'default' },
  })

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || '',
    image: '/placeholder-product.jpg',
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'IDR',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    brand: {
      '@type': 'Brand',
      name: settings?.siteName || 'Beauty Studio',
    },
  }

  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      status: 'PUBLISHED',
    },
    take: 4,
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-gray-100 rounded-xl aspect-square flex items-center justify-center">
            <span className="text-6xl">🧴</span>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
            <p className="text-gray-500 mb-4">{product.category?.name}</p>
            <p className="text-3xl font-bold text-pink-500 mb-4">
              Rp {product.price.toLocaleString()}
            </p>
            <p className="text-gray-600 mb-6">{product.description}</p>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm text-gray-500">Stok: {product.stock} unit</span>
              <span className={`px-3 py-1 rounded-full text-sm ${
                product.status === 'PUBLISHED' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {product.status === 'PUBLISHED' ? 'Dipublikasikan' : 'Draf'}
              </span>
            </div>
            <Link
              href={`https://wa.me/${settings?.whatsappNumber || '6281234567890'}?text=Hi, I'm interested in ${product.name}`}
              target="_blank"
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 justify-center transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              Pesan via WhatsApp
            </Link>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">Produk Terkait</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {relatedProducts.map((related) => (
                <Link
                  key={related.id}
                  href={`/products/${related.slug}`}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 border border-gray-100"
                >
                  <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-3xl">🧴</span>
                  </div>
                  <h3 className="font-semibold text-gray-800">{related.name}</h3>
                  <p className="text-lg font-bold text-pink-500">
                    Rp {related.price.toLocaleString()}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
