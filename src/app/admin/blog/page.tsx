'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Eye, Calendar } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Category {
  id: string
  name: string
  slug: string
}

interface Tag {
  id: string
  name: string
  slug: string
}

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
  category: Category | null
  tags: Tag[]
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<BlogPost | null>(null)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [form, setForm] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    status: 'DRAFT',
    publishedAt: '',
    categoryId: '',
  })

  useEffect(() => {
    fetchPosts()
    fetchCategories()
    fetchTags()
  }, [])

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/admin/blog')
      const data = await res.json()
      setPosts(data)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Gagal memuat blog posts')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/blog-categories')
      const data = await res.json()
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories([])
    }
  }

  const fetchTags = async () => {
    try {
      const res = await fetch('/api/admin/blog-tags')
      const data = await res.json()
      setTags(data || [])
    } catch (error) {
      console.error('Error fetching tags:', error)
      setTags([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.title.trim() || !form.slug.trim() || !form.content.trim()) {
      toast.error('Title, slug, dan content harus diisi')
      return
    }

    try {
      // 1. Create/Update blog post
      const url = editing ? `/api/admin/blog/${editing.id}` : '/api/admin/blog'
      const method = editing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to save')
      }

      const post = await res.json()

      // 2. Update tags jika ada
      if (selectedTagIds.length > 0) {
        // TODO: Add API to update blog post tags
        // Untuk sekarang, tags disimpan di database
      }

      toast.success(editing ? 'Blog post berhasil diupdate!' : 'Blog post berhasil ditambahkan!')
      fetchPosts()
      setShowForm(false)
      setEditing(null)
      handleCancel()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Error saat menyimpan blog post')
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Yakin ingin menghapus post "${title}"?`)) return

    try {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success(`Blog post "${title}" berhasil dihapus!`)
        setPosts(posts.filter(p => p.id !== id))
      } else {
        toast.error('Gagal menghapus blog post')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error saat menghapus blog post')
    }
  }

  const handleEdit = (post: BlogPost) => {
    setEditing(post)
    setForm({
      title: post.title,
      slug: post.slug,
      content: post.content || '',
      excerpt: post.excerpt || '',
      status: post.status,
      publishedAt: post.publishedAt ? post.publishedAt.split('T')[0] : '',
      categoryId: post.categoryId || '',
    })
    setSelectedTagIds(post.tags?.map((t: Tag) => t.id) || [])
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditing(null)
    setForm({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      status: 'DRAFT',
      publishedAt: '',
      categoryId: '',
    })
    setSelectedTagIds([])
  }

  const toggleStatus = async (id: string, currentStatus: string, title: string) => {
    try {
      const post = posts.find(p => p.id === id)
      if (!post) return

      const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'

      const res = await fetch(`/api/admin/blog/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...post,
          status: newStatus,
        }),
      })

      if (res.ok) {
        toast.success(`Blog post "${title}" ${newStatus === 'PUBLISHED' ? 'dipublikasikan' : 'di-draft'}`)
        fetchPosts()
      } else {
        toast.error('Gagal mengubah status')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error saat mengubah status')
    }
  }

  const handleViewDetail = (post: BlogPost) => {
    if (post.status === 'DRAFT') {
      toast.error(`"${post.title}" masih berstatus DRAFT. Publikasikan terlebih dahulu untuk dilihat.`)
      return
    }
    window.open(`/blog/${post.slug}`, '_blank')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Blog Posts</h1>
        <button
          onClick={() => {
            setEditing(null)
            setForm({ title: '', slug: '', content: '', excerpt: '', status: 'DRAFT', publishedAt: '', categoryId: '' })
            setSelectedTagIds([])
            setShowForm(!showForm)
          }}
          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Post
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editing ? 'Edit Post' : 'New Post'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value
                  setForm({ 
                    ...form, 
                    title,
                    slug: title.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '')
                  })
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
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="judul-blog-post"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Excerpt</label>
              <input
                type="text"
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="Short summary..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Content *</label>
              <textarea
                rows={6}
                required
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="Write your blog post here..."
              />
            </div>

            {/* ===== CATEGORY ===== */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
              >
                <option value="">No Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* ===== TAGS ===== */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Tags</label>
              <select
                multiple
                value={selectedTagIds}
                onChange={(e) => {
                  const options = Array.from(e.target.selectedOptions, option => option.value)
                  setSelectedTagIds(options)
                }}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 min-h-[100px]"
              >
                {tags.length === 0 ? (
                  <option value="" disabled>Belum ada tag. Buat tag dulu di menu Blog Tags.</option>
                ) : (
                  tags.map((tag) => (
                    <option key={tag.id} value={tag.id}>{tag.name}</option>
                  ))
                )}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                {selectedTagIds.length > 0
                  ? `Terpilih: ${selectedTagIds.length} tag`
                  : 'Hold Ctrl/Cmd untuk pilih multiple tags'}
              </p>
              {selectedTagIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedTagIds.map((tagId) => {
                    const tag = tags.find(t => t.id === tagId)
                    return tag ? (
                      <span
                        key={tag.id}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
                      >
                        {tag.name}
                      </span>
                    ) : null
                  })}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Published Date</label>
                <input
                  type="date"
                  value={form.publishedAt}
                  onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg"
              >
                {editing ? 'Update' : 'Save'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
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
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {post.category?.name || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(post.id, post.status, post.title)}
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
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('id-ID') : '-'}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleViewDetail(post)}
                        className={`transition-colors ${
                          post.status === 'PUBLISHED'
                            ? 'text-blue-600 hover:text-blue-800'
                            : 'text-gray-400 cursor-not-allowed'
                        }`}
                        title={post.status === 'DRAFT' ? 'Post masih draft' : 'Lihat di frontend'}
                        disabled={post.status === 'DRAFT'}
                      >
                        <Eye className="w-5 h-5 inline" />
                      </button>
                      <button 
                        onClick={() => handleEdit(post)} 
                        className="text-yellow-600 hover:text-yellow-800"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5 inline" />
                      </button>
                      <button 
                        onClick={() => handleDelete(post.id, post.title)} 
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
        </div>
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Total: <span className="font-medium text-gray-700">{posts.length}</span> blog posts
          </p>
        </div>
      </div>
    </div>
  )
}
