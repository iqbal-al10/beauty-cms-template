'use client'

import { useEffect, useState } from 'react'
import { 
  Package, Calendar, MessageSquare, FileText, Users, Star, 
  AlertTriangle, RefreshCw, ShoppingBag, CheckCircle, XCircle, 
  Clock, DollarSign, TrendingUp, TrendingDown, BarChart3,
  CreditCard, ArrowUpRight, ArrowDownRight, Box, Plus, History
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

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
    service: { name: string } | null
  }>
  revenue: {
    total: number
    today: number
    week: number
    month: number
    byDay: Array<{ date: string; revenue: number }>
  }
  expense: {
    total: number
    today: number
    byDay: Array<{ date: string; expense: number }>
  }
  profit: {
    total: number
  }
  orders: {
    total: number
    pending: number
  }
  topProducts: Array<{
    name: string
    quantity: number
    revenue: number
  }>
  recentTransactions: Array<{
    id: string
    type: string
    category: string
    amount: number
    description: string
    date: string
  }>
}

interface Order {
  id: string
  customerName: string
  customerWhatsapp: string
  productName: string
  quantity: number
  finalPrice: number
  status: string
  note: string | null
  createdAt: string
}

interface Booking {
  id: string
  customerName: string
  whatsapp: string
  bookingDate: string
  bookingTime: string
  status: string
  service: { name: string } | null
  notes: string | null
  createdAt: string
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

interface Expense {
  id: string
  title: string
  amount: number
  category: string
  description: string | null
  date: string
  createdAt: string
}

const COLORS = ['#c4367b', '#e20373', '#f472b6', '#a78bfa', '#34d399', '#fbbf24', '#60a5fa']

const CATEGORIES = [
  'OPERATIONAL',
  'MARKETING',
  'SALARY',
  'RENT',
  'UTILITIES',
  'OTHER'
]

const CATEGORY_LABELS: Record<string, string> = {
  OPERATIONAL: '🛠️ Operational',
  MARKETING: '📢 Marketing',
  SALARY: '👤 Salary',
  RENT: '🏢 Rent',
  UTILITIES: '💡 Utilities',
  OTHER: '📦 Other'
}

type FilterPeriod = 'day' | 'week' | 'month' | 'year'

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
    revenue: { total: 0, today: 0, week: 0, month: 0, byDay: [] },
    expense: { total: 0, today: 0, byDay: [] },
    profit: { total: 0 },
    orders: { total: 0, pending: 0 },
    topProducts: [],
    recentTransactions: [],
  })
  const [orders, setOrders] = useState<Order[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [stockHistories, setStockHistories] = useState<StockHistory[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [processingOrder, setProcessingOrder] = useState<string | null>(null)
  const [processingBooking, setProcessingBooking] = useState<string | null>(null)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('week')
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    amount: '',
    category: 'OPERATIONAL',
    description: '',
    date: new Date().toISOString().split('T')[0],
  })
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  const primaryColor = '#c4367b'

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const statsRes = await fetch('/api/admin/dashboard')
      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data)
      }

      const ordersRes = await fetch('/api/admin/orders?status=PENDING')
      if (ordersRes.ok) {
        const data = await ordersRes.json()
        setOrders(data)
      }

      const bookingsRes = await fetch('/api/admin/bookings?status=PENDING')
      if (bookingsRes.ok) {
        const data = await bookingsRes.json()
        setBookings(data)
      }

      const historyRes = await fetch('/api/admin/stock-history?limit=10')
      if (historyRes.ok) {
        const data = await historyRes.json()
        setStockHistories(data)
      }

      const expensesRes = await fetch('/api/admin/expenses')
      if (expensesRes.ok) {
        const data = await expensesRes.json()
        setExpenses(data || [])
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

  const handleBookingAction = async (bookingId: string, action: 'approve' | 'reject') => {
    setProcessingBooking(bookingId)
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action === 'approve' ? 'APPROVED' : 'REJECTED' }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(action === 'approve' ? '✅ Booking disetujui!' : '❌ Booking ditolak')
        fetchData()
      } else {
        toast.error(data.error || 'Gagal memproses booking')
      }
    } catch (error) {
      console.error('Error processing booking:', error)
      toast.error('Terjadi kesalahan')
    } finally {
      setProcessingBooking(null)
    }
  }

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!expenseForm.title.trim() || !expenseForm.amount || parseFloat(expenseForm.amount) <= 0) {
      toast.error('Judul dan jumlah harus diisi dengan benar')
      return
    }

    try {
      const url = editingExpense ? '/api/admin/expenses' : '/api/admin/expenses'
      const method = editingExpense ? 'PUT' : 'POST'
      const payload = editingExpense 
        ? { ...expenseForm, id: editingExpense.id, amount: parseFloat(expenseForm.amount) } 
        : { ...expenseForm, amount: parseFloat(expenseForm.amount) }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to save')
      }

      toast.success(editingExpense ? 'Pengeluaran berhasil diupdate!' : 'Pengeluaran berhasil ditambahkan!')
      fetchData()
      setShowExpenseForm(false)
      setEditingExpense(null)
      setExpenseForm({
        title: '',
        amount: '',
        category: 'OPERATIONAL',
        description: '',
        date: new Date().toISOString().split('T')[0],
      })
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal menyimpan pengeluaran')
    }
  }

  const handleDeleteExpense = async (id: string, title: string) => {
    if (!confirm(`Yakin ingin menghapus pengeluaran "${title}"?`)) return

    try {
      const res = await fetch(`/api/admin/expenses?id=${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete')
      }

      toast.success(`Pengeluaran "${title}" berhasil dihapus!`)
      fetchData()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Gagal menghapus pengeluaran')
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

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`
  }

  const formatDateShort = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const getFilteredData = () => {
    const now = new Date()
    let filteredRevenue = [...stats.revenue.byDay]
    let filteredExpense = [...stats.expense.byDay]

    if (filterPeriod === 'day') {
      const today = now.toISOString().split('T')[0]
      filteredRevenue = filteredRevenue.filter(d => d.date === today)
      filteredExpense = filteredExpense.filter(d => d.date === today)
    } else if (filterPeriod === 'week') {
      const weekAgo = new Date(now)
      weekAgo.setDate(now.getDate() - 7)
      const weekAgoStr = weekAgo.toISOString().split('T')[0]
      filteredRevenue = filteredRevenue.filter(d => d.date >= weekAgoStr)
      filteredExpense = filteredExpense.filter(d => d.date >= weekAgoStr)
    } else if (filterPeriod === 'month') {
      const monthAgo = new Date(now)
      monthAgo.setMonth(now.getMonth() - 1)
      const monthAgoStr = monthAgo.toISOString().split('T')[0]
      filteredRevenue = filteredRevenue.filter(d => d.date >= monthAgoStr)
      filteredExpense = filteredExpense.filter(d => d.date >= monthAgoStr)
    } else if (filterPeriod === 'year') {
      const yearAgo = new Date(now)
      yearAgo.setFullYear(now.getFullYear() - 1)
      const yearAgoStr = yearAgo.toISOString().split('T')[0]
      filteredRevenue = filteredRevenue.filter(d => d.date >= yearAgoStr)
      filteredExpense = filteredExpense.filter(d => d.date >= yearAgoStr)
    }

    const combinedData = filteredRevenue.map((item) => {
      const expenseItem = filteredExpense.find(e => e.date === item.date)
      return {
        date: item.date,
        revenue: item.revenue,
        expense: expenseItem?.expense || 0,
      }
    })

    return combinedData
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
  const pendingBookings = bookings.filter(b => b.status === 'PENDING')
  const lowStockProducts = stats.lowStockProducts || []

  const pieData = stats.topProducts.map((item) => ({
    name: item.name,
    value: item.revenue,
  }))

  const filteredData = getFilteredData()

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0)

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

      {/* 1. NOTIFIKASI PEMESANAN & BOOKING */}
      <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PENDING ORDERS */}
        <div>
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
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
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
                        Rp {order.finalPrice.toLocaleString()}
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

        {/* PENDING BOOKINGS */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5" style={{ color: primaryColor }} />
            Notifikasi Booking
            {pendingBookings.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {pendingBookings.length} baru
              </span>
            )}
          </h2>

          {pendingBookings.length === 0 ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center text-green-600">
              ✅ Tidak ada booking pending
            </div>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {pendingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">{booking.customerName}</p>
                      <p className="text-sm text-gray-500">{booking.whatsapp}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Pending
                    </span>
                  </div>

                  <div className="mt-2 space-y-1">
                    <p className="text-sm">
                      <span className="text-gray-500">Layanan:</span>{' '}
                      <span className="font-medium">{booking.service?.name || 'Unknown'}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">Tanggal:</span>{' '}
                      <span className="font-medium">
                        {new Date(booking.bookingDate).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">Waktu:</span>{' '}
                      <span className="font-medium">{booking.bookingTime}</span>
                    </p>
                    {booking.notes && (
                      <p className="text-sm text-gray-500">Catatan: {booking.notes}</p>
                    )}
                    <p className="text-xs text-gray-400">{formatDate(booking.createdAt)}</p>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleBookingAction(booking.id, 'approve')}
                      disabled={processingBooking === booking.id}
                      className="flex-1 py-2 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      Setujui
                    </button>
                    <button
                      onClick={() => handleBookingAction(booking.id, 'reject')}
                      disabled={processingBooking === booking.id}
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
      </div>

      {/* 2. STATISTIK KEUANGAN */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Pendapatan</p>
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.revenue.total)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 text-sm">
            <ArrowUpRight className="w-4 h-4 text-green-500" />
            <span className="text-green-500">+{formatCurrency(stats.revenue.today)}</span>
            <span className="text-gray-400">hari ini</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Pengeluaran</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-xl">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 text-sm">
            <button
              onClick={() => setShowExpenseForm(!showExpenseForm)}
              className="text-xs bg-pink-500 hover:bg-pink-600 text-white px-2 py-1 rounded-lg flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Catat Pengeluaran
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Laba Bersih</p>
              <p className={`text-2xl font-bold ${stats.profit.total >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatCurrency(stats.profit.total)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 text-sm">
            <span className="text-gray-400">Total - Pengeluaran</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Order</p>
              <p className="text-2xl font-bold text-gray-800">{stats.orders.total}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-xl">
              <ShoppingBag className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 text-sm">
            <Clock className="w-4 h-4 text-yellow-500" />
            <span className="text-yellow-500">{stats.orders.pending} pending</span>
            <span className="text-gray-400">menunggu</span>
          </div>
        </div>
      </div>

      {/* FORM CATAT PENGELUARAN */}
      {showExpenseForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {editingExpense ? 'Edit Pengeluaran' : 'Catat Pengeluaran'}
            </h2>
            <button
              onClick={() => {
                setShowExpenseForm(false)
                setEditingExpense(null)
                setExpenseForm({
                  title: '',
                  amount: '',
                  category: 'OPERATIONAL',
                  description: '',
                  date: new Date().toISOString().split('T')[0],
                })
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleExpenseSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Judul *</label>
              <input
                type="text"
                required
                value={expenseForm.title}
                onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="Contoh: Pembelian bahan baku"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Jumlah (Rp) *</label>
              <input
                type="number"
                required
                step="0.01"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="100000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Kategori *</label>
              <select
                value={expenseForm.category}
                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tanggal</label>
              <input
                type="date"
                value={expenseForm.date}
                onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
              <input
                type="text"
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="Deskripsi pengeluaran..."
              />
            </div>
            <div className="flex gap-2 items-end">
              <button
                type="submit"
                className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg"
              >
                {editingExpense ? 'Update' : 'Simpan'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowExpenseForm(false)
                  setEditingExpense(null)
                  setExpenseForm({
                    title: '',
                    amount: '',
                    category: 'OPERATIONAL',
                    description: '',
                    date: new Date().toISOString().split('T')[0],
                  })
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. STATS CARDS */}
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

      {/* 4. GRAFIK KEUANGAN DENGAN FILTER */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-pink-500" />
            Grafik Keuangan
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterPeriod('day')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                filterPeriod === 'day'
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={filterPeriod === 'day' ? { backgroundColor: primaryColor } : {}}
            >
              1 Hari
            </button>
            <button
              onClick={() => setFilterPeriod('week')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                filterPeriod === 'week'
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={filterPeriod === 'week' ? { backgroundColor: primaryColor } : {}}
            >
              1 Minggu
            </button>
            <button
              onClick={() => setFilterPeriod('month')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                filterPeriod === 'month'
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={filterPeriod === 'month' ? { backgroundColor: primaryColor } : {}}
            >
              1 Bulan
            </button>
            <button
              onClick={() => setFilterPeriod('year')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                filterPeriod === 'year'
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={filterPeriod === 'year' ? { backgroundColor: primaryColor } : {}}
            >
              1 Tahun
            </button>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
              <Bar dataKey="revenue" fill="#c4367b" radius={[4, 4, 0, 0]} name="Pendapatan" />
              <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Pengeluaran" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. RECENT BOOKINGS & STOCK HISTORY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Recent Bookings
          </h2>
          {stats.recentBookings.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No recent bookings</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {stats.recentBookings.map((booking) => (
                <div key={booking.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{booking.customerName}</p>
                    <p className="text-sm text-gray-500">
                      {booking.service?.name} - {new Date(booking.bookingDate).toLocaleDateString('id-ID')}
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-purple-500" />
            Stock History
          </h2>
          {stockHistories.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">Belum ada riwayat stok</p>
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

      {/* 6. TOP PRODUCTS & KONTRIBUSI PENDAPATAN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Top Products
          </h2>
          {stats.topProducts.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">Belum ada data penjualan</p>
          ) : (
            <div className="space-y-4">
              {stats.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-400">#{index + 1}</span>
                    <div>
                      <p className="font-medium text-gray-800">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.quantity} terjual</p>
                    </div>
                  </div>
                  <p className="font-bold text-pink-500">{formatCurrency(product.revenue)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-pink-500" />
            Kontribusi Pendapatan
          </h2>
          {pieData.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">Belum ada data penjualan</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
