'use client'

import { useEffect, useState } from 'react'
import { 
  Package, Calendar, MessageSquare, FileText, Users, Star, 
  AlertTriangle, RefreshCw, ShoppingBag, CheckCircle, XCircle, Clock 
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface DashboardStats {
  totalProducts: number
  totalBookings: number
  totalTestimonials: number
  totalBlogPosts: number
  totalUsers: number
  totalReviews: number
  lowStockProducts: Array<{
    id: string
    name: string
    stock: number
    slug: string
  }>
  recentBookings: Array<{
    id: string
    customerName: string
    bookingDate: string
    status: string
  }>
}

interface Order {
  id: string
  customerName: string
  customerWhatsapp: string
  productName: string
  quantity: number
  totalPrice: number
  status: string
  note: string | null
  createdAt: string
  product: {
    name: string
    stock: number
  }
}

interface StockHistory {
  id: string
  productId: string
  oldStock: number
  newStock: number
  change: number
  reason: string
  note: string | null
  createdAt: string
  product: {
    id: string
    name: string
    slug: string
  }
  user: {
    name: string
  }
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalBookings: 0,
    totalTestimonials: 0,
    totalBlogPosts: 0,
    totalUsers: 0,
    totalReviews: 0,
    lowStockProducts: [],
    recentBookings: [],
  })
  const [orders, setOrders] = useState<Order[]>([])
  const [stockHistories, setStockHistories] = useState<StockHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [processingOrder, setProcessingOrder] = useState<string | null>(null)

  const primaryColor = '#c4367b'

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch dashboard stats
      const statsRes = await fetch('/api/admin/dashboard')
      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data)
      }

      // Fetch pending orders
      const ordersRes = await fetch('/api/admin/orders?status=PENDING')
      if (ordersRes.ok) {
        const data = await ordersRes.json()
        setOrders(data)
      }

      // Fetch stock history
      const historyRes = await fetch('/api/admin/stock-history?limit=10')
      if (historyRes.ok) {
        const data = await historyRes.json()
        setStockHistories(data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleOrderAction = async (orderId: string, action: 'approve' | 'reject') => {
    setProcessingOrder(orderId)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(action === 'approve' ? '✅ Pesanan disetujui! Stok berkurang.' : '❌ Pesanan ditolak')
        fetchData()
      } else {
        toast.error(data.error || 'Gagal memproses pesanan')
      }
    } catch (error) {
      console.error('Error processing order:', error)
      toast.error('Terjadi kesalahan')
    } finally {
      setProcessingOrder(null)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: primaryColor }} />
      </div>
    )
  }

  const cards = [
    { 
      title: 'Total Products', 
      value: stats.totalProducts, 
      icon: Package, 
      color: 'bg-pink-100 text-pink-600',
      href: '/admin/products'
    },
    { 
      title: 'Total Bookings', 
      value: stats.totalBookings, 
      icon: Calendar, 
      color: 'bg-blue-100 text-blue-600',
      href: '/admin/bookings'
    },
    { 
      title: 'Testimonials', 
      value: stats.totalTestimonials, 
      icon: MessageSquare, 
      color: 'bg-green-100 text-green-600',
      href: '/admin/testimonials'
    },
    { 
      title: 'Blog Posts', 
      value: stats.totalBlogPosts, 
      icon: FileText, 
      color: 'bg-purple-100 text-purple-600',
      href: '/admin/blog'
    },
    { 
      title: 'Users', 
      value: stats.totalUsers, 
      icon: Users, 
      color: 'bg-orange-100 text-orange-600',
      href: '/admin/users'
    },
    { 
      title: 'Reviews', 
      value: stats.totalReviews, 
      icon: Star, 
      color: 'bg-yellow-100 text-yellow-600',
      href: '/admin/reviews'
    },
  ]

  const pendingOrders = orders.filter(o => o.status === 'PENDING')
  const lowStockProducts = stats.lowStockProducts || []

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <button
          onClick={fetchData}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* ===== NOTIFIKASI PESANAN ===== */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5" style={{ color: primaryColor }} />
          Notifikasi Pemesanan
          {pendingOrders.length > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {pendingOrders.length} baru
            </span>
          )}
        </h2>

        {pendingOrders.length === 0 ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center text-green-600">
            ✅ Tidak ada pesanan pending
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pendingOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">{order.customerName}</p>
                    <p className="text-sm text-gray-500">{order.customerWhatsapp}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Pending
                  </span>
                </div>

                <div className="mt-2 space-y-1">
                  <p className="text-sm">
                    <span className="text-gray-500">Produk:</span>{' '}
                    <span className="font-medium">{order.productName}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-500">Jumlah:</span>{' '}
                    <span className="font-medium">{order.quantity} unit</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-500">Total:</span>{' '}
                    <span className="font-medium" style={{ color: primaryColor }}>
                      Rp {order.totalPrice.toLocaleString()}
                    </span>
                  </p>
                  {order.note && (
                    <p className="text-sm text-gray-500">Catatan: {order.note}</p>
                  )}
                  <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleOrderAction(order.id, 'approve')}
                    disabled={processingOrder === order.id}
                    className="flex-1 py-2 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    Setujui
                  </button>
                  <button
                    onClick={() => handleOrderAction(order.id, 'reject')}
                    disabled={processingOrder === order.id}
                    className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4 inline mr-1" />
                    Tolak
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== LOW STOCK ALERT ===== */}
      {lowStockProducts.length > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
            <h3 className="font-semibold text-red-700">⚠️ Low Stock Alert</h3>
            <span className="text-sm text-red-600">
              ({lowStockProducts.length} products with stock &lt; 10)
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg p-3 border border-red-200 flex items-center justify-between shadow-sm"
              >
                <div>
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="font-medium text-gray-800 hover:text-pink-500 transition-colors"
                  >
                    {product.name}
                  </Link>
                  <p className="text-sm text-red-600 font-semibold">
                    Stok: {product.stock}
                  </p>
                </div>
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="px-3 py-1 rounded-lg text-white text-xs font-medium transition-colors hover:opacity-90"
                  style={{ backgroundColor: primaryColor }}
                >
                  Edit Stok
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== STATS CARDS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">{card.title}</p>
                <p className="text-xl font-bold text-gray-800 mt-1">{card.value}</p>
              </div>
              <div className={`${card.color} p-2 rounded-lg`}>
                <card.icon className="w-4 h-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ===== STOCK HISTORY ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Bookings</h2>
          {stats.recentBookings.length === 0 ? (
            <p className="text-gray-500 text-sm">No recent bookings</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {stats.recentBookings.map((booking) => (
                <div key={booking.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{booking.customerName}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(booking.bookingDate).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                    booking.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                    booking.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stock History */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">📦 Stock History</h2>
          {stockHistories.length === 0 ? (
            <p className="text-gray-500 text-sm">Belum ada riwayat perubahan stok</p>
          ) : (
            <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
              {stockHistories.map((history) => (
                <div key={history.id} className="py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{history.product.name}</p>
                      <p className="text-sm">
                        <span className="text-gray-500">Stok:</span>{' '}
                        <span className="font-medium">{history.oldStock}</span>
                        <span className="text-gray-400 mx-1">→</span>
                        <span className="font-medium" style={{ 
                          color: history.change > 0 ? '#22c55e' : '#ef4444' 
                        }}>
                          {history.newStock}
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        history.change > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {history.change > 0 ? '+' : ''}{history.change}
                      </p>
                      <p className="text-xs text-gray-400">{formatDate(history.createdAt)}</p>
                    </div>
                  </div>
                  {history.reason && (
                    <p className="text-xs text-gray-500 mt-1">{history.reason}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
