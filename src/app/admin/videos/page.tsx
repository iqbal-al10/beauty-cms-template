'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Play, Video } from 'lucide-react'
import toast from 'react-hot-toast'

interface Video {
  id: string
  title: string
  sourceType: string
  url: string
  thumbnailUrl: string | null
  sortOrder: number
  isPublished: boolean
  createdAt: string
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Video | null>(null)
  const [form, setForm] = useState({
    title: '',
    url: '',
    thumbnailUrl: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.title.trim() || !form.url.trim()) {
      toast.error('Title dan URL harus diisi')
      return
    }

    const isYoutube = form.url.includes('youtube.com') || form.url.includes('youtu.be')
    if (!isYoutube) {
      toast.error('Hanya URL YouTube yang didukung')
      return
    }

    try {
      const url = editing ? `/api/admin/videos/${editing.id}` : '/api/admin/videos'
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
      url: video.url,
      thumbnailUrl: video.thumbnailUrl || '',
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
      url: '',
      thumbnailUrl: '',
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

  const getEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1]
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url
  }

  const isYouTube = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be')
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
              url: '',
              thumbnailUrl: '',
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
              <label className="block text-sm font-medium text-gray-700">YouTube URL *</label>
              <input
                type="text"
                required
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="https://www.youtube.com/watch?v=..."
              />
              <p className="text-xs text-gray-400 mt-1">
                Masukkan URL YouTube (contoh: https://www.youtube.com/watch?v=abc123)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Thumbnail URL (optional)</label>
              <input
                type="text"
                value={form.thumbnailUrl}
                onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="https://example.com/thumbnail.jpg"
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

            {form.url && isYouTube(form.url) && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-2">Preview:</p>
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <iframe
                    src={getEmbedUrl(form.url)}
                    className="w-full h-full"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              </div>
            )}

            {form.url && !isYouTube(form.url) && (
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-700 flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  URL tidak valid. Masukkan URL YouTube.
                </p>
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
                        <Video className="w-8 h-8 text-red-500" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800">{video.title}</h3>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                        <Video className="w-3 h-3" />
                        YouTube
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{video.url}</p>
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
