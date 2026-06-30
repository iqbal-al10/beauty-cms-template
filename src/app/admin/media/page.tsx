'use client'

import { useEffect, useState, useRef } from 'react'
import { Upload, Trash2, Copy, FolderPlus, Search, X, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

interface MediaFile {
  id: string
  url: string
  fileName: string
  fileType: string
  sizeBytes: number
  folder: string | null
  uploadedAt: string
}

export default function MediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [folders, setFolders] = useState<string[]>([])
  const [customFolders, setCustomFolders] = useState<string[]>([])
  const [newFolder, setNewFolder] = useState('')
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [copySuccess, setCopySuccess] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedFolderForUpload, setSelectedFolderForUpload] = useState('')
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchFiles = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)

      const res = await fetch(`/api/admin/media?${params}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setFiles(data || [])
    } catch (error) {
      console.error('Error fetching files:', error)
      toast.error('Gagal memuat file')
      setFiles([])
    } finally {
      setLoading(false)
    }
  }

  const fetchFolders = async () => {
    try {
      const res = await fetch('/api/admin/media/folders')
      if (!res.ok) throw new Error('Failed to fetch folders')
      const data = await res.json()
      console.log('📁 Folders from API:', data)
      setFolders(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching folders:', error)
      setFolders([])
    }
  }

  // Load custom folders from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('beauty_custom_folders')
      if (saved) {
        setCustomFolders(JSON.parse(saved))
      }
    } catch (e) {
      console.error('Error loading custom folders:', e)
    }
  }, [])

  // Save custom folders to localStorage
  const saveCustomFolders = (folders: string[]) => {
    setCustomFolders(folders)
    localStorage.setItem('beauty_custom_folders', JSON.stringify(folders))
  }

  useEffect(() => {
    fetchFiles()
    fetchFolders()
  }, [search])

  const handleCreateFolder = async () => {
    if (!newFolder.trim()) {
      toast.error('Nama folder harus diisi')
      return
    }

    // Tambahkan ke custom folders (virtual)
    if (!customFolders.includes(newFolder.trim())) {
      saveCustomFolders([...customFolders, newFolder.trim()])
    }

    // Coba simpan ke API juga
    try {
      await fetch('/api/admin/media/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolder.trim() }),
      })
    } catch (error) {
      console.error('Error saving folder to API:', error)
    }

    toast.success(`Folder "${newFolder}" berhasil dibuat!`)
    setNewFolder('')
    setShowNewFolder(false)
    await fetchFolders()
  }

  const handleDeleteFolder = async (folderName: string) => {
    if (!confirm(`Yakin ingin menghapus folder "${folderName}" dan semua isinya?`)) return

    // Hapus dari custom folders
    saveCustomFolders(customFolders.filter(f => f !== folderName))

    try {
      await fetch(`/api/admin/media/folders?name=${encodeURIComponent(folderName)}`, {
        method: 'DELETE',
      })
    } catch (error) {
      console.error('Error deleting folder from API:', error)
    }

    toast.success(`Folder "${folderName}" berhasil dihapus!`)
    await fetchFolders()
    await fetchFiles()
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Hanya gambar yang diizinkan')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    if (selectedFolderForUpload) formData.append('folder', selectedFolderForUpload)

    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        toast.success(`File berhasil diupload ke folder "${selectedFolderForUpload || 'root'}"!`)
        setShowUploadModal(false)
        setSelectedFolderForUpload('')
        await fetchFiles()
        await fetchFolders()
        if (fileInputRef.current) fileInputRef.current.value = ''
      } else {
        const error = await res.json()
        toast.error(error.error || 'Upload gagal')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error('Upload gagal')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string, fileName: string) => {
    if (!confirm(`Yakin ingin menghapus "${fileName}"?`)) return

    try {
      const res = await fetch(`/api/admin/media/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success(`"${fileName}" berhasil dihapus!`)
        setFiles(files.filter(f => f.id !== id))
        await fetchFolders()
      } else {
        toast.error('Gagal menghapus file')
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      toast.error('Error saat menghapus file')
    }
  }

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopySuccess('URL disalin!')
    setTimeout(() => setCopySuccess(''), 2000)
  }

  const handlePreview = (url: string) => {
    setPreviewImage(url)
    setShowPreviewModal(true)
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
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

  // Group files by folder
  const groupedFiles = files.reduce((acc, file) => {
    const key = file.folder || 'root'
    if (!acc[key]) acc[key] = []
    acc[key].push(file)
    return acc
  }, {} as Record<string, MediaFile[]>)

  const folderKeys = Object.keys(groupedFiles).sort()

  // Gabungkan semua folder: dari API + dari files + custom folders
  const allFolders = [...new Set([...folders, ...folderKeys.filter(k => k !== 'root'), ...customFolders])].sort()

  console.log('📁 All folders:', allFolders)
  console.log('📁 Folder keys from files:', folderKeys)
  console.log('📁 Folders from API:', folders)
  console.log('📁 Custom folders:', customFolders)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Media Manager</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowNewFolder(!showNewFolder)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FolderPlus className="w-5 h-5" />
            New Folder
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            disabled={uploading}
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            <Upload className="w-5 h-5" />
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
        </div>
      </div>

      {showNewFolder && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nama folder (contoh: produk)"
              value={newFolder}
              onChange={(e) => setNewFolder(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
            />
            <button
              onClick={handleCreateFolder}
              className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg"
            >
              Create
            </button>
            <button
              onClick={() => {
                setShowNewFolder(false)
                setNewFolder('')
              }}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Upload File</h2>
              <button
                onClick={() => {
                  setShowUploadModal(false)
                  setSelectedFolderForUpload('')
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pilih Folder Tujuan *
                </label>
                <select
                  value={selectedFolderForUpload}
                  onChange={(e) => setSelectedFolderForUpload(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                >
                  <option value="">-- Pilih Folder --</option>
                  {allFolders.length > 0 ? (
                    allFolders.map((f) => (
                      <option key={f} value={f}>📁 {f}</option>
                    ))
                  ) : (
                    <option value="" disabled>Belum ada folder</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pilih File *
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Format: JPEG, PNG, WebP, GIF, SVG | Maks: 5MB
                </p>
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={!selectedFolderForUpload || uploading}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload Sekarang'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPreviewModal && previewImage && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 cursor-pointer"
          onClick={() => {
            setShowPreviewModal(false)
            setPreviewImage(null)
          }}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onError={(e) => {
                e.currentTarget.src = '/placeholder-image.jpg'
              }}
            />
            <button
              className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70"
              onClick={(e) => {
                e.stopPropagation()
                setShowPreviewModal(false)
                setPreviewImage(null)
              }}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari file..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
          />
        </div>
        {copySuccess && (
          <span className="text-green-500 text-sm mt-2 inline-block">{copySuccess}</span>
        )}
      </div>

      {allFolders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-500">
          <p className="text-lg font-medium">Belum ada folder</p>
          <p className="text-sm">Buat folder atau upload gambar untuk memulai</p>
        </div>
      ) : (
        <div className="space-y-8">
          {allFolders.map((folderName) => {
            const folderFiles = groupedFiles[folderName] || []
            const displayName = folderName === 'root' ? '📂 Root' : `📁 ${folderName}`

            return (
              <div key={folderName} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">{displayName}</h2>
                  <div className="flex gap-2">
                    <span className="text-sm text-gray-500">{folderFiles.length} files</span>
                    {folderName !== 'root' && (
                      <button
                        onClick={() => handleDeleteFolder(folderName)}
                        className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Hapus Folder
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  {folderFiles.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400 text-sm">Folder kosong</p>
                      <button
                        onClick={() => {
                          setSelectedFolderForUpload(folderName)
                          setShowUploadModal(true)
                        }}
                        className="mt-2 text-sm text-pink-500 hover:text-pink-600"
                      >
                        Upload file ke folder ini
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {folderFiles.map((file) => (
                        <div
                          key={file.id}
                          className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
                        >
                          <div 
                            className="aspect-square bg-gray-100 relative cursor-pointer"
                            onClick={() => handlePreview(file.url)}
                          >
                            <img
                              src={file.url}
                              alt={file.fileName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder-image.jpg'
                              }}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                              <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>

                          <div className="p-2">
                            <p className="text-xs font-medium text-gray-800 truncate" title={file.fileName}>
                              {file.fileName}
                            </p>
                            <p className="text-xs text-gray-500">{formatSize(file.sizeBytes)}</p>
                            <p className="text-xs text-gray-400 mt-1">{formatDate(file.uploadedAt)}</p>
                          </div>

                          <div className="flex border-t border-gray-100">
                            <button
                              onClick={() => handleCopy(file.url)}
                              className="flex-1 p-2 text-gray-500 hover:text-pink-500 hover:bg-pink-50 transition-colors"
                              title="Copy URL"
                            >
                              <Copy className="w-4 h-4 mx-auto" />
                            </button>
                            <button
                              onClick={() => handleDelete(file.id, file.fileName)}
                              className="flex-1 p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 mx-auto" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
      
      <div className="mt-6 text-sm text-gray-500">
        Total: <span className="font-medium text-gray-700">{files.length}</span> file
      </div>
    </div>
  )
}
