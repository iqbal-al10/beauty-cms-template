'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Edit, Trash2, Clock, DollarSign, Tag, Layers, 
  Image as ImageIcon, Sparkles, Ticket, Star, Eye, Calendar,
  Package
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Service {
  id: string
  name: string
  slug: string
  description: string | null
  duration: number | null
  price: number
  compareAtPrice: number | null
  categoryId: string
  imageUrl: string | null
  isFeatured: boolean
  isActive: boolean
  metaTitle: string | null
  metaDescription: string | null
  canonicalUrl: string | null
  ogImageUrl: string | null
  createdAt: string
  updatedAt: string
  category: { id: string; name: string } | null
  tags: { id: string; name: string; color: string | null }[]
  promos: { 
    id: string
    promoId: string
    promo: {
      id: string
      code: string
      discount: number
      startDate: string
      endDate: string
      isActive: boolean
    }
  }[]
}

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

export default function ServiceDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchService()
  }, [])

  const fetchService = async () => {
    try {
      const res = await fetch(`/api/admin/services/${params.id}`)
      if (!res.ok) {
        toast.error('Layanan tidak ditemukan')
        router.push('/admin/bookings')
        return
      }
      const data = await res.json()
      setService(data)
    } catch (error) {
      console.error('Error fetching service:', error)
      toast.error('Gagal memuat layanan')
      router.push('/admin/bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Yakin ingin menghapus layanan "${service?.name}"?`)) return

    try {
      const res = await fetch(`/api/admin/services/${params.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('Layanan berhasil dihapus!')
        router.push('/admin/bookings')
        router.refresh()
      } else {
        toast.error('Gagal menghapus layanan')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error saat menghapus layanan')
    }
  }

  const getTagColor = (color: string | null): string => {
    if (!color) return '#6B7280'
    if (color.startsWith('#')) return color
    const preset = PRESET_COLORS.find(p => p.value === color)
    if (preset) return preset.hex
    return '#6B7280'
  }

  const getPromoStatus = (startDate: string, endDate: string, isActive: boolean) => {
    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (!isActive) return { label: 'Inactive', color: 'bg-red-100 text-red-700' }
    if (now < start) return { label: 'Upcoming', color: 'bg-blue-100 text-blue-700' }
    if (now > end) return { label: 'Expired', color: 'bg-gray-100 text-gray-700' }
    return { label: 'Active', color: 'bg-green-100 text-green-700' }
  }

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Layanan tidak ditemukan</p>
        <Link href="/admin/bookings" className="text-pink-500 hover:underline mt-2 inline-block">
          Kembali ke daftar layanan
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/bookings"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">{service.name}</h1>
        <span className={`px-3 py-1 text-xs rounded-full ${
          service.isActive
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-700'
        }`}>
          {service.isActive ? '✅ Active' : '📝 Inactive'}
        </span>
        {service.isFeatured && (
          <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1">
            <Star className="w-3 h-3" /> Featured
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Image */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-sm font-medium text-gray-500 mb-4 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Gambar Layanan
            </h2>
            {service.imageUrl ? (
              <div className="relative w-full max-w-md aspect-square rounded-lg overflow-hidden border border-gray-200">
                <img 
                  src={service.imageUrl} 
                  alt={service.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            ) : (
              <div className="w-full max-w-md aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                <Package className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>

          {/* Informasi Layanan */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-sm font-medium text-gray-500 mb-4 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Informasi Layanan
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Nama</p>
                  <p className="font-medium text-gray-800">{service.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Slug</p>
                  <p className="font-medium text-gray-800">{service.slug}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Deskripsi</p>
                <p className="text-gray-700">{service.description || '-'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Kategori</p>
                  <p className="font-medium text-gray-800">{service.category?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Durasi</p>
                  <p className="font-medium text-gray-800">
                    {service.duration ? `${service.duration} menit` : '-'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Dibuat</p>
                  <p className="text-sm text-gray-600">{new Date(service.createdAt).toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Terakhir Update</p>
                  <p className="text-sm text-gray-600">{new Date(service.updatedAt).toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-sm font-medium text-gray-500 mb-4 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {service.tags && service.tags.length > 0 ? (
                service.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="px-3 py-1 text-sm font-medium text-white rounded-full"
                    style={{ backgroundColor: getTagColor(tag.color) }}
                  >
                    {tag.name}
                  </span>
                ))
              ) : (
                <p className="text-gray-400 text-sm">Tidak ada tags</p>
              )}
            </div>
          </div>

          {/* Promos / Vouchers */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-sm font-medium text-gray-500 mb-4 flex items-center gap-2">
              <Ticket className="w-4 h-4" />
              Voucher / Promo
            </h2>
            {service.promos && service.promos.length > 0 ? (
              <div className="space-y-3">
                {service.promos.map((promoItem) => {
                  const promo = promoItem.promo
                  const status = getPromoStatus(promo.startDate, promo.endDate, promo.isActive)
                  return (
                    <div key={promoItem.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">{promo.code}</p>
                        <p className="text-sm text-gray-500">
                          Diskon Rp {promo.discount.toLocaleString('id-ID')}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(promo.startDate).toLocaleDateString('id-ID')} - {new Date(promo.endDate).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Tidak ada voucher terhubung</p>
            )}
          </div>

          {/* SEO Fields */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-sm font-medium text-gray-500 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              SEO & Meta Tags
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Meta Title</p>
                <p className="text-sm text-gray-800">{service.metaTitle || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Meta Description</p>
                <p className="text-sm text-gray-800">{service.metaDescription || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Canonical URL</p>
                <p className="text-sm text-gray-800">{service.canonicalUrl || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">OG Image URL</p>
                {service.ogImageUrl ? (
                  <div className="mt-2">
                    <img 
                      src={service.ogImageUrl} 
                      alt="OG Image"
                      className="w-48 h-32 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                    <p className="text-xs text-gray-400 mt-1 truncate">{service.ogImageUrl}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-800">-</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Side Info */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Statistik</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-pink-500" />
                <div>
                  <p className="text-sm text-gray-500">Harga</p>
                  <p className="font-bold text-lg">{formatCurrency(service.price)}</p>
                  {service.compareAtPrice && service.compareAtPrice > service.price && (
                    <p className="text-sm text-gray-400 line-through">
                      {formatCurrency(service.compareAtPrice)}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Durasi</p>
                  <p className="font-bold text-lg">
                    {service.duration ? `${service.duration} menit` : '-'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-500">Featured</p>
                  <p className="font-medium">{service.isFeatured ? '✅ Ya' : '❌ Tidak'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Aksi</h3>
            <div className="space-y-2">
              <Link
                href={`/admin/bookings/${service.id}/edit`}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit Layanan
              </Link>
              <button
                onClick={handleDelete}
                className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Hapus Layanan
              </button>
              <Link
                href={`/booking/${service.slug}`}
                target="_blank"
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Lihat di Frontend
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}