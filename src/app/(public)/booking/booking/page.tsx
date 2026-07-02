'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, Calendar, Clock, User, Phone, Mail, MessageSquare, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Service {
  id: string
  name: string
  description: string | null
  duration: number
  price: number
  isActive: boolean  // ← TAMBAHKAN INI
}

function BookingServiceContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const serviceIdParam = searchParams.get('service') || ''

  const [step, setStep] = useState(1)
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [slots, setSlots] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    serviceId: serviceIdParam,
    bookingDate: '',
    bookingTime: '',
    customerName: '',
    whatsapp: '',
    email: '',
    notes: '',
  })

  const primaryColor = '#c4367b'

  useEffect(() => {
    fetchServices()
  }, [])

  useEffect(() => {
    if (serviceIdParam && services.length > 0) {
      const service = services.find(s => s.id === serviceIdParam)
      if (service) {
        setSelectedService(service)
        setForm(prev => ({ ...prev, serviceId: serviceIdParam }))
        setStep(2)
      }
    }
  }, [serviceIdParam, services])

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/public/services')
      const data = await res.json()
      setServices(data.filter((s: Service) => s.isActive !== false))
    } catch (error) {
      console.error('Error fetching services:', error)
      toast.error('Gagal memuat layanan')
    } finally {
      setLoading(false)
    }
  }

  const fetchSlots = async (date: string, serviceId: string) => {
    if (!date || !serviceId) return

    try {
      const res = await fetch(`/api/public/bookings?date=${date}&serviceId=${serviceId}`)
      const data = await res.json()
      setSlots(data.slots || [])
    } catch (error) {
      console.error('Error fetching slots:', error)
    }
  }

  const handleDateChange = (date: string) => {
    setForm({ ...form, bookingDate: date })
    if (form.serviceId) {
      fetchSlots(date, form.serviceId)
    }
  }

  const handleServiceChange = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId)
    setSelectedService(service || null)
    setForm({ ...form, serviceId })
    if (form.bookingDate) {
      fetchSlots(form.bookingDate, serviceId)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/public/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (res.ok) {
        setSubmitted(true)
        setStep(3)
        toast.success('Booking berhasil!')
      } else {
        toast.error(data.error || 'Gagal booking')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: primaryColor }} />
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Berhasil!</h2>
          <p className="text-gray-600 mb-6">
            Booking Anda telah kami terima. Kami akan mengkonfirmasi segera.
          </p>
          <div className="bg-white p-6 rounded-xl text-left space-y-3 max-w-md mx-auto">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Layanan</span>
              <span className="font-medium">{selectedService?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tanggal</span>
              <span className="font-medium">
                {new Date(form.bookingDate).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Waktu</span>
              <span className="font-medium">{form.bookingTime}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Customer</span>
              <span className="font-medium">{form.customerName}</span>
            </div>
          </div>
          <div className="mt-6 flex gap-4 justify-center">
            <Link
              href="/"
              className="px-6 py-2.5 rounded-lg text-white font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              Kembali ke Home
            </Link>
            <Link
              href="/booking"
              className="px-6 py-2.5 rounded-lg border-2 font-medium transition-colors hover:bg-gray-50"
              style={{ borderColor: primaryColor, color: primaryColor }}
            >
              Lihat Layanan Lain
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Link href="/booking" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Kembali ke Layanan
      </Link>

      <h1 className="text-3xl font-bold text-gray-800 mb-2">Booking Layanan</h1>
      <p className="text-gray-500 mb-8">Pilih layanan dan jadwal yang Anda inginkan</p>

      {/* Steps */}
      <div className="flex items-center gap-4 mb-8">
        <div className={`flex-1 text-center ${step >= 1 ? 'text-pink-500' : 'text-gray-300'}`}>
          <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center ${step >= 1 ? 'bg-pink-500 text-white' : 'bg-gray-200'}`}>
            1
          </div>
          <span className="text-sm">Layanan</span>
        </div>
        <div className={`flex-1 text-center ${step >= 2 ? 'text-pink-500' : 'text-gray-300'}`}>
          <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center ${step >= 2 ? 'bg-pink-500 text-white' : 'bg-gray-200'}`}>
            2
          </div>
          <span className="text-sm">Jadwal</span>
        </div>
        <div className={`flex-1 text-center ${step >= 3 ? 'text-pink-500' : 'text-gray-300'}`}>
          <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center ${step >= 3 ? 'bg-pink-500 text-white' : 'bg-gray-200'}`}>
            3
          </div>
          <span className="text-sm">Konfirmasi</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
        {step === 1 && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Layanan *</label>
              <select
                required
                value={form.serviceId}
                onChange={(e) => handleServiceChange(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
              >
                <option value="">-- Pilih Layanan --</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - Rp {service.price.toLocaleString()} ({service.duration} menit)
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!form.serviceId}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 transition-colors"
            >
              Selanjutnya →
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Tanggal *</label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={form.bookingDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Waktu *</label>
              {slots.length === 0 ? (
                <p className="text-gray-500 text-sm">Pilih tanggal terlebih dahulu untuk melihat slot</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setForm({ ...form, bookingTime: slot })}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        form.bookingTime === slot
                          ? 'bg-pink-500 text-white border-pink-500'
                          : 'border-gray-300 hover:border-pink-300'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setStep(3)}
              disabled={!form.bookingDate || !form.bookingTime}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 transition-colors"
            >
              Selanjutnya →
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="Nama Anda"
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nomor WhatsApp *</label>
                <input
                  type="text"
                  required
                  placeholder="6281234567890"
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email (Opsional)</label>
              <input
                type="email"
                placeholder="email@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catatan (Opsional)</label>
              <textarea
                rows={3}
                placeholder="Catatan tambahan..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
              />
            </div>

            {selectedService && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Ringkasan:</span>{' '}
                  {selectedService.name} pada{' '}
                  {new Date(form.bookingDate).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })} pukul {form.bookingTime}
                </p>
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                ← Kembali
              </button>
              <button
                type="submit"
                disabled={loading || !form.customerName || !form.whatsapp}
                className="flex-1 bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 transition-colors"
              >
                {loading ? 'Memproses...' : 'Konfirmasi Booking'}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  )
}

export default function BookingServicePage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#c4367b' }} />
      </div>
    }>
      <BookingServiceContent />
    </Suspense>
  )
}