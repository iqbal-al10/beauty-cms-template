import Link from 'next/link'
import { prisma } from '@/lib/prisma'

interface BlogPageProps {
  searchParams: Promise<{
    category?: string
    search?: string
    page?: string
  }>
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams
  const categorySlug = params?.category || ''
  const searchQuery = params?.search || ''
  const page = parseInt(params?.page || '1', 10)
  const limit = 9
  const skip = (page - 1) * limit

  const settings = await prisma.settings.findUnique({
    where: { id: 'default' },
  })

  const primaryColor = settings?.colorPrimary || '#c4367b'
  const headingFontSize = settings?.headingFontSize || '32px'
  const bodyFontSize = settings?.bodyFontSize || '16px'
  const smallFontSize = settings?.smallFontSize || '14px'
  const fontFamily = settings?.fontFamily || 'Inter'

  const filter: any = {
    status: 'PUBLISHED',
  }

  if (categorySlug) {
    filter.category = {
      slug: categorySlug,
    }
  }

  if (searchQuery) {
    filter.OR = [
      { title: { contains: searchQuery, mode: 'insensitive' } },
      { excerpt: { contains: searchQuery, mode: 'insensitive' } },
      { content: { contains: searchQuery, mode: 'insensitive' } },
    ]
  }

  const [posts, totalPosts, categories] = await Promise.all([
    prisma.blogPost.findMany({
      where: filter,
      include: {
        category: true,
        tags: true,
      },
      orderBy: { publishedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.blogPost.count({ where: filter }),
    prisma.blogCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    }),
  ])

  const totalPages = Math.ceil(totalPosts / limit)

  const formatDate = (date: Date | null) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className="container mx-auto px-4 py-8" style={{ fontFamily: fontFamily }}>
      <div className="mb-8">
        <h1 className="font-bold text-gray-800" style={{ fontSize: headingFontSize }}>Blog</h1>
        <p className="text-gray-500 mt-1" style={{ fontSize: bodyFontSize }}>
          Tips, inspiration, and insights from our experts
        </p>
      </div>

      {/* ===== SEARCH ===== */}
      <div className="mb-4">
        <form action="/blog" method="GET" className="w-full">
          {categorySlug && (
            <input type="hidden" name="category" value={categorySlug} />
          )}
          <div className="relative">
            <input
              type="text"
              name="search"
              placeholder="Search blog posts..."
              defaultValue={searchQuery}
              className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-colors"
              style={{ 
                '--tw-ring-color': primaryColor,
                fontSize: bodyFontSize,
              } as React.CSSProperties}
            />
            <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0118 0z"/>
            </svg>
          </div>
        </form>
      </div>

      {/* ===== FILTER KATEGORI ===== */}
      <div className="flex flex-wrap gap-2 mb-6">
        <a
          href="/blog"
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !categorySlug
              ? 'text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          style={
            !categorySlug 
              ? { backgroundColor: primaryColor, fontSize: smallFontSize } 
              : { fontSize: smallFontSize }
          }
        >
          All
        </a>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/blog?category=${category.slug}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              categorySlug === category.slug
                ? 'text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            style={
              categorySlug === category.slug 
                ? { backgroundColor: primaryColor, fontSize: smallFontSize } 
                : { fontSize: smallFontSize }
            }
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
          <Link
            href="/blog"
            className="inline-block mt-4 px-6 py-2 rounded-lg text-white text-sm font-medium transition-colors hover:opacity-90"
            style={{ backgroundColor: primaryColor, fontSize: smallFontSize }}
          >
            Clear filters
          </Link>
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
                  <img
                    src={post.coverImageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                  <span className="text-5xl">📝</span>
                </div>
              )}
              <div className="p-5">
                {post.category && (
                  <span
                    className="inline-block text-xs font-medium px-2 py-1 rounded-full mb-2"
                    style={{
                      backgroundColor: `${primaryColor}15`,
                      color: primaryColor,
                      fontSize: smallFontSize,
                    }}
                  >
                    {post.category.name}
                  </span>
                )}
                <h3 className="font-semibold text-gray-800 group-hover:text-[#c4367b] transition-colors line-clamp-2" style={{ fontSize: bodyFontSize }}>
                  {post.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2" style={{ fontSize: smallFontSize }}>
                  {post.excerpt || 'Read more...'}
                </p>
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
              <Link
                key={i}
                href={`/blog?page=${pageNum}`}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={
                  isActive 
                    ? { backgroundColor: primaryColor, fontSize: smallFontSize } 
                    : { fontSize: smallFontSize }
                }
              >
                {pageNum}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}