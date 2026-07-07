'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Play, Video, Upload, X } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'

interface Video {
  id: string
  title: string
  sourceType: string
  url: string
  thumbnailUrl: string | null
  category: string | null
  description: string | null
  sortOrder: number
  isPublished: boolean
  createdAt: string
}

const PLATFORMS = [
  { value: 'YOUTUBE', label: 'YouTube', color: 'bg-red-100 text-red-700' },
  { value: 'INSTAGRAM', label: 'Instagram', color: 'bg-pink-100 text-pink-700' },
  { value: 'FACEBOOK', label: 'Facebook', color: 'bg-blue-100 text-blue-700' },
  { value: 'TIKTOK', label: 'TikTok', color: 'bg-black/10 text-black' },
]

const CATEGORIES = ['Tutorial', 'Promo', 'Testimoni', 'Tips', 'Product', 'Booking']

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Video | null>(null)
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)
  const [form, setForm] = useState({
    title: '',
    sourceType: 'YOUTUBE',
    url: '',
    thumbnailUrl: '',
    category: '',
    description: '',
    sortOrder: 0,
    isPublished: true,
  })

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/admin/videos')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setVideos(data || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Gagal memuat video')
      setVideos([])
    } finally {
      setLoading(false)
    }
  }

  const getEmbedUrl = (url: string, sourceType: string) => {
    if (sourceType === 'YOUTUBE') {
      const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&?\/]+)/)?.[1]
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url
    }
    if (sourceType === 'INSTAGRAM') {
      const match = url.match(/instagram\.com\/p\/([^/?]+)/)
      return match ? `https://www.instagram.com/p/${match[1]}/embed` : url
    }
    if (sourceType === 'TIKTOK') {
      const match = url.match(/tiktok\.com\/@[^\/]+\/video\/(\d+)/)
      return match ? `https://www.tiktok.com/embed/v2/${match[1]}` : url
    }
    if (sourceType === 'FACEBOOK') {
      const match = url.match(/facebook\.com\/.*\/videos\/(\d+)/)
      return match ? `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}` : url
    }
    return url
  }

  const getThumbnail = (url: string, sourceType: string) => {
    if (sourceType === 'YOUTUBE') {
      const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&?\/]+)/)?.[1]
      return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null
    }
    return null
  }

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Hanya file gambar yang diizinkan')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB')
      return
    }

    setUploadingThumbnail(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        setForm({ ...form, thumbnailUrl: data.url })
        toast.success('Thumbnail berhasil diupload!')
      } else {
        toast.error('Gagal upload thumbnail')
      }
    } catch (error) {
      console.error('Error uploading thumbnail:', error)
      toast.error('Gagal upload thumbnail')
    } finally {
      setUploadingThumbnail(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.title.trim()) {
      toast.error('Title harus diisi')
      return
    }
    if (!form.url.trim()) {
      toast.error('URL harus diisi')
      return
    }

    // Auto-generate thumbnail for YouTube
    let thumbnailUrl = form.thumbnailUrl
    if (form.sourceType === 'YOUTUBE' && !thumbnailUrl) {
      const autoThumb = getThumbnail(form.url, form.sourceType)
      if (autoThumb) thumbnailUrl = autoThumb
    }

    // Validate URL format
    const urlPatterns: Record<string, RegExp> = {
      YOUTUBE: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/,
      INSTAGRAM: /^(https?:\/\/)?(www\.)?instagram\.com\/.+/,
      FACEBOOK: /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.com)\/.+/,
      TIKTOK: /^(https?:\/\/)?(www\.)?tiktok\.com\/.+/,
    }

    if (!urlPatterns[form.sourceType]?.test(form.url)) {
      toast.error(`URL tidak valid untuk ${form.sourceType}`)
      return
    }

    try {
      const url = editing ? `/api/admin/videos/${editing.id}` : '/api/admin/videos'
      const method = editing ? 'PUT' : 'POST'

      const payload = {
        ...form,
        thumbnailUrl,
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to save')
      }

      toast.success(editing ? 'Video berhasil diupdate!' : 'Video berhasil ditambahkan!')
      fetchVideos()
      handleCancel()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal menyimpan video')
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Yakin ingin menghapus video "${title}"?`)) return

    try {
      const res = await fetch(`/api/admin/videos/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete')
      }

      toast.success(`Video "${title}" berhasil dihapus!`)
      setVideos(videos.filter(v => v.id !== id))
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal menghapus video')
    }
  }

  const handleEdit = (video: Video) => {
    setEditing(video)
    setForm({
      title: video.title,
      sourceType: video.sourceType,
      url: video.url,
      thumbnailUrl: video.thumbnailUrl || '',
      category: video.category || '',
      description: video.description || '',
      sortOrder: video.sortOrder,
      isPublished: video.isPublished,
    })
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditing(null)
    setForm({
      title: '',
      sourceType: 'YOUTUBE',
      url: '',
      thumbnailUrl: '',
      category: '',
      description: '',
      sortOrder: 0,
      isPublished: true,
    })
  }

  const togglePublish = async (id: string, currentStatus: boolean, title: string) => {
    try {
      const video = videos.find(v => v.id === id)
      if (!video) {
        toast.error('Video tidak ditemukan')
        return
      }

      const newStatus = !currentStatus

      const res = await fetch(`/api/admin/videos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...video,
          isPublished: newStatus,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update')
      }

      toast.success(`Video "${title}" ${newStatus ? 'dipublikasikan' : 'di-draft'}`)
      fetchVideos()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal mengubah status')
    }
  }

  const getPlatformLabel = (type: string) => {
    return PLATFORMS.find(p => p.value === type)?.label || type
  }

  const getPlatformColor = (type: string) => {
    return PLATFORMS.find(p => p.value === type)?.color || 'bg-gray-100 text-gray-700'
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
        <h1 className="text-2xl font-bold text-gray-800">Video Content</h1>
        <button
          onClick={() => {
            setEditing(null)
            setForm({
              title: '',
              sourceType: 'YOUTUBE',
              url: '',
              thumbnailUrl: '',
              category: '',
              description: '',
              sortOrder: videos.length,
              isPublished: true,
            })
            setShowForm(!showForm)
          }}
          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Video
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editing ? 'Edit Video' : 'New Video'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="Video title..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Platform *</label>
              <select
                value={form.sourceType}
                onChange={(e) => {
                  setForm({ ...form, sourceType: e.target.value, url: '', thumbnailUrl: '' })
                }}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
              >
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">URL *</label>
              <input
                type="text"
                required
                value={form.url}
                onChange={(e) => {
                  const val = e.target.value
                  setForm({ ...form, url: val })
                  // Auto-generate thumbnail for YouTube
                  if (form.sourceType === 'YOUTUBE' && !form.thumbnailUrl) {
                    const autoThumb = getThumbnail(val, form.sourceType)
                    if (autoThumb) {
                      setForm(prev => ({ ...prev, url: val, thumbnailUrl: autoThumb }))
                      return
                    }
                  }
                  setForm(prev => ({ ...prev, url: val }))
                }}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder={
                  form.sourceType === 'YOUTUBE' 
                    ? 'https://www.youtube.com/watch?v=...' 
                    : form.sourceType === 'INSTAGRAM'
                    ? 'https://www.instagram.com/p/...'
                    : form.sourceType === 'TIKTOK'
                    ? 'https://www.tiktok.com/@username/video/...'
                    : 'https://www.facebook.com/...'
                }
              />
              <p className="text-xs text-gray-400 mt-1">
                {form.sourceType === 'YOUTUBE' && 'YouTube auto-thumbnail akan digenerate otomatis'}
                {(form.sourceType === 'INSTAGRAM' || form.sourceType === 'FACEBOOK' || form.sourceType === 'TIKTOK') && 
                  'Upload thumbnail manual di bawah'}
              </p>
            </div>

            {/* Thumbnail Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Thumbnail {form.sourceType !== 'YOUTUBE' && '*'}
              </label>
              <div className="flex items-center gap-4 mt-1">
                {form.thumbnailUrl ? (
                  <div className="relative w-32 h-20 bg-gray-100 rounded-lg overflow-hidden">
                    <img src={form.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, thumbnailUrl: '' })}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-20 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">
                    No thumbnail
                  </div>
                )}
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    className="hidden"
                    id="thumbnailUpload"
                    disabled={uploadingThumbnail}
                  />
                  <label
                    htmlFor="thumbnailUpload"
                    className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer ${
                      form.sourceType === 'YOUTUBE'
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'bg-pink-500 hover:bg-pink-600 text-white'
                    }`}
                  >
                    {uploadingThumbnail ? 'Uploading...' : 'Upload Thumbnail'}
                  </label>
                  {form.sourceType === 'YOUTUBE' && (
                    <p className="text-xs text-green-600 mt-1">✅ Auto-thumbnail from YouTube</p>
                  )}
                  {(form.sourceType === 'INSTAGRAM' || form.sourceType === 'FACEBOOK' || form.sourceType === 'TIKTOK') && (
                    <p className="text-xs text-gray-400 mt-1">Upload thumbnail untuk video ini</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <div className="flex gap-2 mt-1">
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                >
                  <option value="">-- Select Category --</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="New category..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const val = (e.target as HTMLInputElement).value.trim()
                      if (val && !CATEGORIES.includes(val)) {
                        CATEGORIES.push(val)
                        setForm({ ...form, category: val })
                        toast.success(`Category "${val}" added!`)
                        ;(e.target as HTMLInputElement).value = ''
                      }
                    }
                  }}
                  placeholder="Type new category and press Enter"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="Video description..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Sort Order</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                  className="w-4 h-4 text-pink-500 rounded border-gray-300"
                />
                <label className="text-sm text-gray-700">Published</label>
              </div>
            </div>

            {/* Preview */}
            {form.url && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-2">Preview:</p>
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <iframe
                    src={getEmbedUrl(form.url, form.sourceType)}
                    className="w-full h-full"
                    allowFullScreen
                    loading="lazy"
                    title={form.title}
                  />
                </div>
              </div>
            )}

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

      {/* Video List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-200">
          {videos.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No videos found</div>
          ) : (
            videos.map((video) => (
              <div key={video.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-32 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 relative">
                    {video.thumbnailUrl ? (
                      <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
                        <Video className="w-8 h-8" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-800">{video.title}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getPlatformColor(video.sourceType)}`}>
                        {getPlatformLabel(video.sourceType)}
                      </span>
                      {video.category && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700">
                          📂 {video.category}
                        </span>
                      )}
                    </div>
                    {video.description && (
                      <p className="text-sm text-gray-500 truncate">{video.description}</p>
                    )}
                    <p className="text-xs text-gray-400">Sort: {video.sortOrder}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => togglePublish(video.id, video.isPublished, video.title)}
                      className={`px-2 py-1 text-xs rounded-full transition-colors ${
                        video.isPublished
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {video.isPublished ? '✅ Published' : '📝 Draft'}
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(video)}
                        className="text-yellow-600 hover:text-yellow-800"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(video.id, video.title)}
                        className="text-red-600 hover:text-red-800"
                        title="Hapus"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Total: <span className="font-medium text-gray-700">{videos.length}</span> videos
          </p>
        </div>
      </div>
    </div>
  )
}