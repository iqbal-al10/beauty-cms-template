'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const primaryColor = '#c4367b'
  const buttonHoverColor = '#e20373'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Login berhasil!')
        router.push('/admin')
        router.refresh()
      } else {
        toast.error(data.error || 'Login gagal')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: '#f5dbe8' }}
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        <div className="text-center mb-8">
          <h1 
            className="text-3xl font-bold"
            style={{ color: primaryColor }}
          >
            Beauty CMS
          </h1>
          <p className="text-gray-500 mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-colors"
              style={{ 
                borderColor: '#e5e7eb',
                '--tw-ring-color': primaryColor,
              } as React.CSSProperties}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = primaryColor
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb'
              }}
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-colors"
              style={{ 
                borderColor: '#e5e7eb',
                '--tw-ring-color': primaryColor,
              } as React.CSSProperties}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = primaryColor
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb'
              }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-white font-semibold transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: primaryColor }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = buttonHoverColor
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = primaryColor
            }}
          >
            {loading ? 'Loading...' : 'Sign In'}
          </button>

          <div className="text-center mt-4">
            <Link
              href="/forgot-password"
              className="text-sm hover:underline"
              style={{ color: primaryColor }}
            >
              Forgot password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
