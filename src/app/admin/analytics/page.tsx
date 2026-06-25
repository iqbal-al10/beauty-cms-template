'use client'

import { useEffect, useState } from 'react'
import { Eye, Users, TrendingUp, Activity, RefreshCw, Globe, Smartphone, Monitor } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  LineChart,
  Line,
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

interface AnalyticsData {
  totalVisitors: number
  visitorsByDay: Array<{ date: string; visitors: number }>
  pageViews: Array<{ date: string; views: number }>
  topPages: Array<{ page: string; views: number }>
  topReferrers: Array<{ referrer: string; count: number }>
  devices: Array<{ device: string; visitors: number }>
  days: number
}

const COLORS = ['#e88ea7', '#9b4d6e', '#f472b6', '#a78bfa', '#34d399', '#fbbf24', '#60a5fa']

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>({
    totalVisitors: 0,
    visitorsByDay: [],
    pageViews: [],
    topPages: [],
    topReferrers: [],
    devices: [],
    days: 7,
  })
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(7)

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/analytics?days=${days}`)
      if (!res.ok) throw new Error('Failed to fetch analytics')
      
      const result = await res.json()
      setData(result)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      toast.error('Gagal memuat data analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [days])

  const totalPageViews = data.pageViews.reduce((sum, day) => sum + day.views, 0)
  const avgDailyVisitors = data.days > 0 ? Math.round(data.totalVisitors / data.days) : 0

  const combinedData = data.visitorsByDay.map((item) => {
    const pageView = data.pageViews.find((p) => p.date === item.date)
    return {
      date: item.date,
      visitors: item.visitors,
      views: pageView?.views || 0,
    }
  }).reverse()

  const pieData = data.topPages.slice(0, 5).map((item) => ({
    name: item.page || '/',
    value: item.views,
  }))

  // Fungsi label untuk Pie Chart - menggunakan any untuk menghindari TypeScript error
  const renderLabel = (entry: any) => {
    const total = pieData.reduce((sum, item) => sum + item.value, 0)
    const percent = total > 0 ? Math.round((entry.value / total) * 100) : 0
    return `${entry.name} (${percent}%)`
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
        <h1 className="text-2xl font-bold text-gray-800">📊 Analytics</h1>
        <div className="flex gap-2">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
          >
            <option value={7}>Last 7 Days</option>
            <option value={14}>Last 14 Days</option>
            <option value={30}>Last 30 Days</option>
          </select>
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-pink-50 rounded-xl">
              <Users className="w-6 h-6 text-pink-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Visitors</p>
              <p className="text-2xl font-bold text-gray-800">{data.totalVisitors}</p>
              <p className="text-xs text-gray-400">Unique devices</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Eye className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Page Views</p>
              <p className="text-2xl font-bold text-gray-800">{totalPageViews}</p>
              <p className="text-xs text-gray-400">Last {data.days} days</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-xl">
              <Activity className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg Daily Visitors</p>
              <p className="text-2xl font-bold text-gray-800">{avgDailyVisitors}</p>
              <p className="text-xs text-gray-400">Per day</p>
            </div>
          </div>
        </div>
      </div>

      {/* Line Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Visitors & Page Views Trend</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={combinedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="visitors"
                stroke="#e88ea7"
                strokeWidth={2}
                dot={{ fill: '#e88ea7' }}
                name="Visitors"
              />
              <Line
                type="monotone"
                dataKey="views"
                stroke="#60a5fa"
                strokeWidth={2}
                dot={{ fill: '#60a5fa' }}
                name="Page Views"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart + Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Visitors by Day</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="visitors" fill="#e88ea7" radius={[4, 4, 0, 0]} name="Visitors" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Pages</h2>
          {pieData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No data available
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderLabel}
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
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Device & Referrer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Device Types</h2>
          {data.devices.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-500">
              No data available
            </div>
          ) : (
            <div className="space-y-3">
              {data.devices.map((device, index) => {
                const iconMap: Record<string, React.ReactNode> = {
                  'Desktop': <Monitor className="w-5 h-5 text-blue-500" />,
                  'Mobile': <Smartphone className="w-5 h-5 text-green-500" />,
                  'Tablet': <Globe className="w-5 h-5 text-purple-500" />,
                }
                const total = data.devices.reduce((sum, d) => sum + d.visitors, 0)
                const percentage = total > 0 ? Math.round((device.visitors / total) * 100) : 0
                const Icon = iconMap[device.device] || <Globe className="w-5 h-5 text-gray-500" />
                
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {Icon}
                        <span className="font-medium text-gray-700">{device.device}</span>
                      </div>
                      <span className="text-gray-500">{device.visitors} ({percentage}%)</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Referrers</h2>
          {data.topReferrers.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-500">
              No data available
            </div>
          ) : (
            <div className="space-y-3">
              {data.topReferrers.map((ref, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700 truncate max-w-[200px]">
                      {ref.referrer === 'Direct' ? '🔗 Direct' : ref.referrer}
                    </span>
                    <span className="text-gray-500">{ref.count} views</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min((ref.count / data.topReferrers[0].count) * 100, 100)}%`,
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
