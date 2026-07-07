'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Play, X, Search, Filter } from 'lucide-react'

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

interface GalleryData {
  data: Video[]
  total: number
  totalPages: number
  currentPage: number
}

const PLATFORM_LABELS: Record<string, string> = {
  YOUTUBE: 'YouTube',
  INSTAGRAM: 'Instagram',
  FACEBOOK: 'Facebook',
  TIKTOK: 'TikTok',
}

const PLATFORM_COLORS: Record<string, string> = {
  YOUTUBE: 'bg-red-100 text-red-700',
  INSTAGRAM: 'bg-pink-100 text-pink-700',
  FACEBOOK: 'bg-blue-100 text-blue-700',
  TIKTOK: 'bg-black/10 text-black',
}

export default function GalleryPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    fetchVideos()
  }, [searchQuery, selectedCategory])

  const fetchVideos = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory !== 'all') params.set('category', selectedCategory)
      if (searchQuery) params.set('search', searchQuery)
      params.set('limit', '50')

      const res = await fetch(`/api/public/gallery?${params}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data: GalleryData = await res.json()
      setVideos(data.data || [])

      // Extract unique categories
      const uniqueCategories = [...new Set(data.data.map(v => v.category).filter(Boolean))] as string[]
      setCategories(uniqueCategories)
    } catch (error) {
      console.error('Error fetching gallery:', error)
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
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}`
    }
    return url
  }

  // Group videos by category
  const productVideos = videos.filter(v => v.category === 'Product')
  const bookingVideos = videos.filter(v => v.category === 'Booking')
  const otherVideos = videos.filter(v => v.category !== 'Product' && v.category !== 'Booking')

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-pink-500 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>
        <span className="mx-1">/</span>
        <span className="text-gray-800">Gallery</span>
      </nav>

      {/* Hero */}
      <div 
        className="rounded-2xl p-10 text-center mb-8"
        style={{
          background: `linear-gradient(135deg, #c4367b 0%, #f5dbe8 100%)`,
        }}
      >
        <h1 className="font-bold text-white text-4xl">📸 Video Gallery</h1>
        <p className="text-white/80 max-w-2xl mx-auto mt-2">
          Discover our video content - tutorials, promos, testimonials and more
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search videos by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none appearance-none bg-white min-w-[150px]"
          >
            <option value="all">All Categories</option>
            <option value="Product">📦 Product</option>
            <option value="Booking">📅 Booking</option>
            {categories.filter(c => c !== 'Product' && c !== 'Booking').map((cat) => (
              <option key={cat} value={cat}>📂 {cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 mb-4">
        Showing {videos.length} video{videos.length !== 1 ? 's' : ''}
      </p>

      {videos.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-gray-500 text-lg">No videos found</p>
          <p className="text-gray-400 text-sm">Try adjusting your search or filter</p>
        </div>
      ) : (
        <>
          {/* Product Videos Section */}
          {productVideos.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                📦 Product Videos
                <span className="text-sm font-normal text-gray-400">({productVideos.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {productVideos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onPlay={() => setSelectedVideo(video)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Booking Videos Section */}
          {bookingVideos.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                📅 Booking Videos
                <span className="text-sm font-normal text-gray-400">({bookingVideos.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {bookingVideos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onPlay={() => setSelectedVideo(video)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Other Videos Section */}
          {otherVideos.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                📂 Other Videos
                <span className="text-sm font-normal text-gray-400">({otherVideos.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {otherVideos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onPlay={() => setSelectedVideo(video)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal Popup */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h3 className="font-semibold text-gray-800">{selectedVideo.title}</h3>
                {selectedVideo.category && (
                  <span className="text-xs text-gray-500">📂 {selectedVideo.category}</span>
                )}
              </div>
              <button
                onClick={() => setSelectedVideo(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video bg-black">
              <iframe
                src={getEmbedUrl(selectedVideo.url, selectedVideo.sourceType)}
                className="w-full h-full"
                allowFullScreen
                loading="lazy"
                title={selectedVideo.title}
              />
            </div>

            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-2 py-0.5 text-xs rounded-full ${PLATFORM_COLORS[selectedVideo.sourceType] || 'bg-gray-100'}`}>
                  {PLATFORM_LABELS[selectedVideo.sourceType] || selectedVideo.sourceType}
                </span>
                {selectedVideo.description && (
                  <span className="text-sm text-gray-500">{selectedVideo.description}</span>
                )}
              </div>
              <a
                href={selectedVideo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-pink-500 hover:underline"
              >
                🔗 View on {PLATFORM_LABELS[selectedVideo.sourceType] || 'platform'}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Video Card Component
function VideoCard({ video, onPlay }: { video: Video; onPlay: () => void }) {
  const platformLabel = PLATFORM_LABELS[video.sourceType] || video.sourceType
  const platformColor = PLATFORM_COLORS[video.sourceType] || 'bg-gray-100'

  return (
    <div 
      className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer hover:-translate-y-1"
      onClick={onPlay}
    >
      <div className="aspect-video bg-gray-100 relative overflow-hidden">
        {video.thumbnailUrl ? (
          <img 
            src={video.thumbnailUrl} 
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Play className="w-12 h-12" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
          <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-0.5 text-xs rounded-full ${platformColor}`}>
            {platformLabel}
          </span>
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-gray-800 text-sm line-clamp-1">{video.title}</h3>
        {video.category && (
          <p className="text-xs text-gray-500 mt-0.5">📂 {video.category}</p>
        )}
        {video.description && (
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{video.description}</p>
        )}
      </div>
    </div>
  )
}