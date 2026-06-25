'use client'

import { useState } from 'react'
import { Download, Database, Shield } from 'lucide-react'

export default function BackupPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleExport = async () => {
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/backup')
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Export failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `beauty-cms-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      setMessage('✅ Backup downloaded successfully!')
    } catch (error: any) {
      setMessage(`❌ ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Backup & Export</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <Database className="w-12 h-12 text-pink-500" />
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Export Database</h2>
            <p className="text-gray-500 text-sm">
              Download all data as JSON file. This includes all tables and records.
            </p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-700">
              <p className="font-semibold">Security Notice</p>
              <p>Only Super Admin can export data. The backup file contains all your website data.</p>
            </div>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-lg mb-4 ${
            message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message}
          </div>
        )}

        <button
          onClick={handleExport}
          disabled={loading}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
        >
          <Download className="w-5 h-5" />
          {loading ? 'Exporting...' : 'Export Database'}
        </button>

        <p className="text-xs text-gray-400 mt-4 text-center">
          Exports all data including: Settings, Users, Products, Bookings, Blog, FAQs, and more.
        </p>
      </div>
    </div>
  )
}
