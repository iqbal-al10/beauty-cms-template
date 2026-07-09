'use client'

import { useEffect, useState, useCallback } from 'react'
import { User, Clock, Activity, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

interface ActivityLog {
  id: string
  action: string
  entityType: string
  entityId: string | null
  metadata: Record<string, string | number | boolean> | null
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    action: '',
    entityType: '',
    userId: '',
  })

  const ACTION_LABELS: Record<string, string> = {
    CREATE: '🟢 Create',
    UPDATE: '🟡 Update',
    DELETE: '🔴 Delete',
    LOGIN: '🔵 Login',
    LOGOUT: '⚪ Logout',
  }

  const ENTITY_LABELS: Record<string, string> = {
    User: '👤 User',
    Product: '📦 Product',
    Booking: '📅 Booking',
    Service: '🧖 Service',
    Category: '📁 Category',
    Testimonial: '💬 Testimonial',
    BlogPost: '📝 Blog',
    FAQ: '❓ FAQ',
    Promo: '🏷️ Promo',
    MediaFile: '🖼️ Media',
    Order: '📦 Order',
    Expense: '💰 Expense',
    PaymentMethod: '💳 Payment',
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-700'
      case 'UPDATE': return 'bg-yellow-100 text-yellow-700'
      case 'DELETE': return 'bg-red-100 text-red-700'
      case 'LOGIN': return 'bg-blue-100 text-blue-700'
      case 'LOGOUT': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  // 🔥 SPINNER COMPONENT
  const Spinner = ({ className = "h-4 w-4" }: { className?: string }) => (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  )

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.action) params.append('action', filters.action)
      if (filters.entityType) params.append('entityType', filters.entityType)
      if (filters.userId) params.append('userId', filters.userId)
      params.append('page', String(page))
      params.append('limit', String(limit))

      const res = await fetch(`/api/admin/activity-logs?${params}`)
      if (!res.ok) throw new Error('Failed to fetch')
      
      const data = await res.json()
      setLogs(data.data || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error('Error fetching logs:', error)
      toast.error('Gagal memuat activity log')
    } finally {
      setLoading(false)
    }
  }, [filters.action, filters.entityType, filters.userId, page, limit])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  // 🔥 AUTO REFRESH SETIAP 30 DETIK
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLogs()
    }, 30000)

    return () => clearInterval(interval)
  }, [fetchLogs])

  const handleReset = () => {
    setFilters({ action: '', entityType: '', userId: '' })
    setPage(1)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }

  const getActionLabel = (action: string) => ACTION_LABELS[action] || action
  const getEntityLabel = (entity: string) => ENTITY_LABELS[entity] || entity

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Activity Log</h1>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? <Spinner /> : <RefreshCw className="w-4 h-4" />}
          {loading ? 'Memuat...' : 'Refresh'}
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
        <p className="text-sm text-gray-500">
          Total: <span className="font-semibold text-gray-800">{total}</span> activities
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap gap-4">
        <select
          value={filters.action}
          onChange={(e) => { setFilters({ ...filters, action: e.target.value }); setPage(1) }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
        >
          <option value="">All Actions</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
          <option value="LOGIN">Login</option>
          <option value="LOGOUT">Logout</option>
        </select>

        <select
          value={filters.entityType}
          onChange={(e) => { setFilters({ ...filters, entityType: e.target.value }); setPage(1) }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
        >
          <option value="">All Entities</option>
          <option value="User">User</option>
          <option value="Product">Product</option>
          <option value="Service">Service</option>
          <option value="Booking">Booking</option>
          <option value="Category">Category</option>
          <option value="Testimonial">Testimonial</option>
          <option value="BlogPost">Blog Post</option>
          <option value="FAQ">FAQ</option>
          <option value="Promo">Promo</option>
          <option value="MediaFile">Media</option>
          <option value="Order">Order</option>
          <option value="Expense">Expense</option>
          <option value="PaymentMethod">Payment</option>
        </select>

        <button onClick={handleReset} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg">
          Reset Filters
        </button>

        {loading && (
          <span className="text-sm text-gray-500 flex items-center">Memuat data...</span>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    <Activity className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p>No activity logs found</p>
                    <p className="text-xs text-gray-400 mt-1">Lakukan aktivitas untuk melihat log</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{log.user.name}</div>
                          <div className="text-xs text-gray-500">{log.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(log.action)}`}>
                        {getActionLabel(log.action)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm">{getEntityLabel(log.entityType)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs">
                        {log.metadata && Object.keys(log.metadata).length > 0 ? (
                          <div className="relative group">
                            <div className="text-xs text-gray-500 truncate">
                              {Object.entries(log.metadata).map(([key, value]) => (
                                <span key={key} className="mr-2">
                                  <span className="font-medium">{key}:</span> {String(value)}
                                </span>
                              ))}
                            </div>
                            <div className="absolute left-0 top-full mt-1 bg-gray-800 text-white text-xs rounded-lg p-2 hidden group-hover:block whitespace-nowrap z-10 shadow-lg max-w-md overflow-x-auto">
                              {Object.entries(log.metadata).map(([key, value]) => (
                                <div key={key}>
                                  <span className="font-medium">{key}:</span> {String(value)}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(log.createdAt)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {logs.length > 0 && (
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-700">{(page - 1) * limit + 1}</span> to{' '}
              <span className="font-medium text-gray-700">
                {Math.min(page * limit, total)}
              </span>{' '}
              of <span className="font-medium text-gray-700">{total}</span> activities
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1 || loading}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages || loading}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}