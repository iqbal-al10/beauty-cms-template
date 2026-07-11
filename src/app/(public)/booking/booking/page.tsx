'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, Calendar, Clock, User, Phone, Mail, MessageSquare, ArrowLeft, DollarSign, CreditCard, X, MapPin } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

declare global {
  interface Window {
    snap?: {
      pay: (token: string, options: any) => void
    }
  }
}

interface Service {
  id: string
  name: string
  description: string | null
  duration: number
  price: number
  compareAtPrice: number | null
  isActive: boolean
  slug: string
}

interface PaymentMethod {
  id: string
  name: string
  type: string
  accountNumber: string | null
  accountName: string | null
  qrCodeUrl: string | null
  isActive: boolean
}

interface Settings {
  siteName: string
  colorPrimary: string
  whatsappNumber: string | null
  email: string | null
  address: string | null
  operatingHours: any
  fontFamily: string
  headingFontSize: string
  bodyFontSize: string
  smallFontSize: string
}

interface Slot {
  time: string
  isBooked: boolean
}

const CUSTOMER_STORAGE_KEY = 'beauty_customer'

function BookingServiceContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const serviceIdParam = searchParams.get('service') || ''

  const [step, setStep] = useState(1)
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [slots, setSlots] = useState<Slot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [bookingData, setBookingData] = useState<any>(null)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [voucherDiscount, setVoucherDiscount] = useState(0)
  const [voucherCode, setVoucherCode] = useState('')
  const [voucherApplied, setVoucherApplied] = useState(false)
  const [voucherError, setVoucherError] = useState('')
  const [settings, setSettings] = useState<Settings | null>(null)
  const [isClosed, setIsClosed] = useState(false)
  const [closedMessage, setClosedMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [form, setForm] = useState({
    serviceId: serviceIdParam,
    bookingDate: '',
    bookingTime: '',
    customerName: '',
    whatsapp: '',
    email: '',
    address: '',
    notes: '',
    paymentMethod: '',
  })

  const primaryColor = '#c4367b'

  useEffect(() => {
    const savedCustomer = localStorage.getItem(CUSTOMER_STORAGE_KEY)
    if (savedCustomer) {
      try {
        const data = JSON.parse(savedCustomer)
        setForm(prev => ({
          ...prev,
          customerName: data.customerName || '',
          whatsapp: data.customerWhatsapp || '',
          email: data.email || '',
          address: data.address || '',
        }))
      } catch (e) {
        console.error('Error loading customer data:', e)
      }
    }
  }, [])

  useEffect(() => {
    fetchServices()
    fetchPaymentMethods()
    fetchSettings()
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

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/public/settings')
      if (res.ok) {
        const data = await res.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

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

  const fetchPaymentMethods = async () => {
    try {
      const res = await fetch('/api/public/payments')
      if (res.ok) {
        const data = await res.json()
        setPaymentMethods(data.filter((p: PaymentMethod) => p.isActive))
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error)
    }
  }

  const fetchSlots = async (date: string, serviceId: string) => {
    if (!date || !serviceId) return

    setLoadingSlots(true)
    setSlots([])

    try {
      const res = await fetch(`/api/public/bookings?date=${date}&serviceId=${serviceId}`)
      const data = await res.json()
      
      if (data.slots && Array.isArray(data.slots)) {
        if (data.slots.length > 0 && typeof data.slots[0] === 'object' && data.slots[0].time !== undefined) {
          setSlots(data.slots)
        } else if (data.slots.length > 0 && typeof data.slots[0] === 'string') {
          const convertedSlots = data.slots.map((time: string) => ({
            time,
            isBooked: false,
          }))
          setSlots(convertedSlots)
        } else {
          setSlots([])
        }
      } else {
        setSlots([])
      }
      
      setIsClosed(data.isClosed || false)
      setClosedMessage(data.message || '')
    } catch (error) {
      console.error('Error fetching slots:', error)
    } finally {
      setLoadingSlots(false)
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

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setVoucherError('Masukkan kode voucher')
      return
    }

    try {
      const res = await fetch('/api/vouchers/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: voucherCode,
          productIds: [],
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setVoucherError(data.error || 'Voucher tidak valid')
        setVoucherApplied(false)
        setVoucherDiscount(0)
        return
      }

      if (data.valid) {
        setVoucherDiscount(data.discount)
        setVoucherApplied(true)
        setVoucherError('')
        toast.success(`✅ Voucher ${data.code} berhasil! Potongan Rp ${data.discount.toLocaleString()}`)
      }
    } catch (error) {
      console.error('Error applying voucher:', error)
      setVoucherError('Gagal memvalidasi voucher')
    }
  }

  const handleRemoveVoucher = () => {
    setVoucherApplied(false)
    setVoucherDiscount(0)
    setVoucherCode('')
    setVoucherError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 🔥 CEK MIDTRANS: Jika ada midtransMethod, checkbox harus dicentang
    const midtransMethod = paymentMethods.find(p => p.type === 'MIDTRANS' && p.isActive)
    
    if (midtransMethod) {
      if (!isConfirmed) {
        toast.error('Silakan centang konfirmasi data booking terlebih dahulu')
        return
      }
    } else {
      if (!form.paymentMethod) {
        toast.error('Pilih metode pembayaran')
        return
      }
    }

    if (paymentMethods.length === 0) {
      toast.error('Belum ada metode pembayaran yang tersedia. Silahkan hubungi admin.')
      return
    }

    if (!form.email.trim()) {
      toast.error('Email wajib diisi')
      return
    }

    const totalPrice = getTotalPrice()
    if (totalPrice <= 0) {
      toast.error('Total pembayaran harus lebih dari 0')
      return
    }

    setSubmitting(true)
    const loadingToast = toast.loading('Memproses booking...')

    const selectedPayment = paymentMethods.find(p => p.id === form.paymentMethod)
    const customerEmail = form.email.trim()

    try {
      // 1. Buat booking
      const res = await fetch('/api/public/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          email: customerEmail,
          address: form.address || '',
          voucherCode: voucherApplied ? voucherCode : null,
          paymentMethod: form.paymentMethod,
          paymentMethodName: selectedPayment?.name || '',
          paymentAccountNumber: selectedPayment?.accountNumber || '',
          paymentAccountName: selectedPayment?.accountName || '',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Gagal membuat booking')
      }

      const newBookingId = data.booking.id

      // 🔥 SIMPAN DATA CUSTOMER KE LOCALSTORAGE
      localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify({
        customerName: form.customerName,
        customerWhatsapp: form.whatsapp,
        email: customerEmail,
        address: form.address || '',
      }))

      // 🔥 SIMPAN SERVICE ID UNTUK REDIRECT KE BOOKING
      if (selectedService?.id) {
        localStorage.setItem('last_booking_service', selectedService.id)
      }

      // 🔥 PROSES PEMBAYARAN VIA MIDTRANS
      const paymentRes = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: newBookingId,
          isBooking: true,
        }),
      })

      const paymentData = await paymentRes.json()

      if (!paymentRes.ok) {
        throw new Error(paymentData.error || 'Gagal memproses pembayaran')
      }

      toast.dismiss(loadingToast)

      console.log('🔍 window.snap:', window.snap)
      console.log('🔍 Payment token:', paymentData.token)

      // 🔥 CEK APAKAH SNAP TERSEDIA
      if (!window.snap || typeof window.snap.pay !== 'function') {
        console.error('❌ Snap is not available! Redirecting to Midtrans...')
        toast.loading('Mengarahkan ke halaman pembayaran Midtrans...')
        window.location.href = paymentData.redirectUrl
        return
      }

      // 🔥 BUKA POPUP MIDTRANS
      window.snap.pay(paymentData.token, {
        onSuccess: function(result: any) {
          console.log('✅ Payment success:', result)
          toast.success('✅ Pembayaran berhasil!')
          window.location.href = `/payment/success?order_id=${result.order_id}`
        },
        onPending: function(result: any) {
          console.log('⏳ Payment pending:', result)
          toast.loading('⏳ Menunggu pembayaran...')
          window.location.href = `/payment/pending?order_id=${result.order_id}`
        },
        onError: function(result: any) {
          console.error('❌ Payment error:', result)
          toast.error('❌ Pembayaran gagal')
          window.location.href = `/payment/error?order_id=${result.order_id}`
        },
        onClose: function() {
          console.log('❌ Payment closed by user')
          toast.error('❌ Pembayaran dibatalkan')
          // 🔥 REDIRECT KE HALAMAN ERROR
          const orderId = paymentData.orderId || ''
          window.location.href = `/payment/error?order_id=${orderId}&error=Pembayaran%20dibatalkan`
        },
      })

    } catch (error: any) {
      toast.dismiss(loadingToast)
      console.error('Error:', error)
      toast.error(error.message || 'Terjadi kesalahan')
      setSubmitting(false)
    }
  }

  const getTotalPrice = () => {
    if (!selectedService) return 0
    return Math.max(0, selectedService.price - voucherDiscount)
  }

  const renderSlots = () => {
    if (loadingSlots) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: primaryColor }}></div>
          <span className="ml-3 text-sm text-gray-500">Memuat jadwal...</span>
        </div>
      )
    }

    if (slots.length === 0) {
      if (isClosed) {
        return (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-yellow-700 font-medium">{closedMessage || 'Maaf, tidak ada slot tersedia untuk hari ini'}</p>
          </div>
        )
      }
      return (
        <p className="text-gray-500 text-sm">Pilih tanggal terlebih dahulu untuk melihat slot</p>
      )
    }

    const sortedSlots = [...slots].sort((a, b) => a.time.localeCompare(b.time))

    return (
      <div className="grid grid-cols-3 gap-2">
        {sortedSlots.map((slot) => {
          const isSelected = form.bookingTime === slot.time
          
          return (
            <button
              key={slot.time}
              type="button"
              onClick={() => !slot.isBooked && setForm({ ...form, bookingTime: slot.time })}
              disabled={slot.isBooked}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                slot.isBooked
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
                  : isSelected
                  ? 'bg-pink-500 text-white border-pink-500'
                  : 'border-gray-300 hover:border-pink-300'
              }`}
              title={slot.isBooked ? 'already booked' : ''}
            >
              {slot.time}
              {slot.isBooked && <span className="ml-1 text-xs"></span>}
            </button>
          )
        })}
      </div>
    )
  }

  const getOperatingHoursList = () => {
    if (!settings || !settings.operatingHours) {
      return null
    }

    let hours = settings.operatingHours
    
    if (typeof hours === 'string') {
      try {
        hours = JSON.parse(hours)
      } catch (e) {
        return null
      }
    }

    if (typeof hours !== 'object' || Array.isArray(hours)) {
      return null
    }

    const dayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    
    const sortedEntries = dayOrder
      .filter(day => hours[day] !== undefined)
      .map(day => [day, hours[day]])

    return sortedEntries.map(([day, time]) => (
      <p key={day} className="text-gray-600 text-sm flex justify-between">
        <span className="capitalize">{day}</span>
        <span>{String(time)}</span>
      </p>
    ))
  }

  if (loading && !submitted) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-40 mb-6" />
        <div className="h-8 bg-gray-200 rounded w-48 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-64 mb-8" />
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 text-center">
            <div className="w-8 h-8 rounded-full bg-gray-200 mx-auto mb-1" />
            <div className="h-3 bg-gray-200 rounded w-12 mx-auto" />
          </div>
          <div className="flex-1 text-center">
            <div className="w-8 h-8 rounded-full bg-gray-200 mx-auto mb-1" />
            <div className="h-3 bg-gray-200 rounded w-12 mx-auto" />
          </div>
          <div className="flex-1 text-center">
            <div className="w-8 h-8 rounded-full bg-gray-200 mx-auto mb-1" />
            <div className="h-3 bg-gray-200 rounded w-12 mx-auto" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
          <div className="h-10 bg-gray-200 rounded w-full" />
          <div className="h-12 bg-gray-200 rounded w-full" />
        </div>
      </div>
    )
  }

  if (submitted && bookingData) {
    const adminWhatsapp = settings?.whatsappNumber || '6285710379820'
    const selectedPayment = paymentMethods.find(p => p.id === form.paymentMethod)
    const waMessage = `Halo Admin,%0A%0ASaya sudah melakukan booking:%0A%0A📋 *Booking ID:* ${bookingData.booking.id}%0A👤 *Nama:* ${bookingData.booking.customerName}%0A📱 *WA:* ${bookingData.booking.whatsapp}%0A📧 *Email:* ${bookingData.booking.email || '-'}%0A📍 *Alamat:* ${bookingData.booking.address || '-'}%0A💵 *Total:* Rp ${bookingData.totalPrice.toLocaleString()}%0A📅 *Tanggal:* ${new Date(bookingData.booking.bookingDate).toLocaleDateString('id-ID')}%0A⏰ *Waktu:* ${bookingData.booking.bookingTime}%0A💳 *Metode:* ${selectedPayment?.name || form.paymentMethod}%0A%0A📎 *Berikut bukti pembayaran saya.*`

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
              <span className="font-medium">{bookingData.service?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tanggal</span>
              <span className="font-medium">
                {new Date(bookingData.booking.bookingDate).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Waktu</span>
              <span className="font-medium">{bookingData.booking.bookingTime}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Alamat</span>
              <span className="font-medium">{bookingData.booking.address || '-'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total</span>
              <span className="font-medium text-pink-500">Rp {bookingData.totalPrice.toLocaleString()}</span>
            </div>
            {bookingData.voucherCode && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Voucher</span>
                <span>- Rp {bookingData.discountAmount?.toLocaleString() || 0}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Metode Pembayaran</span>
              <span className="font-medium">{selectedPayment?.name || form.paymentMethod}</span>
            </div>
            {selectedPayment?.accountNumber && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">No Rekening/Akun</span>
                <span className="font-mono font-medium">{selectedPayment.accountNumber}</span>
              </div>
            )}
            {selectedPayment?.accountName && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">a.n</span>
                <span className="font-medium">{selectedPayment.accountName}</span>
              </div>
            )}
          </div>

          <div className="mt-6">
            <a
              href={`https://wa.me/${adminWhatsapp.replace(/[^0-9]/g, '')}?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-all hover:opacity-90 hover:scale-105 active:scale-95"
              style={{ backgroundColor: '#25D366' }}
            >
              📱 Kirim Bukti Pembayaran via WhatsApp
            </a>
          </div>

          <div className="mt-4 flex gap-4 justify-center">
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

  const totalPrice = getTotalPrice()
  const operatingHoursList = getOperatingHoursList()
  const midtransMethod = paymentMethods.find(p => p.type === 'MIDTRANS' && p.isActive)

  // 🔥 TOMBOL KEMBALI STEP 2 - KE DETAIL SERVICE
  const handleBackToServiceDetail = () => {
    if (selectedService?.slug) {
      router.push(`/booking/${selectedService.slug}`)
    } else {
      router.push('/booking')
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      {step === 2 ? (
        // STEP 2 - Tombol Kembali ke Detail Layanan
        <button
          onClick={handleBackToServiceDetail}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Kembali ke Detail Layanan
        </button>
      ) : step === 3 ? (
        // STEP 3 - Tombol Kembali ke Jadwal
        <button
          onClick={() => setStep(2)}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Kembali ke Jadwal
        </button>
      ) : (
        <Link href="/booking" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Kembali ke Layanan
        </Link>
      )}

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

      {/* Jam Operasional */}
      {operatingHoursList && operatingHoursList.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <p className="text-sm font-medium text-gray-700 mb-1">🕐 Jam Operasional:</p>
          <div className="text-sm space-y-0.5">
            {operatingHoursList}
          </div>
        </div>
      )}

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
              {loadingSlots && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2" style={{ borderColor: primaryColor }}></div>
                  <span className="text-sm text-gray-500">Memuat slot...</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Waktu *</label>
              {renderSlots()}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                required
                placeholder="email@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
              />
              <p className="text-xs text-gray-400 mt-1">Email diperlukan untuk konfirmasi pembayaran</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alamat (Opsional)
              </label>
              <textarea
                rows={2}
                placeholder="Jl. Arwana No. 123, RT/RW, Dusun, Desa, Kecamatan, Kota/Kab, Provinsi"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
              />
              <p className="text-xs text-gray-400 mt-1">Alamat akan digunakan untuk tim kami melakukan penanganan langsung ke rumah anda</p>
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

            {/* HARGA - DENGAN COMPAREATPRICE */}
            {selectedService && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Harga Layanan</span>
                  <div className="text-right">
                    <span className="font-bold text-pink-500">Rp {selectedService.price.toLocaleString()}</span>
                    {selectedService.compareAtPrice && selectedService.compareAtPrice > selectedService.price && (
                      <p className="text-xs text-gray-400 line-through">
                        Rp {selectedService.compareAtPrice.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* TAMPILKAN HEMAT */}
                {selectedService.compareAtPrice && selectedService.compareAtPrice > selectedService.price && (
                  <div className="flex justify-between items-center text-sm text-green-600 mt-1">
                    <span>💰 Hemat</span>
                    <span>Rp {(selectedService.compareAtPrice - selectedService.price).toLocaleString()}</span>
                  </div>
                )}

                {voucherApplied && voucherDiscount > 0 && (
                  <div className="flex justify-between items-center text-sm text-green-600 mt-1">
                    <span>Diskon Voucher</span>
                    <span>- Rp {voucherDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center font-bold text-lg border-t border-gray-200 pt-2 mt-2">
                  <span>Total</span>
                  <span style={{ color: primaryColor }}>Rp {totalPrice.toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* Voucher */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kode Voucher</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  placeholder="Masukkan kode voucher"
                  disabled={voucherApplied}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 disabled:bg-gray-100"
                />
                {voucherApplied ? (
                  <button
                    type="button"
                    onClick={handleRemoveVoucher}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleApplyVoucher}
                    className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg"
                  >
                    Apply
                  </button>
                )}
              </div>
              {voucherError && (
                <p className="text-sm text-red-500 mt-1">{voucherError}</p>
              )}
              {voucherApplied && (
                <p className="text-sm text-green-500 mt-1">✅ Voucher terpakai! Potongan Rp {voucherDiscount.toLocaleString()}</p>
              )}
            </div>

            {/* METODE PEMBAYARAN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {midtransMethod ? '💳 Konfirmasi Pembayaran' : 'Metode Pembayaran *'}
              </label>

              {midtransMethod ? (
                // ===== TAMPILAN MIDTRANS =====
                <div className="bg-pink-50 border border-pink-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-5 h-5 text-pink-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-pink-800">Bayar dengan Midtrans</p>
                      <p className="text-sm text-pink-700 mt-0.5">
                        Pembayaran akan diproses melalui Midtrans dengan sistem keamanan tinggi
                      </p>
                      
                      <div className="mt-3 bg-white rounded-lg p-3 text-sm text-gray-600 space-y-1">
                        <p className="font-medium text-gray-700">💳 Metode pembayaran yang tersedia:</p>
                        <p>• QRIS (Scan & Bayar)</p>
                        <p>• Bank Transfer (BCA, Mandiri, BRI, BNI)</p>
                        <p>• E-Wallet (Gopay, OVO, Dana, ShopeePay)</p>
                        <p className="text-xs text-gray-400 mt-2">
                          🔒 Pembayaran Anda aman dengan enkripsi SSL
                        </p>
                      </div>
                      
                      <div className="mt-3 flex items-start gap-2">
                        <input
                          type="checkbox"
                          id="confirmBooking"
                          checked={isConfirmed}
                          onChange={(e) => setIsConfirmed(e.target.checked)}
                          className="w-4 h-4 text-pink-500 rounded border-gray-300 mt-0.5"
                        />
                        <label htmlFor="confirmBooking" className="text-sm text-gray-700">
                          Saya sudah memeriksa data booking dengan benar dan menyetujui untuk melanjutkan pembayaran
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ) : paymentMethods.length === 0 ? (
                // ===== TIDAK ADA METODE PEMBAYARAN =====
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                  <p className="text-yellow-700 text-sm">⚠️ Belum ada metode pembayaran. Silakan hubungi admin.</p>
                </div>
              ) : (
                // ===== TAMPILAN MANUAL (SEPERTI SEKARANG) =====
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {paymentMethods.filter(p => p.type !== 'MIDTRANS').map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-start gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                        form.paymentMethod === method.id
                          ? 'border-pink-500 bg-pink-50 ring-2 ring-pink-500'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={form.paymentMethod === method.id}
                        onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                        className="w-4 h-4 text-pink-500 mt-1"
                      />
                      <div className="flex-1 text-sm">
                        <p className="font-medium">{method.name}</p>
                        <p className="text-xs text-gray-500">{method.type}</p>
                        {method.accountNumber && (
                          <p className="text-xs text-gray-600 mt-1">
                            No: <span className="font-mono">{method.accountNumber}</span>
                          </p>
                        )}
                        {method.accountName && (
                          <p className="text-xs text-gray-600">
                            a.n: {method.accountName}
                          </p>
                        )}
                        {method.qrCodeUrl && method.type === 'QRIS' && (
                          <div className="mt-2">
                            <img src={method.qrCodeUrl} alt="QRIS" className="w-16 h-16 object-contain" />
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
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
              {/* STEP 3 - Tombol Kembali ke Jadwal */}
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                ← Kembali ke Jadwal
              </button>

              {/* STEP 3 - Tombol Konfirmasi & Bayar */}
              <button
                type="submit"
                disabled={
                  submitting || 
                  !form.customerName || 
                  !form.whatsapp || 
                  paymentMethods.length === 0 ||
                  (midtransMethod ? !isConfirmed : !form.paymentMethod)
                }
                className="flex-1 bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memproses...
                  </>
                ) : midtransMethod ? 'Konfirmasi & Bayar' : 'Konfirmasi & Bayar'}
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
      <div className="container mx-auto px-4 py-12 max-w-3xl animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-40 mb-6" />
        <div className="h-8 bg-gray-200 rounded w-48 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-64 mb-8" />
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 text-center">
            <div className="w-8 h-8 rounded-full bg-gray-200 mx-auto mb-1" />
            <div className="h-3 bg-gray-200 rounded w-12 mx-auto" />
          </div>
          <div className="flex-1 text-center">
            <div className="w-8 h-8 rounded-full bg-gray-200 mx-auto mb-1" />
            <div className="h-3 bg-gray-200 rounded w-12 mx-auto" />
          </div>
          <div className="flex-1 text-center">
            <div className="w-8 h-8 rounded-full bg-gray-200 mx-auto mb-1" />
            <div className="h-3 bg-gray-200 rounded w-12 mx-auto" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
          <div className="h-10 bg-gray-200 rounded w-full" />
          <div className="h-12 bg-gray-200 rounded w-full" />
        </div>
      </div>
    }>
      <BookingServiceContent />
    </Suspense>
  )
}