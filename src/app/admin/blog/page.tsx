'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye, Layers, RefreshCw, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'

// ===== INTERFACES =====
interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  status: string
  publishedAt: string | null
  createdAt: string
  categoryId: string | null
  category: { id: string; name: string; slug: string } | null
  metaTitle: string | null
  metaDescription: string | null
  canonicalUrl: string | null
  ogImageUrl: string | null
}

interface BlogCategory {
  id: string
  name: string
  slug: string
  description: string | null
  sortOrder: number
  isActive: boolean
  _count?: { posts: number }
}

type TabType = 'posts' | 'categories'

export default function BlogPage() {
  const [activeTab, setActiveTab] = useState<TabType>('posts')

  // ===== POST STATE =====
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [showPostForm, setShowPostForm] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [postForm, setPostForm] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    status: 'DRAFT',
    publishedAt: '',
    categoryId: '',
    metaTitle: '',
    metaDescription: '',
    canonicalUrl: '',
    ogImageUrl: '',
  })

  // ===== CATEGORY STATE =====
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null)
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    sortOrder: 0,
    isActive: true,
  })

  // ===== FETCH FUNCTIONS =====
  const fetchPosts = async () => {
    try {
      setLoadingPosts(true)
      const res = await fetch('/api/admin/blog')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setPosts(data || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Gagal memuat blog posts')
      setPosts([])
    } finally {
      setLoadingPosts(false)
    }
  }

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true)
      const res = await fetch('/api/admin/blog-categories')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setCategories(data || [])
    } catch (error) {
      console.error('Error:', error)
      setCategories([])
    } finally {
      setLoadingCategories(false)
    }
  }

  useEffect(() => {
    fetchPosts()
    fetchCategories()
  }, [])

  // ===== GENERATE SLUG =====
  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').trim()
  }

  // ===== POST ACTIONS =====
  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!postForm.title.trim() || !postForm.slug.trim() || !postForm.content.trim()) {
      toast.error('Title, slug, dan content harus diisi')
      return
    }
    try {
      const url = editingPost ? `/api/admin/blog/${editingPost.id}` : '/api/admin/blog'
      const method = editingPost ? 'PUT' : 'POST'
      let publishedAt = postForm.publishedAt
      if (postForm.status === 'PUBLISHED' && !publishedAt) {
        publishedAt = new Date().toISOString()
      }
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...postForm, publishedAt }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to save')
      }
      toast.success(editingPost ? 'Blog post berhasil diupdate!' : 'Blog post berhasil ditambahkan!')
      fetchPosts()
      handlePostCancel()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Error saat menyimpan blog post')
    }
  }

  const handleDeletePost = async (id: string, title: string) => {
    if (!confirm(`Yakin ingin menghapus post "${title}"?`)) return
    try {
      const res = await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success(`Blog post "${title}" berhasil dihapus!`)
        setPosts(posts.filter(p => p.id !== id))
      } else {
        const error = await res.json()
        toast.error(error.error || 'Gagal menghapus blog post')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error saat menghapus blog post')
    }
  }

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post)
    setPostForm({
      title: post.title,
      slug: post.slug,
      content: post.content || '',
      excerpt: post.excerpt || '',
      status: post.status,
      publishedAt: post.publishedAt ? post.publishedAt.split('T')[0] : '',
      categoryId: post.categoryId || '',
      metaTitle: post.metaTitle || '',
      metaDescription: post.metaDescription || '',
      canonicalUrl: post.canonicalUrl || '',
      ogImageUrl: post.ogImageUrl || '',
    })
    setShowPostForm(true)
  }

  const handlePostCancel = () => {
    setShowPostForm(false)
    setEditingPost(null)
    setPostForm({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      status: 'DRAFT',
      publishedAt: '',
      categoryId: '',
      metaTitle: '',
      metaDescription: '',
      canonicalUrl: '',
      ogImageUrl: '',
    })
    setSelectedTagIds([])
  }

  const togglePostStatus = async (id: string, currentStatus: string, title: string) => {
    try {
      const post = posts.find(p => p.id === id)
      if (!post) {
        toast.error('Post tidak ditemukan')
        return
      }
      const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
      let publishedAt = post.publishedAt
      if (newStatus === 'PUBLISHED' && !publishedAt) {
        publishedAt = new Date().toISOString()
      }
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...post, status: newStatus, publishedAt }),
      })
      if (res.ok) {
        toast.success(`Blog post "${title}" ${newStatus === 'PUBLISHED' ? 'dipublikasikan' : 'di-draft'}`)
        fetchPosts()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Gagal mengubah status')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error saat mengubah status')
    }
  }

  const handleViewPost = (post: BlogPost) => {
    if (post.status === 'DRAFT') {
      toast.error(`"${post.title}" masih berstatus DRAFT. Publikasikan terlebih dahulu untuk dilihat.`)
      return
    }
    window.open(`/blog/${post.slug}`, '_blank')
  }

  // ===== CATEGORY ACTIONS =====
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryForm.name.trim() || !categoryForm.slug.trim()) {
      toast.error('Nama dan slug harus diisi')
      return
    }
    try {
      const url = editingCategory ? `/api/admin/blog-categories/${editingCategory.id}` : '/api/admin/blog-categories'
      const method = editingCategory ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to save')
      }
      toast.success(editingCategory ? 'Kategori berhasil diupdate!' : 'Kategori berhasil ditambahkan!')
      fetchCategories()
      handleCategoryCancel()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal menyimpan kategori')
    }
  }

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus kategori "${name}"?`)) return
    try {
      const res = await fetch(`/api/admin/blog-categories/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete')
      }
      toast.success(`Kategori "${name}" berhasil dihapus!`)
      setCategories(categories.filter(c => c.id !== id))
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal menghapus kategori')
    }
  }

  const handleEditCategory = (category: BlogCategory) => {
    setEditingCategory(category)
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      sortOrder: category.sortOrder,
      isActive: category.isActive,
    })
    setShowCategoryForm(true)
  }

  const handleCategoryCancel = () => {
    setShowCategoryForm(false)
    setEditingCategory(null)
    setCategoryForm({
      name: '',
      slug: '',
      description: '',
      sortOrder: 0,
      isActive: true,
    })
  }

  const toggleCategoryActive = async (id: string, currentStatus: boolean, name: string) => {
    try {
      const category = categories.find(c => c.id === id)
      if (!category) return
      const newStatus = !currentStatus
      const res = await fetch(`/api/admin/blog-categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...category, isActive: newStatus }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update')
      }
      toast.success(`Kategori "${name}" ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`)
      fetchCategories()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal mengubah status')
    }
  }

  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  // Count posts per category
  const getPostCount = (categoryId: string) => {
    return posts.filter(p => p.categoryId === categoryId && p.status === 'PUBLISHED').length
  }

  if (loadingPosts || loadingCategories) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📝 Blog</h1>
        {activeTab === 'posts' && (
          <button
            onClick={() => {
              setEditingPost(null)
              setPostForm({
                title: '',
                slug: '',
                content: '',
                excerpt: '',
                status: 'DRAFT',
                publishedAt: '',
                categoryId: '',
                metaTitle: '',
                metaDescription: '',
                canonicalUrl: '',
                ogImageUrl: '',
              })
              setSelectedTagIds([])
              setShowPostForm(!showPostForm)
            }}
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" /> New Post
          </button>
        )}
        {activeTab === 'categories' && (
          <button
            onClick={() => {
              setEditingCategory(null)
              setCategoryForm({
                name: '',
                slug: '',
                description: '',
                sortOrder: categories.length,
                isActive: true,
              })
              setShowCategoryForm(!showCategoryForm)
            }}
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" /> Tambah Kategori
          </button>
        )}
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'posts'
              ? 'border-pink-500 text-pink-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          📝 Posts ({posts.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'categories'
              ? 'border-pink-500 text-pink-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Layers className="w-4 h-4 inline mr-2" /> Categories ({categories.length})
        </button>
      </div>

      {/* ===== TAB 1: POSTS ===== */}
      {activeTab === 'posts' && (
        <>
          {showPostForm && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6 max-h-[80vh] overflow-y-auto">
              <h2 className="text-lg font-semibold mb-4">{editingPost ? 'Edit Post' : 'New Post'}</h2>
              <form onSubmit={handlePostSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title *</label>
                  <input
                    type="text"
                    required
                    value={postForm.title}
                    onChange={(e) => {
                      const title = e.target.value
                      setPostForm({ ...postForm, title, slug: generateSlug(title) })
                    }}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                    placeholder="Judul blog post"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Slug *</label>
                  <input
                    type="text"
                    required
                    value={postForm.slug}
                    onChange={(e) =>
                      setPostForm({ ...postForm, slug: e.target.value.toLowerCase().replace(/ /g, '-') })
                    }
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                    placeholder="judul-blog-post"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Excerpt</label>
                  <input
                    type="text"
                    value={postForm.excerpt}
                    onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                    placeholder="Short summary..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Content *</label>
                  <textarea
                    rows={6}
                    required
                    value={postForm.content}
                    onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                    placeholder="Write your blog post here..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                      value={postForm.categoryId}
                      onChange={(e) => setPostForm({ ...postForm, categoryId: e.target.value })}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                    >
                      <option value="">No Category</option>
                      {categories.filter(c => c.isActive).map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={postForm.status}
                      onChange={(e) => setPostForm({ ...postForm, status: e.target.value })}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Published Date</label>
                  <input
                    type="date"
                    value={postForm.publishedAt}
                    onChange={(e) => setPostForm({ ...postForm, publishedAt: e.target.value })}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                  />
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">🔍 SEO</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Meta Title</label>
                      <input
                        type="text"
                        value={postForm.metaTitle || ''}
                        onChange={(e) => setPostForm({ ...postForm, metaTitle: e.target.value })}
                        className="mt-1 block w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                        placeholder="SEO title (max 60 chars)"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Meta Description</label>
                      <textarea
                        rows={2}
                        value={postForm.metaDescription || ''}
                        onChange={(e) => setPostForm({ ...postForm, metaDescription: e.target.value })}
                        className="mt-1 block w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                        placeholder="SEO description (max 160 chars)"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Canonical URL</label>
                      <input
                        type="text"
                        value={postForm.canonicalUrl || ''}
                        onChange={(e) => setPostForm({ ...postForm, canonicalUrl: e.target.value })}
                        className="mt-1 block w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                        placeholder="https://example.com/canonical-url"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">OG Image URL</label>
                      <input
                        type="text"
                        value={postForm.ogImageUrl || ''}
                        onChange={(e) => setPostForm({ ...postForm, ogImageUrl: e.target.value })}
                        className="mt-1 block w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                        placeholder="https://example.com/og-image.jpg"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg"
                  >
                    {editingPost ? 'Update' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={handlePostCancel}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {posts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      Belum ada blog post
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{post.title}</div>
                        <div className="text-xs text-gray-500">{post.slug}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {post.category?.name || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => togglePostStatus(post.id, post.status, post.title)}
                          className={`px-2 py-1 text-xs rounded-full transition-colors ${
                            post.status === 'PUBLISHED'
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {post.status === 'PUBLISHED' ? '✅ Published' : '📝 Draft'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {post.publishedAt ? formatDate(post.publishedAt) : '-'}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleViewPost(post)}
                          className={`transition-colors ${
                            post.status === 'PUBLISHED'
                              ? 'text-blue-600 hover:text-blue-800'
                              : 'text-gray-400 cursor-not-allowed'
                          }`}
                          disabled={post.status === 'DRAFT'}
                          title={post.status === 'DRAFT' ? 'Post masih draft' : 'Lihat di frontend'}
                        >
                          <Eye className="w-5 h-5 inline" />
                        </button>
                        <button
                          onClick={() => handleEditPost(post)}
                          className="text-yellow-600 hover:text-yellow-800"
                        >
                          <Edit className="w-5 h-5 inline" />
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id, post.title)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-5 h-5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Total: <span className="font-medium text-gray-700">{posts.length}</span> blog posts
              </p>
            </div>
          </div>
        </>
      )}

      {/* ===== TAB 2: CATEGORIES (Seperti Products/Bookings) ===== */}
      {activeTab === 'categories' && (
        <>
          {showCategoryForm && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
              <h2 className="text-lg font-semibold mb-4">
                {editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
              </h2>
              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nama Kategori *</label>
                    <input
                      type="text"
                      required
                      value={categoryForm.name}
                      onChange={(e) => {
                        const name = e.target.value
                        setCategoryForm({ ...categoryForm, name, slug: generateSlug(name) })
                      }}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                      placeholder="Contoh: Skincare Tips"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Slug *</label>
                    <input
                      type="text"
                      required
                      value={categoryForm.slug}
                      onChange={(e) =>
                        setCategoryForm({ ...categoryForm, slug: e.target.value.toLowerCase().replace(/ /g, '-') })
                      }
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                      placeholder="skincare-tips"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                  <textarea
                    rows={2}
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                    placeholder="Deskripsi kategori..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sort Order</label>
                    <input
                      type="number"
                      value={categoryForm.sortOrder}
                      onChange={(e) =>
                        setCategoryForm({ ...categoryForm, sortOrder: parseInt(e.target.value) || 0 })
                      }
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-6">
                    <input
                      type="checkbox"
                      checked={categoryForm.isActive}
                      onChange={(e) => setCategoryForm({ ...categoryForm, isActive: e.target.checked })}
                      className="w-4 h-4 text-pink-500 rounded border-gray-300"
                    />
                    <label className="text-sm text-gray-700">Aktif</label>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    {editingCategory ? 'Update' : 'Simpan'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCategoryCancel}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah Post</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Belum ada kategori blog
                    </td>
                  </tr>
                ) : (
                  categories.map((category, index) => (
                    <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                        {category.description && (
                          <div className="text-xs text-gray-500">{category.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{category.slug}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                          {getPostCount(category.id)} post
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            toggleCategoryActive(category.id, category.isActive, category.name)
                          }
                          className={`px-2 py-1 text-xs rounded-full transition-colors ${
                            category.isActive
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {category.isActive ? '✅ Aktif' : '❌ Nonaktif'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="text-yellow-600 hover:text-yellow-800"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5 inline" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id, category.name)}
                          className="text-red-600 hover:text-red-800"
                          title="Hapus"
                        >
                          <Trash2 className="w-5 h-5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Total: <span className="font-medium text-gray-700">{categories.length}</span> kategori
              </p>
              <p className="text-sm text-gray-500">
                Aktif: <span className="font-medium text-green-600">
                  {categories.filter(c => c.isActive).length}
                </span>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}