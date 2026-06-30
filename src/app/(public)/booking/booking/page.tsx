'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { Calendar as CalendarIcon, Clock, User, Phone, Mail, MessageSquare, CheckCircle } from 'lucide-react'

interface Service {
  id: string
  name: string
  description: string | null
  duration: number
  price: number
}

// ===== KOMPONEN UTAMA =====
function BookingServiceContent() {
  const [step, setStep] = useState(1)
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(false)
  const [slots, setSlots] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)

  const [form, setForm] = useState({
    serviceId: '',
    bookingDate: '',
    bookingTime: '',
    customerName: '',
    whatsapp: '',
    email: '',
    notes: '',
  })

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/public/services')
      const data = await res.json()
      setServices(data)
    } catch (error) {
      console.error('Error fetching services:', error)
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

      if (res.ok) {
        setSubmitted(true)
        setStep(3)
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to book')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to book. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-4">
            Thank you for booking with us. We'll confirm your appointment soon.
          </p>
          <div className="bg-white p-4 rounded-lg text-left space-y-2 text-sm">
            <p><span className="font-medium">Service:</span> {services.find(s => s.id === form.serviceId)?.name}</p>
            <p><span className="font-medium">Date:</span> {new Date(form.bookingDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p><span className="font-medium">Time:</span> {form.bookingTime}</p>
            <p><span className="font-medium">Customer:</span> {form.customerName}</p>
          </div>
          <a
            href="/"
            className="mt-6 inline-block bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Book an Appointment</h1>
      <p className="text-gray-500 mb-8">Fill in the details below to book your service</p>

      {/* Progress Steps */}
      <div className="flex items-center gap-4 mb-8">
        <div className={`flex-1 text-center ${step >= 1 ? 'text-pink-500' : 'text-gray-300'}`}>
          <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center ${step >= 1 ? 'bg-pink-500 text-white' : 'bg-gray-200'}`}>
            1
          </div>
          <span className="text-sm">Service</span>
        </div>
        <div className={`flex-1 text-center ${step >= 2 ? 'text-pink-500' : 'text-gray-300'}`}>
          <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center ${step >= 2 ? 'bg-pink-500 text-white' : 'bg-gray-200'}`}>
            2
          </div>
          <span className="text-sm">Details</span>
        </div>
        <div className={`flex-1 text-center ${step >= 3 ? 'text-pink-500' : 'text-gray-300'}`}>
          <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center ${step >= 3 ? 'bg-pink-500 text-white' : 'bg-gray-200'}`}>
            3
          </div>
          <span className="text-sm">Confirm</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
        {/* Step 1: Service & Schedule */}
        {step === 1 && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Service</label>
              <select
                required
                value={form.serviceId}
                onChange={(e) => handleServiceChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
              >
                <option value="">Choose a service...</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - Rp {service.price.toLocaleString()} ({service.duration} min)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={form.bookingDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Time</label>
              {slots.length === 0 ? (
                <p className="text-gray-500 text-sm">Select a date first to see available slots</p>
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
              onClick={() => setStep(2)}
              disabled={!form.serviceId || !form.bookingDate || !form.bookingTime}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 transition-colors"
            >
              Next →
            </button>
          </>
        )}

        {/* Step 2: Customer Details */}
        {step === 2 && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="Your full name"
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
              <input
                type="text"
                required
                placeholder="6281234567890"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
              <textarea
                rows={3}
                placeholder="Any special requests?"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Summary:</span> {services.find(s => s.id === form.serviceId)?.name} on {new Date(form.bookingDate).toLocaleDateString('id-ID')} at {form.bookingTime}
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={loading || !form.customerName || !form.whatsapp}
                className="flex-1 bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 transition-colors"
              >
                {loading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  )
}

// ===== PAGE UTAMA DENGAN SUSPENSE =====
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
