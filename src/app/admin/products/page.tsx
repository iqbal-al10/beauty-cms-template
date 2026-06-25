'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  stock: number
  status: string
  category: { name: string } | null
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError('')
      
      const res = await fetch('/api/admin/products')
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      
      const data = await res.json()
      
      if (Array.isArray(data)) {
        setProducts(data)
      } else {
        setProducts([])
        setError('Data tidak valid')
      }
    } catch (error: any) {
      console.error('Error fetching products:', error)
      setError('Gagal memuat produk')
      toast.error('Gagal memuat produk')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // ===== TOGGLE STATUS (SEPERTI DI BLOG) =====
  const toggleStatus = async (id: string, currentStatus: string, name: string) => {
    try {
      const product = products.find(p => p.id === id)
      if (!product) return

      const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'

      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...product,
          status: newStatus,
        }),
      })

      if (res.ok) {
        toast.success(`Produk "${name}" ${newStatus === 'PUBLISHED' ? 'dipublikasikan' : 'di-draft'}`)
        fetchProducts()
      } else {
        toast.error('Gagal mengubah status')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error saat mengubah status')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus produk "${name}"?`)) return

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success(`Produk "${name}" berhasil dihapus!`)
        setProducts(products.filter(p => p.id !== id))
        setSelectedIds(selectedIds.filter(sid => sid !== id))
      } else {
        toast.error('Gagal menghapus produk')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Error saat menghapus produk')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.error('Pilih minimal satu produk')
      return
    }

    if (!confirm(`Yakin ingin menghapus ${selectedIds.length} produk?`)) return

    try {
      let successCount = 0
      for (const id of selectedIds) {
        const res = await fetch(`/api/admin/products/${id}`, {
          method: 'DELETE',
        })
        if (res.ok) successCount++
      }

      if (successCount > 0) {
        toast.success(`${successCount} produk berhasil dihapus!`)
        setProducts(products.filter(p => !selectedIds.includes(p.id)))
        setSelectedIds([])
        setSelectAll(false)
      } else {
        toast.error('Gagal menghapus produk')
      }
    } catch (error) {
      console.error('Error bulk deleting products:', error)
      toast.error('Error saat menghapus produk')
    }
  }

  const handleBulkStatus = async (status: string) => {
    if (selectedIds.length === 0) {
      toast.error('Pilih minimal satu produk')
      return
    }

    try {
      let successCount = 0
      for (const id of selectedIds) {
        const product = products.find(p => p.id === id)
        if (product) {
          const res = await fetch(`/api/admin/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...product,
              status,
            }),
          })
          if (res.ok) successCount++
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} produk berhasil diupdate!`)
        fetchProducts()
        setSelectedIds([])
        setSelectAll(false)
      } else {
        toast.error('Gagal mengupdate produk')
      }
    } catch (error) {
      console.error('Error bulk updating products:', error)
      toast.error('Error saat mengupdate produk')
    }
  }

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([])
    } else {
      setSelectedIds(products.map(p => p.id))
    }
    setSelectAll(!selectAll)
  }

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sid => sid !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        <p className="mt-3 text-gray-600">Memuat produk...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
        <p className="font-medium">Error: {error}</p>
        <button 
          onClick={fetchProducts} 
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Coba Lagi
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Produk</h1>
        <Link
          href="/admin/products/new"
          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tambah Produk
        </Link>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 mb-4 flex items-center gap-4 flex-wrap">
          <span className="text-sm text-pink-700 font-medium">
            {selectedIds.length} produk dipilih
          </span>
          <button
            onClick={() => handleBulkStatus('PUBLISHED')}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1"
          >
            <Check className="w-4 h-4" />
            Publish
          </button>
          <button
            onClick={() => handleBulkStatus('DRAFT')}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Draft
          </button>
          <button
            onClick={handleBulkDelete}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            Hapus
          </button>
          <button
            onClick={() => { setSelectedIds([]); setSelectAll(false) }}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Batal
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-pink-500 rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Produk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Harga
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stok
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    <p>Belum ada produk</p>
                    <Link 
                      href="/admin/products/new" 
                      className="text-pink-500 hover:text-pink-600 font-medium mt-2 inline-block"
                    >
                      Klik di sini untuk tambah produk pertama
                    </Link>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(product.id)}
                        onChange={() => toggleSelect(product.id)}
                        className="w-4 h-4 text-pink-500 rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {product.slug}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {product.category?.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      Rp {product.price.toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        product.stock > 10 ? 'bg-green-100 text-green-700' :
                        product.stock > 0 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {product.stock} unit
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {/* STATUS - BISA DI-TOGGLE SEPERTI BLOG */}
                      <button
                        onClick={() => toggleStatus(product.id, product.status, product.name)}
                        className={`px-2 py-1 text-xs rounded-full transition-colors ${
                          product.status === 'PUBLISHED'
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {product.status === 'PUBLISHED' ? '✅ Published' : '📝 Draft'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Lihat detail"
                      >
                        <Eye className="w-5 h-5 inline" />
                      </Link>
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-yellow-600 hover:text-yellow-800 transition-colors"
                        title="Edit produk"
                      >
                        <Edit className="w-5 h-5 inline" />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Hapus produk"
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
        
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Total: <span className="font-medium text-gray-700">{products.length}</span> produk
          </p>
          {selectedIds.length > 0 && (
            <p className="text-sm text-pink-500">
              {selectedIds.length} produk dipilih
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
