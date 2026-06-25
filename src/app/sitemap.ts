import { prisma } from '@/lib/prisma'
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Static pages dengan lastModified
  const staticPages = [
    { url: '', priority: 1.0, changeFrequency: 'daily' as const, lastModified: new Date() },
    { url: '/products', priority: 0.8, changeFrequency: 'daily' as const, lastModified: new Date() },
    { url: '/blog', priority: 0.8, changeFrequency: 'weekly' as const, lastModified: new Date() },
    { url: '/about', priority: 0.6, changeFrequency: 'monthly' as const, lastModified: new Date() },
    { url: '/contact', priority: 0.6, changeFrequency: 'monthly' as const, lastModified: new Date() },
    { url: '/booking', priority: 0.7, changeFrequency: 'weekly' as const, lastModified: new Date() },
  ]

  // Get published products
  const products = await prisma.product.findMany({
    where: { status: 'PUBLISHED' },
    select: { slug: true, updatedAt: true },
  })

  const productPages = products.map((product) => ({
    url: `/products/${product.slug}`,
    lastModified: product.updatedAt,
    priority: 0.7,
    changeFrequency: 'weekly' as const,
  }))

  // Get published blog posts
  const blogPosts = await prisma.blogPost.findMany({
    where: { status: 'PUBLISHED' },
    select: { slug: true, updatedAt: true },
  })

  const blogPages = blogPosts.map((post) => ({
    url: `/blog/${post.slug}`,
    lastModified: post.updatedAt,
    priority: 0.7,
    changeFrequency: 'weekly' as const,
  }))

  // Combine all
  const allPages = [...staticPages, ...productPages, ...blogPages]

  return allPages.map((page) => ({
    url: `${baseUrl}${page.url}`,
    lastModified: page.lastModified || new Date(),
    changeFrequency: page.changeFrequency || 'weekly',
    priority: page.priority || 0.5,
  }))
}
