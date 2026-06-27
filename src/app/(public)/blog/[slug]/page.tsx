import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Clock } from 'lucide-react'

interface BlogDetailPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: BlogDetailPageProps) {
  const { slug } = await params

  const post = await prisma.blogPost.findUnique({
    where: { slug },
  })

  if (!post) {
    return {
      title: 'Blog Post Not Found',
    }
  }

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || 'Blog post',
    openGraph: {
      title: post.title,
      description: post.excerpt || 'Blog post',
      images: post.ogImageUrl || post.coverImageUrl ? [post.ogImageUrl || post.coverImageUrl || ''] : [],
    },
  }
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params

  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      category: true,
      tags: true,
    },
  })

  if (!post) {
    notFound()
  }

  const settings = await prisma.settings.findUnique({
    where: { id: 'default' },
  })

  const primaryColor = settings?.colorPrimary || '#c4367b'

  // Get related posts
  const relatedPosts = await prisma.blogPost.findMany({
    where: {
      categoryId: post.categoryId,
      id: { not: post.id },
      status: 'PUBLISHED',
    },
    take: 3,
    include: { category: true },
  })

  const formatDate = (date: Date | null) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  // Parse content (support untuk newline)
  const parsedContent = post.content.split('\n').map((line, i) => {
    // Handle heading
    if (line.startsWith('# ')) {
      return <h1 key={i} className="text-3xl font-bold mt-8 mb-4">{line.replace('# ', '')}</h1>
    }
    if (line.startsWith('## ')) {
      return <h2 key={i} className="text-2xl font-bold mt-6 mb-3">{line.replace('## ', '')}</h2>
    }
    if (line.startsWith('### ')) {
      return <h3 key={i} className="text-xl font-bold mt-4 mb-2">{line.replace('### ', '')}</h3>
    }
    // Handle list
    if (line.startsWith('- ')) {
      return <li key={i} className="ml-4 text-gray-600">{line.replace('- ', '')}</li>
    }
    // Handle bold
    if (line.includes('**')) {
      const parts = line.split('**')
      return (
        <p key={i} className="text-gray-700 leading-relaxed">
          {parts.map((part, idx) => (
            idx % 2 === 1 ? <strong key={idx}>{part}</strong> : part
          ))}
        </p>
      )
    }
    // Regular paragraph
    if (line.trim()) {
      return <p key={i} className="text-gray-700 leading-relaxed mb-3">{line}</p>
    }
    return <br key={i} />
  })

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-[#c4367b]">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/blog" className="hover:text-[#c4367b]">Blog</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">{post.title}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          {post.category && (
            <span
              className="text-sm font-medium px-3 py-1 rounded-full"
              style={{
                backgroundColor: `${primaryColor}15`,
                color: primaryColor,
              }}
            >
              {post.category.name}
            </span>
          )}
          {post.tags.map((tag) => (
            <span
              key={tag.id}
              className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
            >
              #{tag.name}
            </span>
          ))}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          {post.title}
        </h1>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {post.publishedAt ? formatDate(post.publishedAt) : 'Draft'}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {Math.ceil(post.content.length / 1000)} min read
          </div>
        </div>
      </div>

      {/* Cover Image */}
      {post.coverImageUrl && (
        <div className="relative w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden mb-8">
          <Image
            src={post.coverImageUrl}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Content */}
      <div className="prose prose-lg max-w-none">
        {parsedContent}
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="mt-16 pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Related Posts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map((related) => (
              <Link
                key={related.id}
                href={`/blog/${related.slug}`}
                className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1"
              >
                {related.coverImageUrl ? (
                  <div className="aspect-video bg-gray-100 relative overflow-hidden">
                    <Image
                      src={related.coverImageUrl}
                      alt={related.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                    <span className="text-4xl">📝</span>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 group-hover:text-[#c4367b] transition-colors line-clamp-2">
                    {related.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {related.excerpt || 'Read more...'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
