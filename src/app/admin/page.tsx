'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { 
  Package, Calendar, MessageSquare, FileText, Users, Star, 
  RefreshCw, ShoppingBag, CheckCircle, XCircle, 
  Clock, DollarSign, TrendingUp, TrendingDown, BarChart3,
  CreditCard, ArrowUpRight, ArrowDownRight, Box, Plus, History, RotateCcw,
  Check, Truck, User, MapPin, Phone, Mail, FileText as FileIcon, Download,
  Tag, Ticket
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
// ✅ KODE BARU (DYNAMIC IMPORT)
import dynamic from 'next/dynamic'

// 🔥 LOAD CHART HANYA SAAT DIBUTUHKAN
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), {
  ssr: false,
  loading: () => <div className="h-80 animate-pulse bg-gray-100 rounded-xl" />
})

const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false })
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false })
const Legend = dynamic(() => import('recharts').then(mod => mod.Legend), { ssr: false })
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false })
const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false })
const Pie = dynamic(() => import('recharts').then(mod => mod.Pie), { ssr: false })
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false })

interface DashboardStats {
  totalProducts: number
  totalBookings: number
  totalTestimonials: number
  totalBlogPosts: number
  totalUsers: number
  totalReviews: number
  totalOrders: number
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
    bookingTime: string
    status: string
    address: string | null
    whatsapp: string
    email: string | null
    notes: string | null
    service: { name: string; price: number } | null
    completedAt: string | null
    approvedBy: { name: string } | null
    originalPrice: number
    discountAmount: number
    voucherCode: string | null
    totalPaid: number
  }>
  onProgressBookings: Array<{
    id: string
    customerName: string
    bookingDate: string
    bookingTime: string
    status: string
    address: string | null
    whatsapp: string
    email: string | null
    notes: string | null
    service: { name: string; price: number } | null
    approvedAt: string | null
    approvedBy: { name: string } | null
    originalPrice: number
    discountAmount: number
    voucherCode: string | null
    totalPaid: number
  }>
  onProgressOrders: Array<{
    id: string
    orderNumber: string
    customerName: string
    customerWhatsapp: string
    address: string | null
    email: string | null
    status: string
    items: Array<{
      productName: string
      quantity: number
      price: number
    }>
    approvedAt: string | null
    approvedBy: { name: string } | null
    subtotal: number
    discountAmount: number
    voucherCode: string | null
    shippingCost: number
    totalPaid: number
  }>
  historyOrders: Array<{
    id: string
    orderNumber: string
    customerName: string
    customerWhatsapp: string
    address: string | null
    email: string | null
    status: string
    items: Array<{
      productName: string
      quantity: number
      price: number
    }>
    createdAt: string
    completedAt: string | null
    approvedBy: { name: string } | null
    subtotal: number
    discountAmount: number
    voucherCode: string | null
    shippingCost: number
    totalPaid: number
  }>
  revenue: {
    total: number
    today: number
    week: number
    month: number
    byDay: Array<{ date: string; revenue: number }>
    product: {
      total: number
      today: number
      week: number
      month: number
      byDay: Array<{ date: string; revenue: number }>
    }
    booking: {
      total: number
      today: number
      week: number
      month: number
      byDay: Array<{ date: string; revenue: number }>
    }
  }
  expense: {
    total: number
    product: {
      total: number
      byDay: Array<{ date: string; expense: number }>
    }
    booking: {
      total: number
      byDay: Array<{ date: string; expense: number }>
    }
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
  revenueData: Array<{
    date: string
    productRevenue: number
    bookingRevenue: number
  }>
  expenseData: Array<{
    date: string
    productExpense: number
    bookingExpense: number
  }>
  pieChartData: Array<{
    name: string
    value: number
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
  orderNumber: string
  customerName: string
  customerWhatsapp: string
  email: string | null
  address: string | null
  productName: string
  quantity: number
  finalPrice: number
  status: string
  note: string | null
  createdAt: string
  subtotal: number
  discountAmount: number
  voucherCode: string | null
  shippingCost: number
  total: number
  items: Array<{
    productName: string
    quantity: number
    price: number
    total: number
  }>
}

interface Booking {
  id: string
  customerName: string
  whatsapp: string
  email: string | null
  address: string | null
  bookingDate: string
  bookingTime: string
  status: string
  service: { name: string; price: number } | null
  notes: string | null
  createdAt: string
  completedAt: string | null
  approvedAt: string | null
  approvedBy: { name: string } | null
  originalPrice: number
  discountAmount: number
  voucherCode: string | null
  totalPaid: number
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
  target: string
  description: string | null
  date: string
  createdAt: string
}

const COLORS = ['#c4367b', '#3b82f6', '#f472b6', '#a78bfa', '#34d399', '#fbbf24', '#60a5fa']

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
    totalOrders: 0,
    lowStockProducts: [],
    recentBookings: [],
    onProgressBookings: [],
    onProgressOrders: [],
    historyOrders: [],
    revenue: { 
      total: 0, 
      today: 0, 
      week: 0, 
      month: 0, 
      byDay: [],
      product: { total: 0, today: 0, week: 0, month: 0, byDay: [] },
      booking: { total: 0, today: 0, week: 0, month: 0, byDay: [] }
    },
    expense: { 
      total: 0,
      product: { total: 0, byDay: [] },
      booking: { total: 0, byDay: [] }
    },
    profit: { total: 0 },
    orders: { total: 0, pending: 0 },
    topProducts: [],
    revenueData: [],
    expenseData: [],
    pieChartData: [],
    recentTransactions: [],
  })
  const [orders, setOrders] = useState<Order[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [stockHistories, setStockHistories] = useState<StockHistory[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [processingOrder, setProcessingOrder] = useState<string | null>(null)
  const [processingBooking, setProcessingBooking] = useState<string | null>(null)
  const [processingDone, setProcessingDone] = useState<string | null>(null)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('week')
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    amount: '',
    category: 'OPERATIONAL',
    target: 'PRODUCT',
    description: '',
    date: new Date().toISOString().split('T')[0],
  })
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  const primaryColor = '#c4367b'

  const isTabActive = useRef(true)

  // 🔥 SPINNER COMPONENT
  const Spinner = ({ className = "h-4 w-4" }: { className?: string }) => (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  )

  useEffect(() => {
    const handleVisibilityChange = () => {
      isTabActive.current = !document.hidden
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const fetchData = useCallback(async (showLoading = true, period?: FilterPeriod) => {
    try {
      if (showLoading) {
        setRefreshing(true)
      }
      
      const currentPeriod = period || filterPeriod
      const url = `/api/admin/dashboard?period=${currentPeriod}`
      
      const [
        statsRes,
        ordersRes,
        bookingsRes,
        historyRes,
        expensesRes
      ] = await Promise.all([
        fetch(url),
        fetch('/api/admin/orders?status=PENDING'),
        fetch('/api/admin/bookings?status=PENDING'),
        fetch('/api/admin/stock-history?limit=10'),
        fetch('/api/admin/expenses'),
      ])

      if (statsRes.ok) {
        const data = await statsRes.json()
        console.log('📊 Dashboard data:', data)
        setStats(data)
      } else {
        const error = await statsRes.json()
        console.error('Error from API:', error)
        toast.error(error.error || 'Gagal memuat data dashboard')
      }

      if (ordersRes.ok) {
        const data = await ordersRes.json()
        setOrders(data)
      }

      if (bookingsRes.ok) {
        const data = await bookingsRes.json()
        setBookings(data)
      }

      if (historyRes.ok) {
        const data = await historyRes.json()
        setStockHistories(data)
      }

      if (expensesRes.ok) {
        const data = await expensesRes.json()
        setExpenses(data || [])
      }

      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Gagal memuat data')
    } finally {
      if (showLoading) {
        setRefreshing(false)
      }
      setLoading(false)
    }
  }, [filterPeriod])

  useEffect(() => {
    fetchData(true)

    const interval = setInterval(() => {
      if (isTabActive.current) {
        fetchData(false)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [fetchData])

  const handleManualRefresh = () => {
    fetchData(true)
  }

  const handleFilterChange = (period: FilterPeriod) => {
    setFilterPeriod(period)
    fetchData(true, period)
  }

  // 🔥 FUNGSI RENDER VOUCHER BADGE
  const renderVoucherBadge = (voucherCode: string | null, discountAmount: number) => {
    if (!voucherCode || discountAmount <= 0) return null
    return (
      <span className="inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
        <Ticket className="w-3 h-3" />
        {voucherCode} (Rp {discountAmount.toLocaleString()})
      </span>
    )
  }

  // 🔥 FUNGSI RENDER HARGA DENGAN DISKON
  const renderPriceDetail = (original: number, discount: number, total: number, shipping: number = 0) => {
    const hasDiscount = discount > 0
    return (
      <div className="space-y-0.5 text-sm">
        {hasDiscount && (
          <p className="text-xs text-gray-400 line-through">
            Rp {original.toLocaleString()}
          </p>
        )}
        <p className="text-sm font-medium text-green-600">
          Rp {total.toLocaleString()}
        </p>
        {shipping > 0 && (
          <p className="text-xs text-gray-400">+ Ongkir Rp {shipping.toLocaleString()}</p>
        )}
      </div>
    )
  }

  const handleExportPDF = async () => {
    setExporting(true)
    try {
      toast.loading('Menyiapkan data untuk PDF...')
      
      const res = await fetch('/api/admin/dashboard?period=all')
      const data = await res.json()
      
      const element = document.createElement('div')
      element.style.padding = '40px'
      element.style.fontFamily = 'Arial, sans-serif'
      element.style.backgroundColor = '#ffffff'
      element.style.width = '900px'
      element.style.maxWidth = '100%'
      
      element.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #c4367b; padding-bottom: 20px;">
          <h1 style="color: #c4367b; font-size: 28px; margin: 0; font-weight: bold;">📊 LAPORAN DASHBOARD</h1>
          <p style="color: #666; font-size: 14px; margin-top: 5px;">
            ${new Date().toLocaleString('id-ID', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit',
              second: '2-digit'
            })}
          </p>
          <p style="color: #999; font-size: 11px; margin-top: 2px;">
            *Laporan ini mencakup semua data dari sistem (tidak terpengaruh reset dashboard)
          </p>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px;">
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #e5e7eb;">
            <p style="color: #666; font-size: 11px; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Total Products</p>
            <p style="color: #c4367b; font-size: 22px; font-weight: bold; margin: 5px 0;">${data.totalProducts || 0}</p>
          </div>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #e5e7eb;">
            <p style="color: #666; font-size: 11px; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Total Services</p>
            <p style="color: #3b82f6; font-size: 22px; font-weight: bold; margin: 5px 0;">${data.totalBookings || 0}</p>
          </div>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #e5e7eb;">
            <p style="color: #666; font-size: 11px; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Total Testimonials</p>
            <p style="color: #22c55e; font-size: 22px; font-weight: bold; margin: 5px 0;">${data.totalTestimonials || 0}</p>
          </div>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #e5e7eb;">
            <p style="color: #666; font-size: 11px; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Total Blog Posts</p>
            <p style="color: #8b5cf6; font-size: 22px; font-weight: bold; margin: 5px 0;">${data.totalBlogPosts || 0}</p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px;">
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #e5e7eb;">
            <p style="color: #666; font-size: 11px; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Total Users</p>
            <p style="color: #f59e0b; font-size: 22px; font-weight: bold; margin: 5px 0;">${data.totalUsers || 0}</p>
          </div>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #e5e7eb;">
            <p style="color: #666; font-size: 11px; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Total Reviews</p>
            <p style="color: #eab308; font-size: 22px; font-weight: bold; margin: 5px 0;">${data.totalReviews || 0}</p>
          </div>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #e5e7eb;">
            <p style="color: #666; font-size: 11px; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Total Orders</p>
            <p style="color: #ef4444; font-size: 22px; font-weight: bold; margin: 5px 0;">${data.totalOrders || 0}</p>
          </div>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #e5e7eb;">
            <p style="color: #666; font-size: 11px; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Pending Orders</p>
            <p style="color: #f59e0b; font-size: 22px; font-weight: bold; margin: 5px 0;">${data.orders?.pending || 0}</p>
          </div>
        </div>

        <div style="margin-bottom: 25px;">
          <h2 style="color: #333; font-size: 16px; border-bottom: 2px solid #c4367b; padding-bottom: 8px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
            💰 <span style="font-weight: bold;">Ringkasan Keuangan</span>
          </h2>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
            <div style="background: #ecfdf5; padding: 12px; border-radius: 6px; border-left: 4px solid #22c55e;">
              <p style="color: #666; font-size: 10px; margin: 0; text-transform: uppercase;">Total Pendapatan</p>
              <p style="color: #22c55e; font-size: 18px; font-weight: bold; margin: 2px 0;">Rp ${(data.revenue?.total || 0).toLocaleString()}</p>
            </div>
            <div style="background: #fef2f2; padding: 12px; border-radius: 6px; border-left: 4px solid #ef4444;">
              <p style="color: #666; font-size: 10px; margin: 0; text-transform: uppercase;">Total Pengeluaran</p>
              <p style="color: #ef4444; font-size: 18px; font-weight: bold; margin: 2px 0;">Rp ${(data.expense?.total || 0).toLocaleString()}</p>
            </div>
            <div style="background: #eff6ff; padding: 12px; border-radius: 6px; border-left: 4px solid #3b82f6;">
              <p style="color: #666; font-size: 10px; margin: 0; text-transform: uppercase;">Laba Bersih</p>
              <p style="color: #3b82f6; font-size: 18px; font-weight: bold; margin: 2px 0;">Rp ${(data.profit?.total || 0).toLocaleString()}</p>
            </div>
            <div style="background: #fef3c7; padding: 12px; border-radius: 6px; border-left: 4px solid #f59e0b;">
              <p style="color: #666; font-size: 10px; margin: 0; text-transform: uppercase;">Pendapatan Hari Ini</p>
              <p style="color: #f59e0b; font-size: 18px; font-weight: bold; margin: 2px 0;">Rp ${(data.revenue?.today || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div style="margin-bottom: 25px;">
          <h2 style="color: #333; font-size: 16px; border-bottom: 2px solid #c4367b; padding-bottom: 8px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
            📈 <span style="font-weight: bold;">Detail Pendapatan</span>
          </h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div style="background: #faf5ff; padding: 12px; border-radius: 6px;">
              <p style="color: #7c3aed; font-weight: bold; margin: 0 0 4px 0;">Pendapatan Produk</p>
              <p style="font-size: 14px; margin: 2px 0;">Total: <strong>Rp ${(data.revenue?.product?.total || 0).toLocaleString()}</strong></p>
              <p style="font-size: 12px; color: #666; margin: 2px 0;">Hari ini: Rp ${(data.revenue?.product?.today || 0).toLocaleString()}</p>
              <p style="font-size: 12px; color: #666; margin: 2px 0;">Minggu ini: Rp ${(data.revenue?.product?.week || 0).toLocaleString()}</p>
              <p style="font-size: 12px; color: #666; margin: 2px 0;">Bulan ini: Rp ${(data.revenue?.product?.month || 0).toLocaleString()}</p>
            </div>
            <div style="background: #f5f3ff; padding: 12px; border-radius: 6px;">
              <p style="color: #4f46e5; font-weight: bold; margin: 0 0 4px 0;">Pendapatan Booking</p>
              <p style="font-size: 14px; margin: 2px 0;">Total: <strong>Rp ${(data.revenue?.booking?.total || 0).toLocaleString()}</strong></p>
              <p style="font-size: 12px; color: #666; margin: 2px 0;">Hari ini: Rp ${(data.revenue?.booking?.today || 0).toLocaleString()}</p>
              <p style="font-size: 12px; color: #666; margin: 2px 0;">Minggu ini: Rp ${(data.revenue?.booking?.week || 0).toLocaleString()}</p>
              <p style="font-size: 12px; color: #666; margin: 2px 0;">Bulan ini: Rp ${(data.revenue?.booking?.month || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div style="margin-bottom: 25px;">
          <h2 style="color: #333; font-size: 16px; border-bottom: 2px solid #c4367b; padding-bottom: 8px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
            💸 <span style="font-weight: bold;">Detail Pengeluaran</span>
          </h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div style="background: #fef2f2; padding: 12px; border-radius: 6px;">
              <p style="color: #dc2626; font-weight: bold; margin: 0 0 4px 0;">Pengeluaran Produk</p>
              <p style="font-size: 14px; margin: 2px 0;">Total: <strong>Rp ${(data.expense?.product?.total || 0).toLocaleString()}</strong></p>
            </div>
            <div style="background: #fff7ed; padding: 12px; border-radius: 6px;">
              <p style="color: #ea580c; font-weight: bold; margin: 0 0 4px 0;">Pengeluaran Booking</p>
              <p style="font-size: 14px; margin: 2px 0;">Total: <strong>Rp ${(data.expense?.booking?.total || 0).toLocaleString()}</strong></p>
            </div>
          </div>
        </div>

        <div style="margin-bottom: 25px;">
          <h2 style="color: #333; font-size: 16px; border-bottom: 2px solid #c4367b; padding-bottom: 8px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
            ⚠️ <span style="font-weight: bold;">Low Stock Products</span>
            ${data.lowStockProducts && data.lowStockProducts.length > 0 ? `<span style="background: #ef4444; color: white; font-size: 10px; padding: 1px 8px; border-radius: 10px;">${data.lowStockProducts.length}</span>` : ''}
          </h2>
          ${data.lowStockProducts && data.lowStockProducts.length > 0 ? `
            <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
              <thead>
                <tr style="background: #f1f5f9;">
                  <th style="padding: 6px 8px; text-align: left; border: 1px solid #e2e8f0; font-weight: 600;">#</th>
                  <th style="padding: 6px 8px; text-align: left; border: 1px solid #e2e8f0; font-weight: 600;">Product Name</th>
                  <th style="padding: 6px 8px; text-align: center; border: 1px solid #e2e8f0; font-weight: 600;">Stock</th>
                  <th style="padding: 6px 8px; text-align: center; border: 1px solid #e2e8f0; font-weight: 600;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${data.lowStockProducts.map((p: any, i: number) => `
                  <tr>
                    <td style="padding: 5px 8px; border: 1px solid #e2e8f0; text-align: center;">${i + 1}</td>
                    <td style="padding: 5px 8px; border: 1px solid #e2e8f0;">${p.name}</td>
                    <td style="padding: 5px 8px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold; color: ${p.stock <= 0 ? '#ef4444' : '#f59e0b'};">${p.stock}</td>
                    <td style="padding: 5px 8px; border: 1px solid #e2e8f0; text-align: center;">
                      <span style="background: ${p.stock <= 0 ? '#ef4444' : '#f59e0b'}; color: white; padding: 1px 8px; border-radius: 10px; font-size: 9px;">
                        ${p.stock <= 0 ? 'OUT OF STOCK' : 'LOW STOCK'}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : '<p style="color: #22c55e; font-size: 12px; padding: 10px; background: #f0fdf4; border-radius: 4px;">✅ Semua produk dalam stok aman</p>'}
        </div>

        <div style="margin-bottom: 25px;">
          <h2 style="color: #333; font-size: 16px; border-bottom: 2px solid #c4367b; padding-bottom: 8px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
            📋 <span style="font-weight: bold;">Recent Bookings (Completed)</span>
            ${data.recentBookings && data.recentBookings.length > 0 ? `<span style="background: #22c55e; color: white; font-size: 10px; padding: 1px 8px; border-radius: 10px;">${data.recentBookings.length}</span>` : ''}
          </h2>
          ${data.recentBookings && data.recentBookings.length > 0 ? `
            <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
              <thead>
                <tr style="background: #f1f5f9;">
                  <th style="padding: 5px 6px; text-align: left; border: 1px solid #e2e8f0; font-weight: 600;">Customer</th>
                  <th style="padding: 5px 6px; text-align: left; border: 1px solid #e2e8f0; font-weight: 600;">Service</th>
                  <th style="padding: 5px 6px; text-align: left; border: 1px solid #e2e8f0; font-weight: 600;">Date</th>
                  <th style="padding: 5px 6px; text-align: left; border: 1px solid #e2e8f0; font-weight: 600;">Time</th>
                  <th style="padding: 5px 6px; text-align: center; border: 1px solid #e2e8f0; font-weight: 600;">Status</th>
                  <th style="padding: 5px 6px; text-align: center; border: 1px solid #e2e8f0; font-weight: 600;">WhatsApp</th>
                </tr>
              </thead>
              <tbody>
                ${data.recentBookings.map((b: any) => `
                  <tr>
                    <td style="padding: 4px 6px; border: 1px solid #e2e8f0;">${b.customerName}</td>
                    <td style="padding: 4px 6px; border: 1px solid #e2e8f0;">${b.service?.name || '-'}</td>
                    <td style="padding: 4px 6px; border: 1px solid #e2e8f0;">${new Date(b.bookingDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td style="padding: 4px 6px; border: 1px solid #e2e8f0;">${b.bookingTime}</td>
                    <td style="padding: 4px 6px; border: 1px solid #e2e8f0; text-align: center;">
                      <span style="background: #22c55e; color: white; padding: 1px 8px; border-radius: 10px; font-size: 8px;">${b.status}</span>
                    </td>
                    <td style="padding: 4px 6px; border: 1px solid #e2e8f0; text-align: center; font-size: 9px;">${b.whatsapp}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : '<p style="color: #999; text-align: center; padding: 20px; background: #fafafa; border-radius: 4px;">Tidak ada data booking completed</p>'}
        </div>

        <div style="margin-bottom: 25px;">
          <h2 style="color: #333; font-size: 16px; border-bottom: 2px solid #c4367b; padding-bottom: 8px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
            🔄 <span style="font-weight: bold;">On Progress Bookings</span>
            ${data.onProgressBookings && data.onProgressBookings.length > 0 ? `<span style="background: #3b82f6; color: white; font-size: 10px; padding: 1px 8px; border-radius: 10px;">${data.onProgressBookings.length}</span>` : ''}
          </h2>
          ${data.onProgressBookings && data.onProgressBookings.length > 0 ? `
            <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
              <thead>
                <tr style="background: #f1f5f9;">
                  <th style="padding: 5px 6px; text-align: left; border: 1px solid #e2e8f0; font-weight: 600;">Customer</th>
                  <th style="padding: 5px 6px; text-align: left; border: 1px solid #e2e8f0; font-weight: 600;">Service</th>
                  <th style="padding: 5px 6px; text-align: left; border: 1px solid #e2e8f0; font-weight: 600;">Date</th>
                  <th style="padding: 5px 6px; text-align: left; border: 1px solid #e2e8f0; font-weight: 600;">Time</th>
                  <th style="padding: 5px 6px; text-align: center; border: 1px solid #e2e8f0; font-weight: 600;">Approved At</th>
                </tr>
              </thead>
              <tbody>
                ${data.onProgressBookings.map((b: any) => `
                  <tr>
                    <td style="padding: 4px 6px; border: 1px solid #e2e8f0;">${b.customerName}</td>
                    <td style="padding: 4px 6px; border: 1px solid #e2e8f0;">${b.service?.name || '-'}</td>
                    <td style="padding: 4px 6px; border: 1px solid #e2e8f0;">${new Date(b.bookingDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td style="padding: 4px 6px; border: 1px solid #e2e8f0;">${b.bookingTime}</td>
                    <td style="padding: 4px 6px; border: 1px solid #e2e8f0; text-align: center; font-size: 9px;">${b.approvedAt ? new Date(b.approvedAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : '<p style="color: #999; text-align: center; padding: 20px; background: #fafafa; border-radius: 4px;">Tidak ada booking on progress</p>'}
        </div>

        <div style="margin-bottom: 25px;">
          <h2 style="color: #333; font-size: 16px; border-bottom: 2px solid #c4367b; padding-bottom: 8px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
            📦 <span style="font-weight: bold;">On Progress Orders</span>
            ${data.onProgressOrders && data.onProgressOrders.length > 0 ? `<span style="background: #f59e0b; color: white; font-size: 10px; padding: 1px 8px; border-radius: 10px;">${data.onProgressOrders.length}</span>` : ''}
          </h2>
          ${data.onProgressOrders && data.onProgressOrders.length > 0 ? `
            <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
              <thead>
                <tr style="background: #f1f5f9;">
                  <th style="padding: 5px 6px; text-align: left; border: 1px solid #e2e8f0; font-weight: 600;">Order #</th>
                  <th style="padding: 5px 6px; text-align: left; border: 1px solid #e2e8f0; font-weight: 600;">Customer</th>
                  <th style="padding: 5px 6px; text-align: left; border: 1px solid #e2e8f0; font-weight: 600;">Items</th>
                  <th style="padding: 5px 6px; text-align: right; border: 1px solid #e2e8f0; font-weight: 600;">Total</th>
                  <th style="padding: 5px 6px; text-align: center; border: 1px solid #e2e8f0; font-weight: 600;">Approved At</th>
                </tr>
              </thead>
              <tbody>
                ${data.onProgressOrders.map((o: any) => `
                  <tr>
                    <td style="padding: 4px 6px; border: 1px solid #e2e8f0; font-weight: 600;">${o.orderNumber}</td>
                    <td style="padding: 4px 6px; border: 1px solid #e2e8f0;">${o.customerName}</td>
                    <td style="padding: 4px 6px; border: 1px solid #e2e8f0; font-size: 9px;">
                      ${o.items.map((item: any) => `${item.productName} x${item.quantity}`).join(', ')}
                    </td>
                    <td style="padding: 4px 6px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #c4367b;">Rp ${o.total.toLocaleString()}</td>
                    <td style="padding: 4px 6px; border: 1px solid #e2e8f0; text-align: center; font-size: 9px;">${o.approvedAt ? new Date(o.approvedAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : '<p style="color: #999; text-align: center; padding: 20px; background: #fafafa; border-radius: 4px;">Tidak ada order on progress</p>'}
        </div>

        <div style="margin-bottom: 25px;">
          <h2 style="color: #333; font-size: 16px; border-bottom: 2px solid #c4367b; padding-bottom: 8px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
            🕐 <span style="font-weight: bold;">History Orders (Completed)</span>
            ${data.historyOrders && data.historyOrders.length > 0 ? `<span style="background: #8b5cf6; color: white; font-size: 10px; padding: 1px 8px; border-radius: 10px;">${data.historyOrders.length}</span>` : ''}
          </h2>
          ${data.historyOrders && data.historyOrders.length > 0 ? `
            <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
              <thead>
                <tr style="background: #f1f5f9;">
                  <th style="padding: 5px 6px; text-align: left; border: 1px solid #e2e8f0; font-weight: 600;">Order #</th>
                  <th style="padding: 5px 6px; text-align: left; border: 1px solid #e2e8f0; font-weight: 600;">Customer</th>
                  <th style="padding: 5px 6px; text-align: left; border: 1px solid #e2e8f0; font-weight: 600;">Items</th>
                  <th style="padding: 5px 6px; text-align: right; border: 1px solid #e2e8f0; font-weight: 600;">Total</th>
                  <th style="padding: 5px 6px; text-align: center; border: 1px solid #e2e8f0; font-weight: 600;">Completed At</th>
                </tr>
              </thead>
              <tbody>
                ${data.historyOrders.map((o: any) => `
                  <tr>
                    <td style="padding: 4px 6px; border: 1px solid #e2e8f0; font-weight: 600;">${o.orderNumber}</td>
                    <td style="padding: 4px 6px; border: 1px solid #e2e8f0;">${o.customerName}</td>
                    <td style="padding: 4px 6px; border: 1px solid #e2e8f0; font-size: 9px;">
                      ${o.items.map((item: any) => `${item.productName} x${item.quantity}`).join(', ')}
                    </td>
                    <td style="padding: 4px 6px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #c4367b;">Rp ${o.total.toLocaleString()}</td>
                    <td style="padding: 4px 6px; border: 1px solid #e2e8f0; text-align: center; font-size: 9px;">${o.completedAt ? new Date(o.completedAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : '<p style="color: #999; text-align: center; padding: 20px; background: #fafafa; border-radius: 4px;">Tidak ada history order</p>'}
        </div>

        <div style="margin-bottom: 25px;">
          <h2 style="color: #333; font-size: 16px; border-bottom: 2px solid #c4367b; padding-bottom: 8px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
            🏆 <span style="font-weight: bold;">Top 5 Products</span>
          </h2>
          ${data.topProducts && data.topProducts.length > 0 ? `
            <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
              <thead>
                <tr style="background: #f1f5f9;">
                  <th style="padding: 6px 8px; text-align: center; border: 1px solid #e2e8f0; font-weight: 600;">Rank</th>
                  <th style="padding: 6px 8px; text-align: left; border: 1px solid #e2e8f0; font-weight: 600;">Product Name</th>
                  <th style="padding: 6px 8px; text-align: center; border: 1px solid #e2e8f0; font-weight: 600;">Quantity Sold</th>
                  <th style="padding: 6px 8px; text-align: right; border: 1px solid #e2e8f0; font-weight: 600;">Revenue</th>
                </tr>
              </thead>
              <tbody>
                ${data.topProducts.map((p: any, i: number) => `
                  <tr style="${i === 0 ? 'background: #fef3c7;' : ''}">
                    <td style="padding: 5px 8px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold; font-size: 14px;">${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</td>
                    <td style="padding: 5px 8px; border: 1px solid #e2e8f0;">${p.name}</td>
                    <td style="padding: 5px 8px; border: 1px solid #e2e8f0; text-align: center;">${p.quantity} unit</td>
                    <td style="padding: 5px 8px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #c4367b;">Rp ${p.revenue.toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : '<p style="color: #999; text-align: center; padding: 20px; background: #fafafa; border-radius: 4px;">Belum ada data penjualan produk</p>'}
        </div>

        <div style="margin-top: 30px; border-top: 2px solid #e5e7eb; padding-top: 15px; text-align: center; font-size: 10px; color: #999;">
          <p style="margin: 2px 0;">
            Laporan ini dibuat secara otomatis dari sistem dashboard pada 
            ${new Date().toLocaleString('id-ID', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit',
              second: '2-digit'
            })}
          </p>
          <p style="margin: 2px 0; color: #ccc;">
            © ${new Date().getFullYear()} - Laporan mencakup seluruh data transaksi dari awal hingga saat ini
          </p>
        </div>
      `

      document.body.appendChild(element)
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 900,
        height: element.scrollHeight,
        windowHeight: element.scrollHeight,
      })
      
      const imgData = canvas.toDataURL('image/jpeg', 0.98)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })
      
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight)
      
      pdf.save(`laporan-dashboard-${new Date().toISOString().split('T')[0]}.pdf`)
      
      document.body.removeChild(element)
      
      toast.dismiss()
      toast.success('✅ PDF berhasil di-download!')
    } catch (error) {
      console.error('Error exporting PDF:', error)
      toast.dismiss()
      toast.error('Gagal export PDF')
    } finally {
      setExporting(false)
    }
  }

  const handleConfirmReset = async () => {
    setShowResetModal(false)
    setResetting(true)
    try {
      const res = await fetch('/api/admin/dashboard/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset')
      }

      setStats({
        totalProducts: stats.totalProducts,
        totalBookings: stats.totalBookings,
        totalTestimonials: stats.totalTestimonials,
        totalBlogPosts: stats.totalBlogPosts,
        totalUsers: stats.totalUsers,
        totalReviews: stats.totalReviews,
        totalOrders: 0,
        lowStockProducts: [],
        recentBookings: [],
        onProgressBookings: [],
        onProgressOrders: [],
        historyOrders: [],
        revenue: { 
          total: 0, 
          today: 0, 
          week: 0, 
          month: 0, 
          byDay: [],
          product: { total: 0, today: 0, week: 0, month: 0, byDay: [] },
          booking: { total: 0, today: 0, week: 0, month: 0, byDay: [] }
        },
        expense: { 
          total: 0,
          product: { total: 0, byDay: [] },
          booking: { total: 0, byDay: [] }
        },
        profit: { total: 0 },
        orders: { total: 0, pending: 0 },
        topProducts: [],
        revenueData: [],
        expenseData: [],
        pieChartData: [],
        recentTransactions: [],
      })
      setOrders([])
      setBookings([])
      setStockHistories([])
      setExpenses([])
      setLastUpdated(null)

      toast.success('✅ Dashboard berhasil direset!')
      
      await fetchData(true)
      
    } catch (error: any) {
      console.error('Error resetting data:', error)
      toast.error(error.message || 'Gagal mereset dashboard')
    } finally {
      setResetting(false)
    }
  }

  const handleOrderAction = async (orderId: string, action: 'approve' | 'reject' | 'done') => {
    if (action === 'done') {
      setProcessingDone(orderId)
    } else {
      setProcessingOrder(orderId)
    }
    
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      const data = await res.json()

      if (res.ok) {
        if (action === 'approve') {
          toast.success('✅ Pesanan diproses!')
        } else if (action === 'done') {
          toast.success('✅ Pesanan selesai!')
        } else {
          toast.success('❌ Pesanan ditolak')
        }
        fetchData(false)
      } else {
        toast.error(data.error || 'Gagal memproses pesanan')
      }
    } catch (error) {
      console.error('Error processing order:', error)
      toast.error('Terjadi kesalahan')
    } finally {
      setProcessingOrder(null)
      setProcessingDone(null)
    }
  }

  const handleBookingAction = async (bookingId: string, action: 'approve' | 'reject' | 'done') => {
    if (action === 'done') {
      setProcessingDone(bookingId)
    } else {
      setProcessingBooking(bookingId)
    }
    
    try {
      let status = ''
      let successMessage = ''
      
      if (action === 'approve') {
        status = 'ON_PROGRESS'
        successMessage = '✅ Booking diproses!'
      } else if (action === 'done') {
        status = 'COMPLETED'
        successMessage = '✅ Booking selesai!'
      } else {
        status = 'REJECTED'
        successMessage = '❌ Booking ditolak'
      }

      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(successMessage)
        fetchData(false)
      } else {
        toast.error(data.error || 'Gagal memproses booking')
      }
    } catch (error) {
      console.error('Error processing booking:', error)
      toast.error('Terjadi kesalahan')
    } finally {
      setProcessingBooking(null)
      setProcessingDone(null)
    }
  }

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!expenseForm.title.trim() || !expenseForm.amount || parseFloat(expenseForm.amount) <= 0) {
      toast.error('Judul dan jumlah harus diisi dengan benar')
      return
    }

    try {
      const url = '/api/admin/expenses'
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
      fetchData(false)
      setShowExpenseForm(false)
      setEditingExpense(null)
      setExpenseForm({
        title: '',
        amount: '',
        category: 'OPERATIONAL',
        target: 'PRODUCT',
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
      fetchData(false)
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

  const getCombinedChartData = () => {
    const revenueData = stats.revenueData || []
    const expenseData = stats.expenseData || []

    const dateMap = new Map<string, {
      date: string
      productRevenue: number
      bookingRevenue: number
      productExpense: number
      bookingExpense: number
    }>()

    revenueData.forEach(item => {
      if (!dateMap.has(item.date)) {
        dateMap.set(item.date, {
          date: item.date,
          productRevenue: 0,
          bookingRevenue: 0,
          productExpense: 0,
          bookingExpense: 0
        })
      }
      const existing = dateMap.get(item.date)!
      existing.productRevenue = item.productRevenue || 0
      existing.bookingRevenue = item.bookingRevenue || 0
    })

    expenseData.forEach(item => {
      if (!dateMap.has(item.date)) {
        dateMap.set(item.date, {
          date: item.date,
          productRevenue: 0,
          bookingRevenue: 0,
          productExpense: 0,
          bookingExpense: 0
        })
      }
      const existing = dateMap.get(item.date)!
      existing.productExpense = item.productExpense || 0
      existing.bookingExpense = item.bookingExpense || 0
    })

    return Array.from(dateMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  const chartData = getCombinedChartData()

  const tooltipFormatter = (value: any, name: string) => {
    if (value === undefined || value === null) return ['Rp 0', name]
    if (typeof value === 'number') return [`Rp ${value.toLocaleString('id-ID')}`, name]
    return ['Rp 0', name]
  }

  const pieTooltipFormatter = (value: any) => {
    if (value === undefined || value === null) return 'Rp 0'
    if (typeof value === 'number') return `Rp ${value.toLocaleString('id-ID')}`
    return 'Rp 0'
  }

  const renderPieLabel = (props: any) => {
    const { name, percent } = props
    if (!name) return ''
    if (percent === undefined) return name
    return `${name} (${(percent * 100).toFixed(0)}%)`
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
      title: 'Products',
      value: stats.totalProducts, 
      icon: Package, 
      color: 'bg-pink-100 text-pink-600',
      href: '/admin/products'
    },
    { 
      title: 'Services',
      value: stats.totalBookings, 
      icon: Calendar, 
      color: 'bg-blue-100 text-blue-600',
      href: '/admin/services'
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
  
  const pieData = stats.pieChartData && stats.pieChartData.length > 0 
    ? stats.pieChartData 
    : [{ name: 'Pendapatan Product', value: stats.revenue?.product?.total || 0 },
       { name: 'Pendapatan Booking', value: stats.revenue?.booking?.total || 0 }]

  const validPieData = pieData.filter(d => d.value > 0)
  const displayPieData = validPieData.length > 0 ? validPieData : [{ name: 'Belum ada data', value: 1 }]

  const totalExpense = stats.expense?.total || 0

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-gray-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {refreshing ? <Spinner /> : <RefreshCw className="w-4 h-4" />}
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={() => setShowResetModal(true)}
            disabled={resetting}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {resetting ? <Spinner className="h-4 w-4 text-white" /> : <RotateCcw className="w-4 h-4" />}
            {resetting ? 'Resetting...' : 'Reset'}
          </button>
        </div>
      </div>

      {/* RESET MODAL */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <RotateCcw className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">⚠️ Konfirmasi Reset</h3>
                <p className="text-sm text-gray-500">Apakah Anda yakin ingin mereset semua data?</p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800 flex items-start gap-2">
                <span className="text-lg">💡</span>
                <span>
                  <strong>Sebaiknya lakukan EXPORT PDF terlebih dahulu</strong> sebelum Anda mereset ulang.
                  Data yang direset <strong>TIDAK DAPAT DIKEMBALIKAN</strong>.
                </span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleExportPDF}
                disabled={exporting}
                className="flex-1 py-2.5 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {exporting ? <Spinner className="h-5 w-5 text-white" /> : <Download className="w-5 h-5" />}
                {exporting ? 'Mengexport...' : 'Export PDF'}
              </button>
              <button
                onClick={handleConfirmReset}
                className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                Reset
              </button>
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-2.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== NOTIFIKASI BOOKING & PESANAN ===== */}
      <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Bookings */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5" style={{ color: primaryColor }} />
            Notifikasi Booking Layanan
            {pendingBookings.length > 0 && (
              <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
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
                <div key={booking.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">{booking.customerName}</p>
                      <p className="text-sm text-gray-500">{booking.whatsapp}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1 animate-pulse">
                      <Clock className="w-3 h-3" /> Pending
                    </span>
                  </div>

                  <div className="mt-2 space-y-1 text-sm">
                    <p><span className="text-gray-500">Layanan:</span> <span className="font-medium">{booking.service?.name || 'Unknown'}</span></p>
                    <p><span className="text-gray-500">Tanggal:</span> <span className="font-medium">{new Date(booking.bookingDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span></p>
                    <p><span className="text-gray-500">Waktu:</span> <span className="font-medium">{booking.bookingTime}</span></p>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-gray-500">Harga:</p>
                      {booking.discountAmount > 0 ? (
                        <>
                          <p className="text-xs text-gray-400 line-through">Rp {(booking.originalPrice || 0).toLocaleString()}</p>
                          <p className="text-sm font-medium text-green-600">
                            Rp {(booking.totalPaid || 0).toLocaleString()}
                            {/* 🔥 VOUCHER BADGE - SEPERTI PRODUK */}
                            {booking.voucherCode && booking.discountAmount > 0 && (
                              <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                <Ticket className="w-3 h-3" />
                                {booking.voucherCode}
                              </span>
                            )}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm font-medium">Rp {(booking.originalPrice || 0).toLocaleString()}</p>
                      )}
                    </div>
                    {booking.notes && <p className="text-sm text-gray-500">Catatan: {booking.notes}</p>}
                    <p className="text-xs text-gray-400">ID: {booking.id}</p>
                    <p className="text-xs text-gray-400">{formatDate(booking.createdAt)}</p>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button 
                      onClick={() => handleBookingAction(booking.id, 'approve')} 
                      disabled={processingBooking === booking.id || processingDone === booking.id} 
                      className="flex-1 py-2 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2" 
                      style={{ backgroundColor: primaryColor }}
                    >
                      {processingBooking === booking.id ? <Spinner className="h-4 w-4 text-white" /> : <CheckCircle className="w-4 h-4" />}
                      {processingBooking === booking.id ? 'Memproses...' : 'Proses'}
                    </button>
                    <button 
                      onClick={() => handleBookingAction(booking.id, 'reject')} 
                      disabled={processingBooking === booking.id || processingDone === booking.id} 
                      className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {processingBooking === booking.id ? <Spinner className="h-4 w-4 text-white" /> : <XCircle className="w-4 h-4" />}
                      {processingBooking === booking.id ? 'Memproses...' : 'Tolak'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Orders */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" style={{ color: primaryColor }} />
            Notifikasi Pemesanan Produk
            {pendingOrders.length > 0 && (
              <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
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
                <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">{order.customerName}</p>
                      <p className="text-sm text-gray-500">{order.customerWhatsapp}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1 animate-pulse">
                      <Clock className="w-3 h-3" /> Pending
                    </span>
                  </div>

                  <div className="mt-2 space-y-1 text-sm">
                    <p><span className="text-gray-500">Order:</span> <span className="font-medium">{order.orderNumber}</span></p>
                    <p><span className="text-gray-500">Produk:</span> <span className="font-medium">{order.productName}</span></p>
                    <p><span className="text-gray-500">Jumlah:</span> <span className="font-medium">{order.quantity} unit</span></p>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-gray-500">Rincian Harga:</p>
                      {order.discountAmount > 0 && (
                        <>
                          <p className="text-xs text-gray-400 line-through">Rp {order.subtotal.toLocaleString()}</p>
                          <div className="flex items-center gap-1">
                            <Ticket className="w-3 h-3 text-purple-500" />
                            <span className="text-xs text-purple-600">Voucher: {order.voucherCode} (Rp {order.discountAmount.toLocaleString()})</span>
                          </div>
                        </>
                      )}
                      {order.shippingCost > 0 && (
                        <p className="text-xs text-gray-400">+ Ongkir Rp {order.shippingCost.toLocaleString()}</p>
                      )}
                      <p className="text-sm font-bold" style={{ color: primaryColor }}>
                        Total Dibayar: Rp {order.total.toLocaleString()}
                      </p>
                    </div>
                    {order.note && <p className="text-sm text-gray-500">Catatan: {order.note}</p>}
                    <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button 
                      onClick={() => handleOrderAction(order.id, 'approve')} 
                      disabled={processingOrder === order.id || processingDone === order.id} 
                      className="flex-1 py-2 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2" 
                      style={{ backgroundColor: primaryColor }}
                    >
                      {processingOrder === order.id ? <Spinner className="h-4 w-4 text-white" /> : <CheckCircle className="w-4 h-4" />}
                      {processingOrder === order.id ? 'Memproses...' : 'Proses'}
                    </button>
                    <button 
                      onClick={() => handleOrderAction(order.id, 'reject')} 
                      disabled={processingOrder === order.id || processingDone === order.id} 
                      className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {processingOrder === order.id ? <Spinner className="h-4 w-4 text-white" /> : <XCircle className="w-4 h-4" />}
                      {processingOrder === order.id ? 'Memproses...' : 'Tolak'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ===== ON PROGRESS ===== */}
      <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* On Progress Bookings */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            On Progress Booking
            {stats.onProgressBookings?.length > 0 && (
              <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                {stats.onProgressBookings.length}
              </span>
            )}
          </h2>

          {!stats.onProgressBookings || stats.onProgressBookings.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center text-gray-500">
              Tidak ada booking yang sedang diproses
            </div>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {stats.onProgressBookings.map((booking) => (
                <div key={booking.id} className="bg-blue-50 border border-blue-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">{booking.customerName}</p>
                      <p className="text-sm text-gray-500">{booking.whatsapp}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> ON PROGRESS
                    </span>
                  </div>

                  <div className="mt-2 space-y-1 text-sm">
                    <p><span className="text-gray-500">ID Booking:</span> <span className="font-mono text-xs">{booking.id}</span></p>
                    <p><span className="text-gray-500">Layanan:</span> <span className="font-medium">{booking.service?.name || 'Unknown'}</span></p>
                    <p><span className="text-gray-500">Tanggal:</span> <span className="font-medium">{new Date(booking.bookingDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span></p>
                    <p><span className="text-gray-500">Waktu:</span> <span className="font-medium">{booking.bookingTime}</span></p>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-gray-500">Harga:</p>
                      {booking.discountAmount > 0 ? (
                        <>
                          <p className="text-xs text-gray-400 line-through">Rp {(booking.originalPrice || 0).toLocaleString()}</p>
                          <p className="text-sm font-medium text-green-600">
                            Rp {(booking.totalPaid || 0).toLocaleString()}
                            {/* 🔥 VOUCHER BADGE - SEPERTI PRODUK */}
                            {booking.voucherCode && booking.discountAmount > 0 && (
                              <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                <Ticket className="w-3 h-3" />
                                {booking.voucherCode}
                              </span>
                            )}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm font-medium">Rp {(booking.originalPrice || 0).toLocaleString()}</p>
                      )}
                    </div>
                    {booking.address && <p><span className="text-gray-500">Alamat:</span> <span className="font-medium">{booking.address}</span></p>}
                    {booking.notes && <p><span className="text-gray-500">Catatan:</span> <span className="font-medium">{booking.notes}</span></p>}
                    {booking.approvedAt && <p className="text-xs text-gray-400">Disetujui: {formatDate(booking.approvedAt)}</p>}
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button 
                      onClick={() => handleBookingAction(booking.id, 'done')} 
                      disabled={processingDone === booking.id} 
                      className="flex-1 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {processingDone === booking.id ? <Spinner className="h-4 w-4 text-white" /> : <Check className="w-4 h-4" />}
                      {processingDone === booking.id ? 'Memproses...' : 'Selesai'}
                    </button>
                    <button 
                      onClick={() => handleBookingAction(booking.id, 'reject')} 
                      disabled={processingDone === booking.id} 
                      className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {processingDone === booking.id ? <Spinner className="h-4 w-4 text-white" /> : <XCircle className="w-4 h-4" />}
                      {processingDone === booking.id ? 'Memproses...' : 'Batal'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* On Progress Orders */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Truck className="w-5 h-5 text-orange-500" />
            On Progress Order
            {stats.onProgressOrders?.length > 0 && (
              <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                {stats.onProgressOrders.length}
              </span>
            )}
          </h2>

          {!stats.onProgressOrders || stats.onProgressOrders.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center text-gray-500">
              Tidak ada order yang sedang diproses
            </div>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {stats.onProgressOrders.map((order) => (
                <div key={order.id} className="bg-orange-50 border border-orange-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">{order.customerName}</p>
                      <p className="text-sm text-gray-500">{order.customerWhatsapp}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> ON PROGRESS
                    </span>
                  </div>

                  <div className="mt-2 space-y-1 text-sm">
                    <p><span className="text-gray-500">Order:</span> <span className="font-medium">{order.orderNumber}</span></p>
                    {order.items.map((item, idx) => (
                      <p key={idx} className="text-sm text-gray-700">- {item.productName} x{item.quantity}</p>
                    ))}
                    <div className="flex flex-col gap-0.5">
                      <p className="text-gray-500">Rincian Harga:</p>
                      {order.discountAmount > 0 && (
                        <>
                          <p className="text-xs text-gray-400 line-through">Rp {order.subtotal.toLocaleString()}</p>
                          <div className="flex items-center gap-1">
                            <Ticket className="w-3 h-3 text-purple-500" />
                            <span className="text-xs text-purple-600">Voucher: {order.voucherCode} (Rp {order.discountAmount.toLocaleString()})</span>
                          </div>
                        </>
                      )}
                      {order.shippingCost > 0 && (
                        <p className="text-xs text-gray-400">+ Ongkir Rp {order.shippingCost.toLocaleString()}</p>
                      )}
                      <p className="text-sm font-bold" style={{ color: primaryColor }}>
                        Total Dibayar: Rp {order.totalPaid.toLocaleString()}
                      </p>
                    </div>
                    {order.address && <p><span className="text-gray-500">Alamat:</span> <span className="font-medium">{order.address}</span></p>}
                    {order.approvedAt && <p className="text-xs text-gray-400">Disetujui: {formatDate(order.approvedAt)}</p>}
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button 
                      onClick={() => handleOrderAction(order.id, 'done')} 
                      disabled={processingDone === order.id} 
                      className="flex-1 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {processingDone === order.id ? <Spinner className="h-4 w-4 text-white" /> : <Check className="w-4 h-4" />}
                      {processingDone === order.id ? 'Memproses...' : 'Selesai'}
                    </button>
                    <button 
                      onClick={() => handleOrderAction(order.id, 'reject')} 
                      disabled={processingDone === order.id} 
                      className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {processingDone === order.id ? <Spinner className="h-4 w-4 text-white" /> : <XCircle className="w-4 h-4" />}
                      {processingDone === order.id ? 'Memproses...' : 'Batal'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Statistik Keuangan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500">Total Pendapatan</p><p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.revenue?.total || 0)}</p></div>
            <div className="p-3 bg-green-100 rounded-xl"><DollarSign className="w-6 h-6 text-green-600" /></div>
          </div>
          <div className="flex items-center gap-2 mt-2 text-sm">
            <ArrowUpRight className="w-4 h-4 text-green-500" />
            <span className="text-green-500">+{formatCurrency(stats.revenue?.today || 0)}</span>
            <span className="text-gray-400">hari ini</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500">Total Pengeluaran</p><p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</p></div>
            <div className="p-3 bg-red-100 rounded-xl"><TrendingDown className="w-6 h-6 text-red-600" /></div>
          </div>
          <div className="flex items-center gap-2 mt-2 text-sm">
            <button onClick={() => setShowExpenseForm(!showExpenseForm)} className="text-xs bg-pink-500 hover:bg-pink-600 text-white px-2 py-1 rounded-lg flex items-center gap-1">
              <Plus className="w-3 h-3" /> Catat Pengeluaran
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500">Laba Bersih</p><p className={`text-2xl font-bold ${(stats.profit?.total || 0) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{formatCurrency(stats.profit?.total || 0)}</p></div>
            <div className="p-3 bg-blue-100 rounded-xl"><TrendingUp className="w-6 h-6 text-blue-600" /></div>
          </div>
          <div className="flex items-center gap-2 mt-2 text-sm">
            <span className="text-gray-400">Total - Pengeluaran</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500">Total Order</p><p className="text-2xl font-bold text-gray-800">{stats.totalOrders || 0}</p></div>
            <div className="p-3 bg-yellow-100 rounded-xl"><ShoppingBag className="w-6 h-6 text-yellow-600" /></div>
          </div>
          <div className="flex items-center gap-2 mt-2 text-sm">
            <Clock className="w-4 h-4 text-yellow-500" />
            <span className="text-yellow-500">{stats.orders?.pending || 0} pending</span>
            <span className="text-gray-400">menunggu</span>
          </div>
        </div>
      </div>

      {/* Form Expense */}
      {showExpenseForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">{editingExpense ? 'Edit Pengeluaran' : 'Catat Pengeluaran'}</h2>
            <button onClick={() => { setShowExpenseForm(false); setEditingExpense(null); setExpenseForm({ title: '', amount: '', category: 'OPERATIONAL', target: 'PRODUCT', description: '', date: new Date().toISOString().split('T')[0] }) }} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <form onSubmit={handleExpenseSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Judul *</label>
              <input type="text" required value={expenseForm.title} onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400" placeholder="Contoh: Pembelian bahan baku" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Jumlah (Rp) *</label>
              <input type="number" required step="0.01" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400" placeholder="100000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Kategori *</label>
              <select value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400">
                {CATEGORIES.map((cat) => <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Target *</label>
              <select value={expenseForm.target} onChange={(e) => setExpenseForm({ ...expenseForm, target: e.target.value })} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400">
                <option value="PRODUCT">Product</option>
                <option value="BOOKING">Booking</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tanggal</label>
              <input type="date" value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
              <input type="text" value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400" placeholder="Deskripsi pengeluaran..." />
            </div>
            <div className="flex gap-2 items-end">
              <button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg">{editingExpense ? 'Update' : 'Simpan'}</button>
              <button type="button" onClick={() => { setShowExpenseForm(false); setEditingExpense(null); setExpenseForm({ title: '', amount: '', category: 'OPERATIONAL', target: 'PRODUCT', description: '', date: new Date().toISOString().split('T')[0] }) }} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg">Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {cards.map((card) => (
          <Link key={card.title} href={card.href} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-gray-500">{card.title}</p><p className="text-xl font-bold text-gray-800 mt-1">{card.value}</p></div>
              <div className={`${card.color} p-2 rounded-lg`}><card.icon className="w-4 h-4" /></div>
            </div>
          </Link>
        ))}
      </div>

      {/* Grafik Keuangan */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" style={{ color: primaryColor }} /> 
            Grafik Keuangan
          </h2>
          <div className="flex gap-2">
            <button 
              onClick={() => handleFilterChange('day')} 
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${filterPeriod === 'day' ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} 
              style={filterPeriod === 'day' ? { backgroundColor: primaryColor } : {}}
            >
              1 Hari
            </button>
            <button 
              onClick={() => handleFilterChange('week')} 
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${filterPeriod === 'week' ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} 
              style={filterPeriod === 'week' ? { backgroundColor: primaryColor } : {}}
            >
              1 Minggu
            </button>
            <button 
              onClick={() => handleFilterChange('month')} 
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${filterPeriod === 'month' ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} 
              style={filterPeriod === 'month' ? { backgroundColor: primaryColor } : {}}
            >
              1 Bulan
            </button>
            <button 
              onClick={() => handleFilterChange('year')} 
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${filterPeriod === 'year' ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} 
              style={filterPeriod === 'year' ? { backgroundColor: primaryColor } : {}}
            >
              1 Tahun
            </button>
          </div>
        </div>

        <div className="h-80">
          {chartData.length === 0 || chartData.every(d => d.productRevenue === 0 && d.bookingRevenue === 0 && d.productExpense === 0 && d.bookingExpense === 0) ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              Belum ada data keuangan
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#888" 
                  fontSize={11} 
                  tickFormatter={(value) => {
                    return new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                  }}
                />
                <YAxis stroke="#888" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} 
                  formatter={tooltipFormatter as any}
                  labelFormatter={(label) => {
                    return `Tanggal: ${new Date(label).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="bookingRevenue" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]} 
                  name="Pendapatan Booking" 
                />
                <Bar 
                  dataKey="productRevenue" 
                  fill="#c4367b" 
                  radius={[4, 4, 0, 0]} 
                  name="Pendapatan Product" 
                />
                <Bar 
                  dataKey="bookingExpense" 
                  fill="#1ac0dd" 
                  radius={[4, 4, 0, 0]} 
                  name="Pengeluaran Booking" 
                />
                <Bar 
                  dataKey="productExpense" 
                  fill="#e01a1a" 
                  radius={[4, 4, 0, 0]} 
                  name="Pengeluaran Product" 
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-xs text-gray-500">Pendapatan Product</p>
            <p className="text-sm font-bold" style={{ color: '#c4367b' }}>
              {formatCurrency(
                chartData.reduce((sum, d) => sum + d.productRevenue, 0)
              )}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Pendapatan Booking</p>
            <p className="text-sm font-bold" style={{ color: '#3b82f6' }}>
              {formatCurrency(
                chartData.reduce((sum, d) => sum + d.bookingRevenue, 0)
              )}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Pengeluaran Product</p>
            <p className="text-sm font-bold" style={{ color: '#e01a1a' }}>
              {formatCurrency(
                chartData.reduce((sum, d) => sum + d.productExpense, 0)
              )}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Pengeluaran Booking</p>
            <p className="text-sm font-bold" style={{ color: '#1ac0dd' }}>
              {formatCurrency(
                chartData.reduce((sum, d) => sum + d.bookingExpense, 0)
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Bookings & History Order */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-500" /> 
            Recent Bookings
            {stats.recentBookings?.length > 0 && (
              <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                {stats.recentBookings.length}
              </span>
            )}
          </h2>
          {!stats.recentBookings || stats.recentBookings.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">Belum ada booking selesai</p>
          ) : (
            <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
              {stats.recentBookings.map((booking) => (
                <div key={booking.id} className="py-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{booking.customerName}</p>
                      <p className="text-sm text-gray-500">ID: <span className="font-mono text-xs">{booking.id}</span></p>
                      <p className="text-sm text-gray-500">{booking.service?.name}</p>
                      <p className="text-sm text-gray-500">
                        📅 {new Date(booking.bookingDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} 
                        ⏰ {booking.bookingTime}
                      </p>
                      <div className="flex flex-col gap-0.5 mt-1">
                        <p className="text-sm text-gray-500">Harga:</p>
                        {booking.discountAmount > 0 ? (
                          <>
                            <p className="text-xs text-gray-400 line-through">Rp {(booking.originalPrice || 0).toLocaleString()}</p>
                            <p className="text-sm font-medium text-green-600">
                              Rp {(booking.totalPaid || 0).toLocaleString()}
                              {/* 🔥 VOUCHER BADGE - SEPERTI PRODUK */}
                              {booking.voucherCode && booking.discountAmount > 0 && (
                                <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                  <Ticket className="w-3 h-3" />
                                  {booking.voucherCode}
                                </span>
                              )}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm font-medium">Rp {(booking.originalPrice || 0).toLocaleString()}</p>
                        )}
                      </div>
                      {booking.address && (
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {booking.address}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-400">
                        <span>📱 {booking.whatsapp}</span>
                        {booking.email && <span>📧 {booking.email}</span>}
                      </div>
                      {booking.notes && <p className="text-sm text-gray-400 mt-1">📝 {booking.notes}</p>}
                      {booking.approvedBy && <p className="text-xs text-gray-400">Admin: {booking.approvedBy.name}</p>}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ml-2 ${booking.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {booking.status === 'COMPLETED' ? '✅ Selesai' : booking.status}
                    </span>
                  </div>
                  {booking.completedAt && (
                    <p className="text-xs text-gray-400 mt-1">Selesai: {formatDate(booking.completedAt)}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* History Order */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-purple-500" /> 
            History Order
            {stats.historyOrders?.length > 0 && (
              <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                {stats.historyOrders.length}
              </span>
            )}
          </h2>
          {!stats.historyOrders || stats.historyOrders.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">Belum ada order selesai</p>
          ) : (
            <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
              {stats.historyOrders.map((order) => (
                <div key={order.id} className="py-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-gray-800">{order.customerName}</p>
                        <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded">{order.orderNumber}</span>
                      </div>
                      <div className="mt-1 space-y-0.5">
                        {order.items.map((item, idx) => (
                          <p key={idx} className="text-sm text-gray-600">
                            {item.productName} x{item.quantity} - Rp {item.price.toLocaleString()}
                          </p>
                        ))}
                      </div>
                      <div className="flex flex-col gap-0.5 mt-1">
                        <p className="text-sm text-gray-500">Rincian Harga:</p>
                        {order.discountAmount > 0 && (
                          <>
                            <p className="text-xs text-gray-400 line-through">Rp {order.subtotal.toLocaleString()}</p>
                            <div className="flex items-center gap-1">
                              <Ticket className="w-3 h-3 text-purple-500" />
                              <span className="text-xs text-purple-600">Voucher: {order.voucherCode} (Rp {order.discountAmount.toLocaleString()})</span>
                            </div>
                          </>
                        )}
                        {order.shippingCost > 0 && (
                          <p className="text-xs text-gray-400">+ Ongkir Rp {order.shippingCost.toLocaleString()}</p>
                        )}
                        <p className="text-sm font-bold" style={{ color: primaryColor }}>
                          Total Dibayar: Rp {order.totalPaid.toLocaleString()}
                        </p>
                      </div>
                      {order.address && (
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {order.address}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-400">
                        <span>📱 {order.customerWhatsapp}</span>
                        {order.email && <span>📧 {order.email}</span>}
                      </div>
                    </div>
                    <span className="px-2 py-1 text-xs rounded-full whitespace-nowrap ml-2 bg-green-100 text-green-700">
                      ✅ Selesai
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Order: {formatDate(order.createdAt)}</span>
                    {order.completedAt && <span>Selesai: {formatDate(order.completedAt)}</span>}
                    {order.approvedBy && <span>Admin: {order.approvedBy.name}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Products & Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5 text-pink-500" /> Kontribusi Pendapatan</h2>
          <div className="h-64">
            {displayPieData.length === 0 || (displayPieData.length === 1 && displayPieData[0].value === 1) ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                Belum ada data pendapatan
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={displayPieData} 
                    cx="50%" 
                    cy="50%" 
                    labelLine={false} 
                    label={renderPieLabel} 
                    outerRadius={80} 
                    fill="#8884d8" 
                    dataKey="value"
                  >
                    {displayPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} 
                    formatter={pieTooltipFormatter} 
                    labelFormatter={(label) => label} 
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-green-500" /> Top Products</h2>
          {stats.topProducts.length === 0 ? <p className="text-gray-500 text-sm text-center py-8">Belum ada data penjualan</p> : (
            <div className="space-y-4">
              {stats.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3"><span className="text-sm font-bold text-gray-400">#{index + 1}</span><div><p className="font-medium text-gray-800">{product.name}</p><p className="text-xs text-gray-500">{product.quantity} terjual</p></div></div>
                  <p className="font-bold text-pink-500">{formatCurrency(product.revenue)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}