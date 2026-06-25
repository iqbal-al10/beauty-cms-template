'use client'

import { useEffect, useState } from 'react'
import { Package, Calendar, MessageSquare, FileText } from 'lucide-react'

interface DashboardStats {
  totalProducts: number
  totalBookings: number
  totalTestimonials: number
  totalBlogPosts: number
  recentBookings: Array<{
    id: string
    customerName: string
    bookingDate: string
    status: string
  }>
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalBookings: 0,
    totalTestimonials: 0,
    totalBlogPosts: 0,
    recentBookings: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await fetch('/api/admin/dashboard')
        const data = await res.json()
        setStats(data)
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  const cards: Array<{
    title: string
    value: number
    icon: React.ComponentType<{ className?: string }>
    color: string
    href: string
  }> = [
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
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-xl`}>
                <card.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Bookings</h2>
        {stats.recentBookings.length === 0 ? (
          <p className="text-gray-500">No recent bookings</p>
        ) : (
          <div className="space-y-3">
            {stats.recentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{booking.customerName}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(booking.bookingDate).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                  booking.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
