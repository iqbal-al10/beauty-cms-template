// /components/public/Cart.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface CartItem {
  id: string
  name: string
  slug: string
  price: number
  finalPrice: number
  quantity: number
  imageUrl: string | null
  stock: number
}

interface CartProps {
  primaryColor: string
  enableCart: boolean
}

export default function Cart({ primaryColor, enableCart }: CartProps) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  const loadCart = () => {
    try {
      const saved = localStorage.getItem('beauty_cart')
      if (saved) {
        setItems(JSON.parse(saved))
      }
    } catch (e) {
      console.error('Error loading cart:', e)
    }
  }

  useEffect(() => {
    setIsMounted(true)
    loadCart()

    const handleCartUpdate = () => {
      loadCart()
    }

    window.addEventListener('cartUpdate', handleCartUpdate)
    return () => {
      window.removeEventListener('cartUpdate', handleCartUpdate)
    }
  }, [])

  const saveCart = (newItems: CartItem[]) => {
    setItems(newItems)
    try {
      localStorage.setItem('beauty_cart', JSON.stringify(newItems))
    } catch (e) {
      console.error('Error saving cart:', e)
    }
  }

  const removeFromCart = (id: string) => {
    const newItems = items.filter(item => item.id !== id)
    saveCart(newItems)
    toast.success('Produk dihapus dari keranjang')
  }

  const updateQuantity = (id: string, newQuantity: number) => {
    const item = items.find(i => i.id === id)
    if (!item) return

    if (newQuantity < 1) {
      removeFromCart(id)
      return
    }

    if (newQuantity > item.stock) {
      toast.error(`Stok tidak mencukupi (tersisa ${item.stock} unit)`)
      return
    }

    const newItems = items.map(i =>
      i.id === id ? { ...i, quantity: newQuantity } : i
    )
    saveCart(newItems)
  }

  const getTotalPrice = () => {
    return items.reduce((sum, item) => sum + (item.finalPrice || item.price) * item.quantity, 0)
  }

  const getTotalItems = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0)
  }

  const clearCart = () => {
    if (!confirm('Yakin ingin mengosongkan keranjang?')) return
    saveCart([])
    toast.success('Keranjang dikosongkan')
  }

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Keranjang kosong')
      return
    }
    localStorage.setItem('beauty_cart_checkout', JSON.stringify(items))
    window.location.href = '/checkout'
  }

  if (!isMounted || !enableCart) return null

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Keranjang"
      >
        <ShoppingCart className="w-5 h-5 text-gray-700" />
        {items.length > 0 && (
          <span
            className="absolute -top-1 -right-1 text-[10px] font-bold text-white rounded-full w-5 h-5 flex items-center justify-center"
            style={{ backgroundColor: primaryColor }}
          >
            {getTotalItems()}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-[999]"
            onClick={() => setIsOpen(false)}
          />
          
          <div
            className="fixed right-0 top-0 h-screen w-[420px] max-w-[90vw] bg-white shadow-2xl z-[1000] flex flex-col"
            style={{ height: '100vh' }}
          >
            <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200 flex-shrink-0 bg-white">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" style={{ color: primaryColor }} />
                Keranjang ({items.length})
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <ShoppingCart className="w-16 h-16 mx-auto text-gray-300" />
                  <p className="text-gray-500 mt-4 font-medium">Keranjang kosong</p>
                  <p className="text-sm text-gray-400">Belum ada produk di keranjang</p>
                  <Link
                    href="/products"
                    className="inline-block mt-4 px-6 py-2 rounded-lg text-white text-sm font-medium transition-colors hover:opacity-90"
                    style={{ backgroundColor: primaryColor }}
                    onClick={() => setIsOpen(false)}
                  >
                    Mulai Belanja
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-2xl">🧴</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">
                        {item.name}
                      </p>
                      <p className="text-pink-500 font-semibold text-sm">
                        Rp {(item.finalPrice || item.price).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-200 transition-colors"
                      >
                        <Minus className="w-3 h-3 text-gray-600" />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-200 transition-colors"
                      >
                        <Plus className="w-3 h-3 text-gray-600" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-gray-200 px-5 py-4 flex-shrink-0 bg-white">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-gray-800">Total</span>
                  <span className="text-xl font-bold" style={{ color: primaryColor }}>
                    Rp {getTotalPrice().toLocaleString()}
                  </span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={clearCart}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Kosongkan
                  </button>
                  <button
                    onClick={handleCheckout}
                    className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90 hover:shadow-lg"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Checkout
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}
