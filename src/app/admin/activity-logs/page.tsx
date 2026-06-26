'use client'

import { useEffect, useState, useCallback } from 'react'
import { User, Clock, Activity, RefreshCw } from 'lucide-react'
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
    Category: '📁 Category',
    Testimonial: '💬 Testimonial',
    BlogPost: '📝 Blog',
    FAQ: '❓ FAQ',
    Promo: '🏷️ Promo',
    MediaFile: '🖼️ Media',
  }

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.action) params.append('action', filters.action)
      if (filters.entityType) params.append('entityType', filters.entityType)

      const res = await fetch(`/api/admin/activity-logs?${params}`)
      if (!res.ok) throw new Error('Failed to fetch')
      
      const data = await res.json()
      setLogs(data.data || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error('Error fetching logs:', error)
      toast.error('Gagal memuat activity log')
    } finally {
      setLoading(false)
    }
  }, [filters.action, filters.entityType])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const handleReset = () => {
    setFilters({ action: '', entityType: '', userId: '' })
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
        <h1 className="text-2xl font-bold text-gray-800">Activity Log</h1>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
        <p className="text-sm text-gray-500">
          Total: <span className="font-semibold text-gray-800">{total}</span> activities
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap gap-4">
        <select
          value={filters.action}
          onChange={(e) => setFilters({ ...filters, action: e.target.value })}
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
          onChange={(e) => setFilters({ ...filters, entityType: e.target.value })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
        >
          <option value="">All Entities</option>
          <option value="User">User</option>
          <option value="Product">Product</option>
          <option value="Booking">Booking</option>
          <option value="Category">Category</option>
          <option value="Testimonial">Testimonial</option>
          <option value="BlogPost">Blog Post</option>
          <option value="FAQ">FAQ</option>
          <option value="Promo">Promo</option>
          <option value="MediaFile">Media</option>
        </select>

        <button onClick={handleReset} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg">
          Reset Filters
        </button>

        {loading && (
          <span className="text-sm text-gray-500 flex items-center">Loading...</span>
        )}
      </div>

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
                      <span className="text-sm">{getActionLabel(log.action)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm">{getEntityLabel(log.entityType)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {log.metadata && Object.keys(log.metadata).length > 0 ? (
                          Object.entries(log.metadata).map(([key, value]) => (
                            <span key={key} className="block text-xs">
                              <span className="font-medium">{key}:</span> {String(value)}
                            </span>
                          ))
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
        {logs.length > 0 && (
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-700">{logs.length}</span> of <span className="font-medium text-gray-700">{total}</span> activities
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
