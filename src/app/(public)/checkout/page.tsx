'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, ShoppingBag, Truck, CreditCard, 
  CheckCircle, AlertCircle, X, Trash2, Plus, Minus
} from 'lucide-react'
import toast from 'react-hot-toast'

interface CartItem {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice: number | null
  finalPrice: number
  quantity: number
  imageUrl: string | null
  stock: number
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

interface ShippingCost {
  cost: number
  estimate: string
  zone: string
  freeShippingThreshold: number
}

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const productId = searchParams.get('product')
  const initialQuantity = parseInt(searchParams.get('quantity') || '1', 10)

  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [shippingCost, setShippingCost] = useState<ShippingCost | null>(null)
  const [voucherDiscount, setVoucherDiscount] = useState(0)
  const [voucherCode, setVoucherCode] = useState('')
  const [voucherApplied, setVoucherApplied] = useState(false)
  const [voucherError, setVoucherError] = useState('')
  const [singleProduct, setSingleProduct] = useState<CartItem | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  const [form, setForm] = useState({
    customerName: '',
    customerWhatsapp: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    note: '',
    paymentMethod: '',
  })

  useEffect(() => {
    const customerData = localStorage.getItem('beauty_customer')
    if (customerData) {
      try {
        const data = JSON.parse(customerData)
        setForm(prev => ({
          ...prev,
          customerName: data.customerName || '',
          customerWhatsapp: data.customerWhatsapp || '',
          address: data.address || '',
          city: data.city || '',
          province: data.province || '',
          postalCode: data.postalCode || '',
        }))
      } catch (e) {}
    }

    if (productId) {
      fetchSingleProduct(productId, initialQuantity)
    } else {
      const saved = localStorage.getItem('beauty_cart')
      if (saved) {
        const items = JSON.parse(saved)
        if (items.length === 0) {
          router.push('/cart')
          return
        }
        setCartItems(items)
      } else {
        router.push('/cart')
        return
      }
      fetchData()
    }
  }, [productId])

  const fetchSingleProduct = async (id: string, quantity: number) => {
    try {
      const res = await fetch(`/api/public/product-by-id?id=${id}`)
      if (!res.ok) {
        toast.error('Produk tidak ditemukan')
        router.push('/products')
        return
      }
      const product = await res.json()
      
      const item: CartItem = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        compareAtPrice: product.compareAtPrice || null,
        finalPrice: product.price,
        quantity: Math.min(quantity, product.stock || 1),
        imageUrl: product.imageUrl || null,
        stock: product.stock || 0,
      }
      
      setSingleProduct(item)
      setCartItems([item])
      fetchData()
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Gagal memuat produk')
      router.push('/products')
    }
  }

  const fetchData = async () => {
    try {
      const [paymentsRes] = await Promise.all([
        fetch('/api/admin/payments'),
      ])

      if (paymentsRes.ok) {
        const data = await paymentsRes.json()
        setPaymentMethods(data.filter((p: PaymentMethod) => p.isActive))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return
    
    const item = cartItems.find(i => i.id === id)
    if (item && newQuantity > item.stock) {
      toast.error(`Stok tersisa ${item.stock} unit`)
      return
    }

    setCartItems(prev => prev.map(i => 
      i.id === id ? { ...i, quantity: newQuantity } : i
    ))
    
    if (singleProduct) {
      setSingleProduct(prev => prev ? { ...prev, quantity: newQuantity } : null)
    }
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.finalPrice || item.price) * item.quantity, 0)
  }

  const calculateTotalItems = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0)
  }

  const handleCityChange = async (city: string) => {
    setForm(prev => ({ ...prev, city }))
    
    if (city.trim().length > 2) {
      try {
        const res = await fetch(`/api/shipping?city=${encodeURIComponent(city)}`)
        if (res.ok) {
          const data = await res.json()
          setShippingCost(data)
        }
      } catch (error) {
        console.error('Error fetching shipping:', error)
      }
    }
  }

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setVoucherError('Masukkan kode voucher')
      return
    }

    try {
      const productIds = cartItems.map(item => item.id)
      const res = await fetch('/api/vouchers/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: voucherCode,
          productIds,
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
        const discountValue = data.discount || 0
        setVoucherDiscount(discountValue)
        setVoucherApplied(true)
        setVoucherError('')
        toast.success(`✅ Voucher ${data.code} berhasil! Potongan Rp ${discountValue.toLocaleString()}`)
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
    
    setErrorMessage('')

    if (!form.customerName.trim()) {
      const msg = 'Nama lengkap wajib diisi'
      setErrorMessage(msg)
      toast.error(msg)
      return
    }
    if (!form.customerWhatsapp.trim()) {
      const msg = 'Nomor WhatsApp wajib diisi'
      setErrorMessage(msg)
      toast.error(msg)
      return
    }
    if (!form.address.trim()) {
      const msg = 'Alamat wajib diisi'
      setErrorMessage(msg)
      toast.error(msg)
      return
    }
    if (!form.paymentMethod) {
      const msg = 'Silakan pilih metode pembayaran terlebih dahulu'
      setErrorMessage(msg)
      toast.error(msg)
      return
    }

    setSubmitting(true)

    try {
      const subtotal = calculateSubtotal()
      const shipping = shippingCost?.cost || 0
      const appliedDiscount = voucherApplied ? voucherDiscount : 0
      const total = subtotal + shipping - appliedDiscount

      // Get selected payment method details
      const selectedPayment = paymentMethods.find(p => p.id === form.paymentMethod)

      const orderData = {
        customerName: form.customerName,
        customerWhatsapp: form.customerWhatsapp,
        address: form.address,
        city: form.city || '',
        province: form.province || '',
        postalCode: form.postalCode || '',
        shippingCost: shipping,
        subtotal,
        discountAmount: appliedDiscount,
        total,
        paymentMethod: form.paymentMethod,
        paymentMethodName: selectedPayment?.name || '',
        paymentAccountNumber: selectedPayment?.accountNumber || '',
        paymentAccountName: selectedPayment?.accountName || '',
        note: form.note || '',
        voucherCode: voucherApplied ? voucherCode : '',
        items: cartItems.map(item => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          price: item.finalPrice || item.price,
          compareAtPrice: item.compareAtPrice || null,
        })),
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Gagal membuat pesanan')
      }

      localStorage.setItem('beauty_customer', JSON.stringify({
        customerName: form.customerName,
        customerWhatsapp: form.customerWhatsapp,
        address: form.address,
        city: form.city,
        province: form.province,
        postalCode: form.postalCode,
      }))

      if (!productId) {
        localStorage.removeItem('beauty_cart')
        window.dispatchEvent(new Event('cartUpdate'))
      }

      toast.success('✅ Pesanan berhasil dibuat!')
      router.push(`/checkout/success?orderId=${data.id}`)
    } catch (error: any) {
      console.error('❌ Error creating order:', error)
      const msg = error.message || 'Gagal membuat pesanan'
      setErrorMessage(msg)
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  const subtotal = calculateSubtotal()
  const shipping = shippingCost?.cost || 0
  const totalItems = calculateTotalItems()
  const appliedDiscount = voucherApplied ? voucherDiscount : 0
  const total = subtotal + shipping - appliedDiscount
  const isFreeShipping = totalItems >= 12

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href={productId ? `/products/${cartItems[0]?.slug || ''}` : '/cart'} className="text-gray-500 hover:text-gray-700 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          {productId ? 'Back to Product' : 'Back to Cart'}
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Checkout</h1>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          ⚠️ {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
            {/* Customer Info */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Informasi Pelanggan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                    placeholder="Nama Anda"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={form.customerWhatsapp}
                    onChange={(e) => setForm({ ...form, customerWhatsapp: e.target.value })}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                    placeholder="6281234567890"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Info */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Alamat Pengiriman</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Alamat Lengkap *</label>
                  <textarea
                    rows={2}
                    required
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                    placeholder="Jl. Contoh No. 123, RT/RW, Kelurahan, Kecamatan"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Kota/Kabupaten *</label>
                    <input
                      type="text"
                      required
                      value={form.city}
                      onChange={(e) => handleCityChange(e.target.value)}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                      placeholder="Contoh: Mojokerto"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Provinsi</label>
                    <input
                      type="text"
                      value={form.province}
                      onChange={(e) => setForm({ ...form, province: e.target.value })}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                      placeholder="Contoh: Jawa Timur"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Kode Pos</label>
                    <input
                      type="text"
                      value={form.postalCode}
                      onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                      placeholder="61300"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Voucher */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Voucher</h2>
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

            {/* Payment Method - DENGAN DETAIL */}
            <div id="payment-method-section">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Metode Pembayaran *
                <span className="text-red-500 ml-1">(wajib dipilih)</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {paymentMethods.length === 0 ? (
                  <p className="text-gray-500 col-span-full">Belum ada metode pembayaran. Silakan hubungi admin.</p>
                ) : (
                  paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
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
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{method.name}</p>
                        <p className="text-xs text-gray-500">{method.type}</p>
                        {method.accountNumber && (
                          <p className="text-xs text-gray-600 mt-1">
                            No Rekening/Akun: <span className="font-mono">{method.accountNumber}</span>
                          </p>
                        )}
                        {method.accountName && (
                          <p className="text-xs text-gray-600">
                            a.n: {method.accountName}
                          </p>
                        )}
                        {method.qrCodeUrl && method.type === 'QRIS' && (
                          <div className="mt-2">
                            <img src={method.qrCodeUrl} alt="QRIS" className="w-20 h-20 object-contain" />
                          </div>
                        )}
                      </div>
                    </label>
                  ))
                )}
              </div>
              {!form.paymentMethod && paymentMethods.length > 0 && (
                <p className="text-xs text-red-500 mt-2">⚠️ Silakan pilih salah satu metode pembayaran di atas</p>
              )}
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Catatan Pesanan</label>
              <textarea
                rows={2}
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="Catatan tambahan untuk pesanan..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-lg text-white font-semibold text-lg transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#c4367b' }}
            >
              {submitting ? 'Memproses...' : 'Konfirmasi Pesanan'}
            </button>
          </form>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Ringkasan Pesanan</h2>

            <div className="space-y-4 max-h-80 overflow-y-auto">
              {cartItems.map((item) => {
                const displayPrice = item.finalPrice || item.price
                const hasCompare = item.compareAtPrice && item.compareAtPrice > displayPrice
                const itemTotal = displayPrice * item.quantity
                const compareTotal = hasCompare ? (item.compareAtPrice || 0) * item.quantity : 0
                const savings = hasCompare ? (item.compareAtPrice || 0) - displayPrice : 0
                
                return (
                  <div key={item.id} className="border-b border-gray-100 pb-3 last:border-0">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <span className="text-xl">🧴</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                        
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-0.5 rounded-full hover:bg-gray-100 disabled:opacity-50"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-medium w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="p-0.5 rounded-full hover:bg-gray-100 disabled:opacity-50"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <span className="text-xs text-gray-400 ml-1">/ {item.stock} tersedia</span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <p className="text-sm font-bold text-pink-500">
                            Rp {displayPrice.toLocaleString()}
                          </p>
                          {hasCompare && (
                            <p className="text-xs text-gray-400 line-through">
                              Rp {item.compareAtPrice?.toLocaleString()}
                            </p>
                          )}
                        </div>
                        
                        {hasCompare && savings > 0 && (
                          <p className="text-xs text-green-600">
                            Hemat Rp {savings.toLocaleString()} / item
                          </p>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-800 whitespace-nowrap">
                        Rp {itemTotal.toLocaleString()}
                      </p>
                    </div>
                    
                    {hasCompare && compareTotal > itemTotal && (
                      <div className="text-right text-xs text-gray-400 mt-1">
                        <span className="line-through">Rp {compareTotal.toLocaleString()}</span>
                        <span className="text-green-600 ml-2">Hemat Rp {(compareTotal - itemTotal).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="border-t border-gray-200 mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal ({totalItems} produk)</span>
                <span className="font-medium">Rp {subtotal.toLocaleString()}</span>
              </div>

              {shippingCost && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Ongkir ({shippingCost.zone})</span>
                  <span className="font-medium">
                    {isFreeShipping ? (
                      <span className="text-green-500">GRATIS</span>
                    ) : (
                      `Rp ${shipping.toLocaleString()}`
                    )}
                  </span>
                </div>
              )}

              {shippingCost && (
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Estimasi: {shippingCost.estimate}</span>
                  {isFreeShipping && <span className="text-green-500">✅ Gratis ongkir (12 produk)</span>}
                </div>
              )}

              {voucherApplied && voucherDiscount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Diskon Voucher</span>
                  <span>- Rp {voucherDiscount.toLocaleString()}</span>
                </div>
              )}

              <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span style={{ color: '#c4367b' }}>
                  Rp {total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}