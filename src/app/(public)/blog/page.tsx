'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImageUrl: string | null
  status: string
  publishedAt: string | null
  category: { name: string } | null
  tags: Array<{ id: string; name: string }>
}

interface BlogCategory {
  id: string
  name: string
  slug: string
}

interface Settings {
  colorPrimary: string
  headingFontSize: string
  bodyFontSize: string
  smallFontSize: string
  fontFamily: string
}

function BlogContent() {
  const searchParams = useSearchParams()
  const categorySlug = searchParams.get('category') || ''
  const searchQuery = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = 9

  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [totalPosts, setTotalPosts] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<Settings | null>(null)

  const primaryColor = '#c4367b'

  useEffect(() => {
    fetch('/api/public/settings')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setSettings(d) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (categorySlug) params.set('category', categorySlug)
        if (searchQuery) params.set('search', searchQuery)
        params.set('page', String(page))
        params.set('limit', String(limit))

        const [postsRes, categoriesRes] = await Promise.all([
          fetch(`/api/public/blogs?${params}`),
          fetch('/api/public/blog-categories?limit=50'),
        ])

        if (postsRes.ok) {
          const data = await postsRes.json()
          setPosts(data.data || data || [])
          setTotalPosts(data.total || 0)
          setTotalPages(data.totalPages || 1)
        }

        if (categoriesRes.ok) {
          const data = await categoriesRes.json()
          setCategories(data || [])
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [categorySlug, searchQuery, page])

  const formatDate = (date: string | null) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const headingFontSize = settings?.headingFontSize || '32px'
  const bodyFontSize = settings?.bodyFontSize || '16px'
  const smallFontSize = settings?.smallFontSize || '14px'
  const fontFamily = settings?.fontFamily || 'Inter'

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8" style={{ fontFamily }}>
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-32 animate-pulse" />
          <div className="h-5 bg-gray-200 rounded w-64 mt-2 animate-pulse" />
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-9 bg-gray-200 rounded-full w-20 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border overflow-hidden animate-pulse">
              <div className="aspect-video bg-gray-200" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-16" />
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8" style={{ fontFamily: fontFamily }}>
      <div className="mb-8">
        <h1 className="font-bold text-gray-800" style={{ fontSize: headingFontSize }}>Blog</h1>
        <p className="text-gray-500 mt-1" style={{ fontSize: bodyFontSize }}>
          Tips, inspiration, and insights from our experts
        </p>
      </div>

      <div className="mb-4">
        <form action="/blog" method="GET" className="w-full">
          {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
          <div className="relative">
            <input
              type="text"
              name="search"
              placeholder="Search blog posts..."
              defaultValue={searchQuery}
              className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-colors"
              style={{ '--tw-ring-color': primaryColor, fontSize: bodyFontSize } as React.CSSProperties}
            />
            <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0118 0z"/>
            </svg>
          </div>
        </form>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <a
          href="/blog"
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!categorySlug ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          style={!categorySlug ? { backgroundColor: primaryColor, fontSize: smallFontSize } : { fontSize: smallFontSize }}
        >
          All
        </a>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/blog?category=${category.slug}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${categorySlug === category.slug ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            style={categorySlug === category.slug ? { backgroundColor: primaryColor, fontSize: smallFontSize } : { fontSize: smallFontSize }}
          >
            {category.name}
          </Link>
        ))}
      </div>

      <p className="text-sm text-gray-500 mb-6" style={{ fontSize: smallFontSize }}>
        Showing {posts.length} of {totalPosts} posts
      </p>

      {posts.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <h3 className="text-lg font-semibold text-gray-600" style={{ fontSize: headingFontSize }}>No posts found</h3>
          <p className="text-gray-400 text-sm" style={{ fontSize: bodyFontSize }}>Try adjusting your search or filter</p>
          <Link href="/blog" className="inline-block mt-4 px-6 py-2 rounded-lg text-white text-sm font-medium transition-colors hover:opacity-90" style={{ backgroundColor: primaryColor, fontSize: smallFontSize }}>Clear filters</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1"
              style={{ borderColor: `${primaryColor}20` }}
            >
              {post.coverImageUrl ? (
                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                  <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                  <span className="text-5xl">📝</span>
                </div>
              )}
              <div className="p-5">
                {post.category && (
                  <span className="inline-block text-xs font-medium px-2 py-1 rounded-full mb-2" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor, fontSize: smallFontSize }}>
                    {post.category.name}
                  </span>
                )}
                <h3 className="font-semibold text-gray-800 group-hover:text-[#c4367b] transition-colors line-clamp-2" style={{ fontSize: bodyFontSize }}>{post.title}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2" style={{ fontSize: smallFontSize }}>{post.excerpt || 'Read more...'}</p>
                <div className="flex items-center gap-2 mt-3 text-xs text-gray-400" style={{ fontSize: smallFontSize }}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  {post.publishedAt ? formatDate(post.publishedAt) : 'Draft'}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          {Array.from({ length: totalPages }).map((_, i) => {
            const pageNum = i + 1
            const isActive = pageNum === page
            return (
              <Link key={i} href={`/blog?page=${pageNum}`} className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${isActive ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} style={isActive ? { backgroundColor: primaryColor, fontSize: smallFontSize } : { fontSize: smallFontSize }}>
                {pageNum}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function BlogPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#c4367b' }} />
      </div>
    }>
      <BlogContent />
    </Suspense>
  )
}