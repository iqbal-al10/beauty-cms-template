import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Calendar } from 'lucide-react'

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const post = await prisma.blogPost.findUnique({
    where: { slug },
  })

  if (!post || post.status !== 'PUBLISHED') {
    notFound()
  }

  const settings = await prisma.settings.findUnique({
    where: { id: 'default' },
  })

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || post.content.substring(0, 200),
    author: {
      '@type': 'Organization',
      name: settings?.siteName || 'Beauty Studio',
    },
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt,
    image: post.coverImageUrl || '/placeholder-blog.jpg',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">{post.title}</h1>
        
        <div className="flex items-center text-sm text-gray-500 mb-8">
          <Calendar className="w-4 h-4 mr-1" />
          {post.publishedAt 
            ? new Date(post.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
            : 'Draf'
          }
        </div>

        <div className="prose max-w-none">
          {post.content.split('\n').map((paragraph, index) => (
            <p key={index} className="text-gray-600 mb-4">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <a href="/blog" className="text-pink-500 hover:text-pink-600">
            ← Kembali ke Blog
          </a>
        </div>
      </div>
    </>
  )
}
