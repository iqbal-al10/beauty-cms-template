import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import ShareButton from '@/components/public/ShareButton'
import { ArrowLeft, Calendar, Clock } from 'lucide-react'

const PRESET_COLORS = [
  { value: 'bg-red-500', hex: '#EF4444', label: 'Red' },
  { value: 'bg-blue-500', hex: '#3B82F6', label: 'Blue' },
  { value: 'bg-green-500', hex: '#22C55E', label: 'Green' },
  { value: 'bg-yellow-500', hex: '#EAB308', label: 'Yellow' },
  { value: 'bg-purple-500', hex: '#A855F7', label: 'Purple' },
  { value: 'bg-pink-500', hex: '#EC4899', label: 'Pink' },
  { value: 'bg-orange-500', hex: '#F97316', label: 'Orange' },
  { value: 'bg-teal-500', hex: '#14B8A6', label: 'Teal' },
  { value: 'bg-indigo-500', hex: '#6366F1', label: 'Indigo' },
  { value: 'bg-rose-500', hex: '#F43F5E', label: 'Rose' },
]

const getTagColor = (color: string | null): string => {
  if (!color) return '#6B7280'
  if (color.startsWith('#')) return color
  const preset = PRESET_COLORS.find(p => p.value === color)
  if (preset) return preset.hex
  return '#6B7280'
}

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
  const headingFontSize = settings?.headingFontSize || '32px'
  const bodyFontSize = settings?.bodyFontSize || '16px'
  const smallFontSize = settings?.smallFontSize || '14px'
  const fontFamily = settings?.fontFamily || 'Inter'

  const tags = post.tags || []

  // Get related posts
  const relatedPosts = await prisma.blogPost.findMany({
    where: {
      categoryId: post.categoryId,
      id: { not: post.id },
      status: 'PUBLISHED',
    },
    take: 4,
    include: { 
      category: true,
      tags: true,
    },
  })

  const formatDate = (date: Date | null) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/blog/${post.slug}`

  // Parse content (support untuk newline)
  const parsedContent = post.content.split('\n').map((line, i) => {
    if (line.startsWith('# ')) {
      return <h1 key={i} className="font-bold mt-8 mb-4" style={{ fontSize: headingFontSize, color: '#1f2937' }}>{line.replace('# ', '')}</h1>
    }
    if (line.startsWith('## ')) {
      return <h2 key={i} className="font-bold mt-6 mb-3" style={{ fontSize: bodyFontSize, color: '#1f2937' }}>{line.replace('## ', '')}</h2>
    }
    if (line.startsWith('### ')) {
      return <h3 key={i} className="font-bold mt-4 mb-2" style={{ fontSize: bodyFontSize, color: '#1f2937' }}>{line.replace('### ', '')}</h3>
    }
    if (line.startsWith('- ')) {
      return <li key={i} className="ml-4" style={{ fontSize: bodyFontSize, color: '#4b5563' }}>{line.replace('- ', '')}</li>
    }
    if (line.includes('**')) {
      const parts = line.split('**')
      return (
        <p key={i} className="leading-relaxed mb-3" style={{ fontSize: bodyFontSize, color: '#4b5563' }}>
          {parts.map((part, idx) => (
            idx % 2 === 1 ? <strong key={idx} style={{ color: '#1f2937' }}>{part}</strong> : part
          ))}
        </p>
      )
    }
    if (line.trim()) {
      return <p key={i} className="leading-relaxed mb-3" style={{ fontSize: bodyFontSize, color: '#4b5563' }}>{line}</p>
    }
    return <br key={i} />
  })

  return (
    <div className="container mx-auto px-4 py-8" style={{ fontFamily: fontFamily }}>
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2" style={{ fontSize: smallFontSize }}>
        <Link href="/" className="hover:text-[#c4367b] flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>
        <span className="mx-1">/</span>
        <Link href="/blog" className="hover:text-[#c4367b]">Blog</Link>
        <span className="mx-1">/</span>
        <span className="text-gray-800">{post.title}</span>
      </nav>

      {/* ===== LAYOUT: KIRI GAMBAR, KANAN CONTENT ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ===== KIRI: GAMBAR DENGAN CATEGORY DI POJOK KIRI ATAS ===== */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl aspect-square flex items-center justify-center relative overflow-hidden">
          {post.coverImageUrl ? (
            <img 
              src={post.coverImageUrl} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-8xl">📝</span>
          )}
          
          {/* 🔥 CATEGORY & TAGS DI POJOK KIRI ATAS GAMBAR */}
          <div className="absolute top-4 left-4 flex flex-col gap-1">
            {post.category && (
              <span
                className="text-xs font-bold px-3 py-1 rounded-full text-white truncate max-w-[120px] shadow-md"
                style={{
                  backgroundColor: primaryColor,
                  fontSize: smallFontSize,
                }}
              >
                {post.category.name}
              </span>
            )}
            {tags.slice(0, 2).map((tag) => (
              <span
                key={tag.id}
                className="text-xs font-bold px-3 py-1 rounded-full text-white truncate max-w-[120px] shadow-md"
                style={{ backgroundColor: getTagColor(tag.color), fontSize: smallFontSize }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>

        {/* ===== KANAN: TITLE, DATE, CONTENT ===== */}
        <div>
          {/* 🔥 TITLE DI KANAN ATAS */}
          <h1 className="font-bold text-gray-800 mb-2" style={{ fontSize: headingFontSize }}>
            {post.title}
          </h1>

          {/* 🔥 DATE & READ TIME DI KANAN ATAS */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-6" style={{ fontSize: smallFontSize }}>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {post.publishedAt ? formatDate(post.publishedAt) : 'Draft'}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {Math.ceil(post.content.length / 1000)} min read
            </div>
          </div>

          {/* CONTENT */}
          <div className="prose prose-lg max-w-none">
            {parsedContent}
          </div>

          {/* SHARE */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2" style={{ fontSize: smallFontSize }}>Share this post:</p>
            <div className="flex gap-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${post.title} - ${shareUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm transition-colors"
                style={{ fontSize: smallFontSize }}
              >
                💬 WhatsApp
              </a>
              <ShareButton
                title={post.title}
                text={post.excerpt || ''}
                url={shareUrl}
              />
            </div>
          </div>
        </div>
      </div>

      {/* RELATED POSTS */}
      {relatedPosts.length > 0 && (
        <div className="mt-16">
          <h2 className="font-bold text-gray-800 mb-6" style={{ fontSize: headingFontSize }}>Related Posts</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedPosts.map((related) => {
              const relatedTags = related.tags || []
              return (
                <Link
                  key={related.id}
                  href={`/blog/${related.slug}`}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1"
                  style={{ borderColor: `${primaryColor}20` }}
                >
                  <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 relative">
                    {related.coverImageUrl ? (
                      <img 
                        src={related.coverImageUrl} 
                        alt={related.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <span className="text-4xl">📝</span>
                    )}
                    {relatedTags.length > 0 && (
                      <div className="absolute top-2 left-2 flex flex-col gap-0.5">
                        {relatedTags.slice(0, 1).map((tag) => (
                          <span
                            key={tag.id}
                            className="text-[8px] font-bold px-1.5 py-0.5 rounded-full text-white truncate max-w-[60px]"
                            style={{ backgroundColor: getTagColor(tag.color) }}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-800 group-hover:text-[#c4367b] transition-colors line-clamp-1 text-sm" style={{ fontSize: smallFontSize }}>
                      {related.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1" style={{ fontSize: smallFontSize }}>
                      {related.excerpt || 'Read more...'}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}