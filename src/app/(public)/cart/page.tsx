'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'
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

export default function CartPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = () => {
    try {
      const saved = localStorage.getItem('beauty_cart')
      if (saved) {
        const items = JSON.parse(saved)
        setCartItems(items)
      } else {
        setCartItems([])
      }
    } catch (error) {
      console.error('Error loading cart:', error)
      setCartItems([])
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return

    const updatedItems = cartItems.map((item) => {
      if (item.id === id) {
        if (newQuantity > item.stock) {
          toast.error(`Stok tersisa ${item.stock} unit`)
          return item
        }
        return { ...item, quantity: newQuantity }
      }
      return item
    })

    setCartItems(updatedItems)
    localStorage.setItem('beauty_cart', JSON.stringify(updatedItems))
    window.dispatchEvent(new Event('cartUpdate'))
  }

  const removeItem = (id: string, name: string) => {
    if (!confirm(`Hapus "${name}" dari keranjang?`)) return

    const updatedItems = cartItems.filter((item) => item.id !== id)
    setCartItems(updatedItems)
    localStorage.setItem('beauty_cart', JSON.stringify(updatedItems))
    window.dispatchEvent(new Event('cartUpdate'))
    toast.success(`${name} dihapus dari keranjang`)
  }

  const clearCart = () => {
    if (!confirm('Yakin ingin mengosongkan keranjang?')) return
    setCartItems([])
    localStorage.removeItem('beauty_cart')
    window.dispatchEvent(new Event('cartUpdate'))
    toast.success('Keranjang dikosongkan')
  }

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Keranjang kosong')
      return
    }
    router.push('/checkout')
  }

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = cartItems.reduce((sum, item) => sum + (item.finalPrice || item.price) * item.quantity, 0)
  const shipping = subtotal > 0 ? 20000 : 0
  const total = subtotal + shipping

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="text-gray-500 hover:text-gray-700 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Shopping Cart</h1>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
          <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-600">Keranjang Kosong</h2>
          <p className="text-gray-400 mt-2">Belum ada produk di keranjang Anda</p>
          <Link
            href="/products"
            className="inline-block mt-6 px-6 py-3 rounded-full text-white font-medium transition-all hover:opacity-90"
            style={{ backgroundColor: '#c4367b' }}
          >
            Mulai Belanja
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <span className="font-semibold text-gray-700">{totalItems} Produk</span>
                <button
                  onClick={clearCart}
                  className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Kosongkan
                </button>
              </div>

              <div className="divide-y divide-gray-100">
                {cartItems.map((item) => {
                  const displayPrice = item.finalPrice || item.price
                  const hasCompare = item.compareAtPrice && item.compareAtPrice > displayPrice
                  
                  return (
                    <div key={item.id} className="p-4 flex items-center gap-4">
                      {/* Image */}
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <span className="text-3xl">🧴</span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${item.slug}`}
                          className="font-medium text-gray-800 hover:text-pink-500 transition-colors line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <p className="text-sm font-bold text-pink-500">
                            Rp {displayPrice.toLocaleString()}
                          </p>
                          {hasCompare && (
                            <p className="text-xs text-gray-400 line-through">
                              Rp {item.compareAtPrice?.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Quantity */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item.id, item.name)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Ringkasan</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">Rp {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Ongkos Kirim</span>
                  <span className="font-medium">
                    {shipping > 0 ? `Rp ${shipping.toLocaleString()}` : 'Gratis'}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span style={{ color: '#c4367b' }}>Rp {total.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full mt-6 py-3 rounded-full text-white font-semibold transition-all hover:opacity-90 active:scale-95"
                style={{ backgroundColor: '#c4367b' }}
              >
                Checkout
              </button>

              <Link
                href="/products"
                className="w-full mt-2 py-2 text-center text-sm text-gray-500 hover:text-gray-700 block"
              >
                ← Lanjutkan Belanja
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}