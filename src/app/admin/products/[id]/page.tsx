'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2, Package, Tag, Layers, DollarSign, Box } from 'lucide-react'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  stock: number
  status: string
  category: { name: string }
  createdAt: string
  updatedAt: string
}

export default function ProductDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProduct()
  }, [])

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/admin/products/${params.id}`)
      if (!res.ok) {
        toast.error('Produk tidak ditemukan')
        router.push('/admin/products')
        return
      }
      const data = await res.json()
      setProduct(data)
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Gagal memuat produk')
      router.push('/admin/products')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Yakin ingin menghapus produk "${product?.name}"?`)) return

    try {
      const res = await fetch(`/api/admin/products/${params.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('Produk berhasil dihapus!')
        router.push('/admin/products')
        router.refresh()
      } else {
        toast.error('Gagal menghapus produk')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error saat menghapus produk')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Produk tidak ditemukan</p>
        <Link href="/admin/products" className="text-pink-500 hover:underline mt-2 inline-block">
          Kembali ke daftar produk
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/products"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>
        <span className={`px-3 py-1 text-xs rounded-full ${
          product.status === 'PUBLISHED'
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-700'
        }`}>
          {product.status === 'PUBLISHED' ? 'Dipublikasikan' : 'Draf'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Informasi Produk</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nama</p>
                <p className="font-medium">{product.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Slug</p>
                <p className="font-medium">{product.slug}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500">Deskripsi</p>
              <p className="text-gray-700">{product.description || '-'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Kategori</p>
                <p className="font-medium">{product.category?.name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium">{product.status}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Dibuat</p>
                <p className="text-sm">{new Date(product.createdAt).toLocaleString('id-ID')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Terakhir Update</p>
                <p className="text-sm">{new Date(product.updatedAt).toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Side Info */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Statistik</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-pink-500" />
                <div>
                  <p className="text-sm text-gray-500">Harga</p>
                  <p className="font-bold text-lg">Rp {product.price.toLocaleString('id-ID')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Box className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Stok</p>
                  <p className="font-bold text-lg">{product.stock} unit</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Aksi</h3>
            <div className="space-y-2">
              <Link
                href={`/admin/products/${product.id}/edit`}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit Produk
              </Link>
              <button
                onClick={handleDelete}
                className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Hapus Produk
              </button>
              <Link
                href={`/products/${product.slug}`}
                target="_blank"
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Package className="w-4 h-4" />
                Lihat di Frontend
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
