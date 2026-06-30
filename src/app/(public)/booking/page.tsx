'use client'

import { Suspense } from 'react'
import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
  price: number
  originalPrice: number
  finalPrice: number
  discountAmount: number
  stock: number
  compareAtPrice: number | null
  category: { name: string } | null
  appliedPromo: {
    id: string
    title: string
    type: string
    discountValue: number
    discountType: string
  } | null
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

interface VoucherResponse {
  valid: boolean
  promo: {
    id: string
    title: string
    discountType: string
    discountValue: number
    type: string
    voucherCode: string
  } | null
}

// ===== KOMPONEN UTAMA =====
function BookingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const productIdParam = searchParams.get('product') || ''

  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [voucherValid, setVoucherValid] = useState<VoucherResponse | null>(null)
  const [voucherChecking, setVoucherChecking] = useState(false)
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null)
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null)

  const [form, setForm] = useState({
    customerName: '',
    customerWhatsapp: '',
    address: '',
    productId: productIdParam,
    quantity: 1,
    note: '',
    voucherCode: '',
    paymentMethodId: '',
  })

  const primaryColor = '#c4367b'
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load saved customer data
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('beauty_customer_data')
      if (savedData) {
        const data = JSON.parse(savedData)
        setForm(prev => ({
          ...prev,
          customerName: data.customerName || '',
          customerWhatsapp: data.customerWhatsapp || '',
          address: data.address || '',
        }))
      }
    } catch (e) {
      console.error('Error loading saved data:', e)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [productIdParam])

  const fetchData = async () => {
    try {
      const productsRes = await fetch('/api/public/products?limit=100')
      if (productsRes.ok) {
        const data = await productsRes.json()
        setProducts(data.data || [])
        
        if (productIdParam) {
          const product = data.data.find((p: Product) => p.id === productIdParam)
          if (product) {
            setSelectedProduct(product)
            setForm(prev => ({ ...prev, productId: product.id }))
          }
        }
      }

      const paymentsRes = await fetch('/api/public/payments')
      if (paymentsRes.ok) {
        const data = await paymentsRes.json()
        setPaymentMethods(data || [])
        if (data.length > 0) {
          setForm(prev => ({ ...prev, paymentMethodId: data[0].id }))
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId)
    setSelectedProduct(product || null)
    setForm(prev => ({ ...prev, productId, quantity: 1 }))
    setVoucherValid(null)
  }

  const handleVoucherCheck = async () => {
    if (!form.voucherCode.trim()) {
      toast.error('Masukkan kode voucher')
      return
    }
    if (!form.productId) {
      toast.error('Pilih produk terlebih dahulu')
      return
    }

    setVoucherChecking(true)
    try {
      const res = await fetch(
        `/api/public/vouchers?code=${encodeURIComponent(form.voucherCode)}&productId=${form.productId}`
      )
      const data = await res.json()

      if (res.ok) {
        setVoucherValid(data)
        toast.success('✅ Voucher berlaku!')
      } else {
        setVoucherValid(null)
        toast.error(data.error || 'Voucher tidak valid')
      }
    } catch (error) {
      console.error('Error checking voucher:', error)
      toast.error('Gagal mengecek voucher')
    } finally {
      setVoucherChecking(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 5MB')
        return
      }
      setPaymentProofFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPaymentProofPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'payment-proofs')

    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Upload failed')
      }
      const data = await res.json()
      return data.url
    } catch (error) {
      console.error('Error uploading file:', error)
      throw new Error('Gagal upload bukti pembayaran')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.customerName.trim() || !form.customerWhatsapp.trim() || !form.productId) {
      toast.error('Semua field wajib diisi')
      return
    }

    if (!selectedProduct) {
      toast.error('Pilih produk terlebih dahulu')
      return
    }

    if (form.quantity > selectedProduct.stock) {
      toast.error(`Stok tidak mencukupi (tersisa ${selectedProduct.stock} unit)`)
      return
    }

    try {
      localStorage.setItem('beauty_customer_data', JSON.stringify({
        customerName: form.customerName,
        customerWhatsapp: form.customerWhatsapp,
        address: form.address,
      }))
    } catch (e) {
      console.error('Error saving data:', e)
    }

    setShowPaymentModal(true)
  }

  const handleConfirmPayment = async () => {
    if (!form.paymentMethodId) {
      toast.error('Pilih metode pembayaran')
      return
    }

    if (!paymentProofFile) {
      toast.error('Upload bukti pembayaran')
      return
    }

    setSubmitting(true)
    try {
      let paymentProofUrl = ''
      if (paymentProofFile) {
        paymentProofUrl = await uploadFile(paymentProofFile)
      }

      const selectedPayment = paymentMethods.find(p => p.id === form.paymentMethodId)
      
      const pricePerUnit = selectedProduct?.finalPrice || selectedProduct?.price || 0
      const subtotal = pricePerUnit * form.quantity
      const originalSubtotal = (selectedProduct?.originalPrice || selectedProduct?.price || 0) * form.quantity
      let discount = (selectedProduct?.discountAmount || 0) * form.quantity
      
      let voucherDiscount = 0
      if (voucherValid?.valid && voucherValid.promo) {
        const promo = voucherValid.promo
        if (promo.discountType === 'PERCENTAGE') {
          voucherDiscount = (subtotal * promo.discountValue) / 100
        } else {
          voucherDiscount = promo.discountValue || 0
        }
      }
      
      const totalDiscount = discount + voucherDiscount
      const finalPrice = subtotal - voucherDiscount

      const orderData = {
        customerName: form.customerName,
        customerWhatsapp: form.customerWhatsapp,
        address: form.address,
        productId: form.productId,
        quantity: form.quantity,
        note: form.note,
        voucherCode: form.voucherCode,
        discountAmount: totalDiscount,
        finalPrice: finalPrice,
        paymentMethod: selectedPayment?.name || '',
        paymentProof: paymentProofUrl,
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('✅ Pesanan berhasil dibuat!')
        setShowPaymentModal(false)
        
        if (data.whatsappUrl) {
          window.open(data.whatsappUrl, '_blank')
        }
        
        setForm({
          ...form,
          quantity: 1,
          note: '',
          voucherCode: '',
        })
        setVoucherValid(null)
        setPaymentProofFile(null)
        setPaymentProofPreview(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } else {
        toast.error(data.error || 'Gagal membuat pesanan')
      }
    } catch (error: any) {
      console.error('Error submitting order:', error)
      toast.error(error.message || 'Terjadi kesalahan')
    } finally {
      setSubmitting(false)
    }
  }

  const getOrderSummary = () => {
    if (!selectedProduct) return null
    
    const pricePerUnit = selectedProduct.finalPrice || selectedProduct.price || 0
    const originalPricePerUnit = selectedProduct.originalPrice || selectedProduct.price || 0
    const subtotal = pricePerUnit * form.quantity
    const originalSubtotal = originalPricePerUnit * form.quantity
    const productDiscount = (selectedProduct.discountAmount || 0) * form.quantity
    
    let voucherDiscount = 0
    if (voucherValid?.valid && voucherValid.promo) {
      const promo = voucherValid.promo
      if (promo.discountType === 'PERCENTAGE') {
        voucherDiscount = (subtotal * promo.discountValue) / 100
      } else {
        voucherDiscount = promo.discountValue || 0
      }
    }
    
    return {
      pricePerUnit,
      originalPricePerUnit,
      subtotal,
      originalSubtotal,
      productDiscount,
      voucherDiscount,
      totalDiscount: productDiscount + voucherDiscount,
      finalPrice: subtotal - voucherDiscount,
      hasProductDiscount: selectedProduct.discountAmount > 0,
      hasVoucherDiscount: voucherDiscount > 0,
      promoName: selectedProduct.appliedPromo?.title || null,
      voucherName: voucherValid?.promo?.title || null,
    }
  }

  const summary = getOrderSummary()
  const selectedPaymentMethod = paymentMethods.find(p => p.id === form.paymentMethodId)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: primaryColor }} />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Booking / Order</h1>
      <p className="text-gray-500 mb-8">Isi form di bawah untuk memesan produk</p>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
        {/* Customer Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nama Lengkap *</label>
            <input
              type="text"
              required
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-colors"
              style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
              placeholder="Masukkan nama Anda"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">No. WhatsApp *</label>
            <input
              type="tel"
              required
              value={form.customerWhatsapp}
              onChange={(e) => setForm({ ...form, customerWhatsapp: e.target.value })}
              className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-colors"
              style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
              placeholder="08xxxxxxxxxx"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Alamat Lengkap *</label>
          <textarea
            required
            rows={2}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-colors"
            style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
            placeholder="Jl. Contoh No. 123, Jakarta"
          />
        </div>

        {/* Product & Quantity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Pilih Produk *</label>
            <select
              required
              value={form.productId}
              onChange={(e) => handleProductChange(e.target.value)}
              className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-colors"
              style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
            >
              <option value="">-- Pilih Produk --</option>
              {products
                .filter(p => p.stock > 0)
                .map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - Rp {(product.finalPrice || product.price).toLocaleString()} (Stok: {product.stock})
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Jumlah *</label>
            <input
              type="number"
              required
              min="1"
              max={selectedProduct?.stock || 999}
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })}
              className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-colors"
              style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
            />
            {selectedProduct && (
              <p className="text-xs text-gray-400 mt-1">Stok tersedia: {selectedProduct.stock} unit</p>
            )}
          </div>
        </div>

        {/* Voucher */}
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Kode Voucher (Opsional)</label>
            <input
              type="text"
              value={form.voucherCode}
              onChange={(e) => {
                setForm({ ...form, voucherCode: e.target.value.toUpperCase() })
                setVoucherValid(null)
              }}
              className={`mt-1 block w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                voucherValid?.valid ? 'border-green-500' : 'border-gray-300'
              }`}
              style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
              placeholder="Masukkan kode voucher"
              disabled={voucherChecking}
            />
          </div>
          <button
            type="button"
            onClick={handleVoucherCheck}
            disabled={voucherChecking || !form.voucherCode.trim()}
            className="mt-6 px-4 py-2.5 rounded-lg text-white font-medium transition-all hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: primaryColor }}
          >
            {voucherChecking ? 'Checking...' : 'Cek'}
          </button>
        </div>

        {voucherValid?.valid && voucherValid.promo && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-700">
              ✅ {voucherValid.promo.title}
              {voucherValid.promo.discountType === 'PERCENTAGE' 
                ? ` - ${voucherValid.promo.discountValue}% OFF` 
                : ` - Rp ${voucherValid.promo.discountValue?.toLocaleString()} OFF`}
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">Catatan (Opsional)</label>
          <textarea
            rows={2}
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-colors"
            style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
            placeholder="Catatan tambahan..."
          />
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Metode Pembayaran *</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setForm({ ...form, paymentMethodId: method.id })}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  form.paymentMethodId === method.id
                    ? 'border-pink-500 bg-pink-50 text-pink-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {method.name}
                <span className="block text-xs text-gray-400 font-normal">
                  {method.type === 'bank' ? '🏦 Bank' : method.type === 'ewallet' ? '📱 E-Wallet' : '📱 QRIS'}
                </span>
              </button>
            ))}
          </div>
          {selectedPaymentMethod && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm">
              {selectedPaymentMethod.accountNumber && (
                <p>No. Rekening: <span className="font-medium">{selectedPaymentMethod.accountNumber}</span></p>
              )}
              {selectedPaymentMethod.accountName && (
                <p>Atas Nama: <span className="font-medium">{selectedPaymentMethod.accountName}</span></p>
              )}
              {selectedPaymentMethod.qrCodeUrl && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-1">QR Code:</p>
                  <Image 
                    src={selectedPaymentMethod.qrCodeUrl} 
                    alt="QR Code" 
                    width={150} 
                    height={150}
                    className="border rounded-lg"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Upload Bukti */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Upload Bukti Transfer *</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
          />
          {paymentProofPreview && (
            <div className="mt-2">
              <img src={paymentProofPreview} alt="Preview bukti" className="w-32 h-32 object-cover rounded-lg border" />
            </div>
          )}
          <p className="text-xs text-gray-400 mt-1">Format: JPG, PNG, WEBP (Max 5MB)</p>
        </div>

        {/* Rincian Order */}
        {selectedProduct && summary && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <h3 className="font-semibold text-gray-800 border-b border-gray-200 pb-2">📋 Rincian Pesanan</h3>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Produk</span>
              <span className="font-medium">{selectedProduct.name}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Harga per unit</span>
              <span>Rp {summary.pricePerUnit.toLocaleString()}</span>
            </div>
            
            {summary.hasProductDiscount && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Harga Normal</span>
                  <span className="line-through text-gray-400">Rp {summary.originalPricePerUnit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600">
                  <span>Diskon Promo ({summary.promoName || 'Promo'})</span>
                  <span>- Rp {(summary.originalPricePerUnit - summary.pricePerUnit).toLocaleString()}</span>
                </div>
              </>
            )}
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Jumlah</span>
              <span>{form.quantity} unit</span>
            </div>
            
            <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
              <span className="text-gray-600">Subtotal</span>
              <span>Rp {summary.subtotal.toLocaleString()}</span>
            </div>
            
            {summary.productDiscount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Diskon Produk</span>
                <span>- Rp {summary.productDiscount.toLocaleString()}</span>
              </div>
            )}
            
            {summary.hasVoucherDiscount && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Diskon Voucher ({summary.voucherName})</span>
                <span>- Rp {summary.voucherDiscount.toLocaleString()}</span>
              </div>
            )}
            
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
              <span style={{ color: primaryColor }}>Total</span>
              <span style={{ color: primaryColor }}>Rp {summary.finalPrice.toLocaleString()}</span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !form.productId}
          className="w-full py-3 rounded-lg text-white font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
          style={{ backgroundColor: primaryColor }}
        >
          {submitting ? 'Memproses...' : 'Konfirmasi Pembayaran'}
        </button>

        <p className="text-xs text-gray-400 text-center mt-2">
          * Setelah konfirmasi, Anda akan diarahkan ke WhatsApp admin dengan semua data pesanan
        </p>
      </form>

      {/* Payment Confirmation Modal */}
      {showPaymentModal && summary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Konfirmasi Pembayaran</h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p className="text-sm text-gray-500 font-medium">📋 Detail Pesanan</p>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Produk</span>
                  <span className="font-medium">{selectedProduct?.name}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Jumlah</span>
                  <span>{form.quantity} unit</span>
                </div>
                
                {summary.hasProductDiscount && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Diskon Promo</span>
                    <span>- Rp {summary.productDiscount.toLocaleString()}</span>
                  </div>
                )}
                
                {summary.hasVoucherDiscount && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Diskon Voucher</span>
                    <span>- Rp {summary.voucherDiscount.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                  <span style={{ color: primaryColor }}>Total</span>
                  <span style={{ color: primaryColor }}>Rp {summary.finalPrice.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-sm pt-2">
                  <span className="text-gray-600">Metode</span>
                  <span>{selectedPaymentMethod?.name}</span>
                </div>
                
                {paymentProofPreview && (
                  <div className="mt-2">
                    <p className="text-gray-500 text-sm">Bukti Transfer:</p>
                    <img src={paymentProofPreview} alt="Bukti" className="w-24 h-24 object-cover rounded-lg border mt-1" />
                  </div>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-700">
                  ⚠️ Pastikan data yang Anda isi sudah benar sebelum mengirim ke admin.
                </p>
              </div>

              <button
                onClick={handleConfirmPayment}
                disabled={submitting}
                className="w-full py-3 rounded-lg text-white font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
              >
                {submitting ? 'Memproses...' : 'Kirim ke Admin via WhatsApp'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ===== PAGE UTAMA DENGAN SUSPENSE =====
export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#c4367b' }} />
      </div>
    }>
      <BookingContent />
    </Suspense>
  )
}
