'use client'

import { useEffect, useState } from 'react'
import { Mail, Phone, User, MessageSquare, CheckCircle, XCircle, Trash2, ExternalLink } from 'lucide-react'

interface ContactMessage {
  id: string
  name: string
  email: string
  whatsapp: string | null
  message: string
  status: string
  createdAt: string
}

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)

  useEffect(() => {
    fetchMessages()
  }, [filterStatus])

  const fetchMessages = async () => {
    try {
      const params = new URLSearchParams()
      if (filterStatus !== 'ALL') params.append('status', filterStatus)

      const res = await fetch(`/api/admin/contact-messages?${params}`)
      const data = await res.json()
      setMessages(data)
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/contact-messages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (res.ok) {
        fetchMessages()
        if (selectedMessage?.id === id) {
          setSelectedMessage({ ...selectedMessage, status })
        }
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus pesan ini?')) return
    try {
      await fetch(`/api/admin/contact-messages/${id}`, { method: 'DELETE' })
      fetchMessages()
      if (selectedMessage?.id === id) setSelectedMessage(null)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      NEW: 'bg-yellow-100 text-yellow-700',
      REPLIED: 'bg-green-100 text-green-700',
      CLOSED: 'bg-gray-100 text-gray-700',
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      NEW: '🆕 New',
      REPLIED: '✅ Replied',
      CLOSED: '📭 Closed',
    }
    return labels[status] || status
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Contact Messages</h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap gap-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
        >
          <option value="ALL">All Status</option>
          <option value="NEW">🆕 New</option>
          <option value="REPLIED">✅ Replied</option>
          <option value="CLOSED">📭 Closed</option>
        </select>
        <button
          onClick={() => setFilterStatus('ALL')}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
        >
          Clear
        </button>
        <span className="text-sm text-gray-500 flex items-center">
          Total: {messages.length} messages
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List Messages */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {messages.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Mail className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p>No messages found</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedMessage?.id === message.id ? 'bg-pink-50' : ''
                  }`}
                  onClick={() => setSelectedMessage(message)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">{message.name}</p>
                      <p className="text-sm text-gray-500">{message.email}</p>
                      <p className="text-sm text-gray-400 line-clamp-1">{message.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(message.createdAt)}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(message.status)}`}>
                      {getStatusLabel(message.status)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {selectedMessage ? (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Message Detail</h3>

              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{selectedMessage.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p>{selectedMessage.email}</p>
                  </div>
                </div>

                {selectedMessage.whatsapp && (
                  <div className="flex items-start gap-2">
                    <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">WhatsApp</p>
                      <p>{selectedMessage.whatsapp}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2">
                  <MessageSquare className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Message</p>
                    <p className="bg-gray-50 p-3 rounded-lg text-sm whitespace-pre-wrap">
                      {selectedMessage.message}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">Status</p>
                  <div className="flex flex-wrap gap-2">
                    {['REPLIED', 'CLOSED'].map((status) => (
                      <button
                        key={status}
                        onClick={() => updateStatus(selectedMessage.id, status)}
                        className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                          selectedMessage.status === status
                            ? 'bg-pink-500 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        {status === 'REPLIED' ? '✅ Mark Replied' : '📭 Mark Closed'}
                      </button>
                    ))}
                    {selectedMessage.status !== 'NEW' && (
                      <button
                        onClick={() => updateStatus(selectedMessage.id, 'NEW')}
                        className="px-3 py-1 text-sm rounded-lg bg-yellow-100 hover:bg-yellow-200 text-yellow-700"
                      >
                        🔄 Reset to New
                      </button>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 flex flex-wrap gap-2">
                  {selectedMessage.whatsapp && (
                    <a
                      href={`https://wa.me/${selectedMessage.whatsapp.replace(/[^0-9]/g, '')}?text=Halo ${selectedMessage.name}, terima kasih sudah menghubungi kami. Kami akan segera merespon pesan Anda: ${selectedMessage.message.substring(0, 100)}...`}
                      target="_blank"
                      className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      Reply via WhatsApp
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>

                <div className="text-xs text-gray-400">
                  Received: {formatDate(selectedMessage.createdAt)}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Mail className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p>Select a message to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
