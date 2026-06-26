'use client'

import { useEffect, useState } from 'react'
import { Eye, CheckCircle, XCircle, Calendar, Clock, Phone, Mail, User, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

interface Booking {
  id: string
  customerName: string
  whatsapp: string
  email: string | null
  bookingDate: string
  bookingTime: string
  notes: string | null
  status: string
  service: { name: string; price: number } | null
  createdAt: string
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [filterDate, setFilterDate] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchBookings()
  }, [filterStatus, filterDate])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      setError('')
      
      const params = new URLSearchParams()
      if (filterStatus !== 'ALL') params.append('status', filterStatus)
      if (filterDate) params.append('date', filterDate)

      const res = await fetch(`/api/admin/bookings?${params}`)
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      
      const data = await res.json()
      
      if (Array.isArray(data)) {
        setBookings(data)
      } else {
        setBookings([])
        setError('Data tidak valid')
      }
    } catch (error: any) {
      console.error('Error fetching bookings:', error)
      setError(error.message)
      toast.error('Gagal memuat booking')
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (res.ok) {
        toast.success(`Status booking berhasil diubah menjadi ${getStatusLabel(status)}`)
        fetchBookings()
        if (selectedBooking?.id === id) {
          setSelectedBooking({ ...selectedBooking, status })
        }
      } else {
        toast.error('Gagal mengubah status booking')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error saat mengubah status')
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      APPROVED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700',
      RESCHEDULED: 'bg-blue-100 text-blue-700',
      COMPLETED: 'bg-gray-100 text-gray-700',
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'Pending',
      APPROVED: 'Disetujui',
      REJECTED: 'Ditolak',
      RESCHEDULED: 'Dijadwalkan Ulang',
      COMPLETED: 'Selesai',
    }
    return labels[status] || status
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
        <p className="font-medium">Error: {error}</p>
        <button onClick={fetchBookings} className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
          Coba Lagi
        </button>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Booking</h1>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap gap-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
        >
          <option value="ALL">Semua Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Disetujui</option>
          <option value="REJECTED">Ditolak</option>
          <option value="RESCHEDULED">Dijadwalkan Ulang</option>
          <option value="COMPLETED">Selesai</option>
        </select>

        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
        />

        <button onClick={() => { setFilterStatus('ALL'); setFilterDate('') }} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg">
          Reset Filter
        </button>

        <button onClick={fetchBookings} className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {bookings.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Tidak ada booking</div>
            ) : (
              bookings.map((booking) => (
                <div
                  key={booking.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedBooking?.id === booking.id ? 'bg-pink-50' : ''
                  }`}
                  onClick={() => setSelectedBooking(booking)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">{booking.customerName}</p>
                      <p className="text-sm text-gray-500">{booking.service?.name || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(booking.bookingDate).toLocaleDateString('id-ID')} pukul {booking.bookingTime}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}>
                      {getStatusLabel(booking.status)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {selectedBooking ? (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Detail Booking</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Customer</p>
                    <p className="font-medium">{selectedBooking.customerName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">WhatsApp</p>
                    <a href={`https://wa.me/${selectedBooking.whatsapp}`} target="_blank" className="text-pink-500 hover:underline">
                      {selectedBooking.whatsapp}
                    </a>
                  </div>
                </div>
                {selectedBooking.email && (
                  <div className="flex items-start gap-2">
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-sm">{selectedBooking.email}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Tanggal & Waktu</p>
                    <p className="font-medium">
                      {new Date(selectedBooking.bookingDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      {' '}pukul {selectedBooking.bookingTime}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Layanan</p>
                    <p className="font-medium">{selectedBooking.service?.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-500">Rp {selectedBooking.service?.price?.toLocaleString() || '0'}</p>
                  </div>
                </div>
                {selectedBooking.notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Catatan</p>
                    <p className="text-sm">{selectedBooking.notes}</p>
                  </div>
                )}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">Status</p>
                  <div className="flex flex-wrap gap-2">
                    {['APPROVED', 'REJECTED', 'RESCHEDULED', 'COMPLETED'].map((status) => (
                      <button
                        key={status}
                        onClick={() => updateStatus(selectedBooking.id, status)}
                        className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                          selectedBooking.status === status
                            ? 'bg-pink-500 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        {getStatusLabel(status)}
                      </button>
                    ))}
                  </div>
                  <a
                    href={`https://wa.me/${selectedBooking.whatsapp}?text=Halo ${selectedBooking.customerName}, booking Anda untuk ${selectedBooking.service?.name || 'service'} pada ${new Date(selectedBooking.bookingDate).toLocaleDateString('id-ID')} pukul ${selectedBooking.bookingTime} telah ${getStatusLabel(selectedBooking.status).toLowerCase()}.`}
                    target="_blank"
                    className="mt-4 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors w-full"
                  >
                    <Phone className="w-4 h-4" />
                    WhatsApp Customer
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Eye className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p>Pilih booking untuk melihat detail</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
