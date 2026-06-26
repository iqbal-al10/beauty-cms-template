'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Toaster } from 'react-hot-toast'
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Images,
  Tag,
  HelpCircle,
  Settings,
  Image,
  Users,
  LogOut,
  Menu,
  Activity,
  Database,
  BarChart3,
  Video,
  Star,
  ShoppingBag,
  FolderOpen,
  Hash,
  Tags,
  User
} from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface SettingsData {
  siteName: string
}

const SUPER_ADMIN_MENUS = ['Settings', 'Users', 'Activity Log', 'Backup']

const ROLE_COLORS: Record<string, { bg: string; text: string; iconBg: string }> = {
  SUPER_ADMIN: { bg: 'bg-red-100', text: 'text-red-700', iconBg: 'bg-red-100 text-red-600' },
  ADMIN: { bg: 'bg-pink-100', text: 'text-pink-700', iconBg: 'bg-pink-100 text-pink-600' },
  EDITOR: { bg: 'bg-blue-100', text: 'text-blue-700', iconBg: 'bg-blue-100 text-blue-600' },
  STAFF: { bg: 'bg-purple-100', text: 'text-purple-700', iconBg: 'bg-purple-100 text-purple-600' },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [settings, setSettings] = useState<SettingsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetch('/api/auth/me')
        if (userRes.ok) {
          const userData = await userRes.json()
          setUser(userData)
        } else {
          router.push('/login')
          return
        }

        const settingsRes = await fetch('/api/admin/settings')
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json()
          setSettings(settingsData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      if (res.ok) {
        setTimeout(() => {
          window.location.href = '/login'
        }, 500)
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const allMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: Package, label: 'Products', href: '/admin/products' },
    { icon: ShoppingBag, label: 'Promos', href: '/admin/promos' },
    { icon: Calendar, label: 'Bookings', href: '/admin/bookings' },
    { icon: MessageSquare, label: 'Testimonials', href: '/admin/testimonials' },
    { icon: FolderTree, label: 'Categories', href: '/admin/categories' },
    { icon: FileText, label: 'Blogs', href: '/admin/blog' },
    { icon: FolderOpen, label: 'Blog Categories', href: '/admin/blog-categories' },
    { icon: Hash, label: 'Blog Tags', href: '/admin/blog-tags' },
    { icon: Tag, label: 'Tags', href: '/admin/tags' },
    { icon: Image, label: 'Media', href: '/admin/media' },
    { icon: Images, label: 'Before/After', href: '/admin/before-after' },
    { icon: Video, label: 'Videos', href: '/admin/videos' },
    { icon: Star, label: 'Reviews', href: '/admin/reviews' },
    { icon: HelpCircle, label: 'FAQ', href: '/admin/faq' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
    { icon: Users, label: 'Users', href: '/admin/users' },
    { icon: Activity, label: 'Activity Log', href: '/admin/activity-logs' },
    { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
    { icon: Database, label: 'Backup', href: '/admin/backup' },
  ]

  const menuItems = allMenuItems.filter(item => {
    if (user?.role === 'SUPER_ADMIN') return true
    return !SUPER_ADMIN_MENUS.includes(item.label)
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  const siteName = settings?.siteName || 'Beauty CMS'
  const roleColor = user?.role ? ROLE_COLORS[user.role] : ROLE_COLORS.STAFF

  // ===== FUNGSI UNTUK GET TITLE HEADER =====
  const getHeaderTitle = () => {
    if (pathname === '/admin') return 'Dashboard'
    if (pathname?.startsWith('/admin/products')) return 'Products'
    if (pathname?.startsWith('/admin/categories')) return 'Categories'
    if (pathname?.startsWith('/admin/promos')) return 'Promos'
    if (pathname?.startsWith('/admin/bookings')) return 'Bookings'
    if (pathname?.startsWith('/admin/testimonials')) return 'Testimonials'
    if (pathname === '/admin/blog') return 'Blogs'
    if (pathname?.startsWith('/admin/blog-categories')) return 'Blog Categories'
    if (pathname?.startsWith('/admin/blog-tags')) return 'Blog Tags'
    if (pathname?.startsWith('/admin/before-after')) return 'Before/After'
    if (pathname?.startsWith('/admin/tags')) return 'Tags'
    if (pathname?.startsWith('/admin/faq')) return 'FAQ'
    if (pathname?.startsWith('/admin/settings')) return 'Settings'
    if (pathname?.startsWith('/admin/media')) return 'Media'
    if (pathname?.startsWith('/admin/users')) return 'User Management'
    if (pathname?.startsWith('/admin/activity-logs')) return 'Activity Log'
    if (pathname?.startsWith('/admin/analytics')) return 'Analytics'
    if (pathname?.startsWith('/admin/backup')) return 'Backup'
    if (pathname?.startsWith('/admin/videos')) return 'Videos'
    if (pathname?.startsWith('/admin/reviews')) return 'Reviews'
    return 'Dashboard'
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <aside 
        className={`${
          sidebarOpen ? 'w-64' : 'w-16'
        } bg-white border-r border-gray-200 transition-all duration-300 shrink-0 h-full overflow-y-auto`}
      >
        <div className={`p-4 border-b border-gray-200 flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
          {sidebarOpen ? (
            <>
              <h1 className="text-xl font-bold text-pink-500">{siteName}</h1>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>
        
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            let isActive = false
            
            if (item.href === '/admin') {
              isActive = pathname === '/admin'
            } else if (item.href === '/admin/blog') {
              isActive = pathname === '/admin/blog'
            } else {
              isActive = pathname?.startsWith(item.href) || false
            }
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm ${
                  isActive 
                    ? 'bg-pink-500 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                } ${!sidebarOpen && 'justify-center'}`}
                title={!sidebarOpen ? item.label : ''}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            )
          })}
          
          <div className={`pt-4 mt-4 border-t border-gray-200 ${!sidebarOpen && 'flex justify-center'}`}>
            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm text-gray-600 hover:bg-gray-100 ${
                !sidebarOpen ? 'justify-center w-auto' : 'w-full'
              }`}
              title={!sidebarOpen ? 'Logout' : ''}
            >
              <LogOut className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 p-4 shrink-0 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            {getHeaderTitle()}
          </h2>
          
          {user && (
            <div className="flex items-center gap-3 text-sm">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${roleColor.iconBg}`}>
                <User className="w-4 h-4" />
              </div>
              <span className={`px-2 py-0.5 text-xs rounded-full ${roleColor.bg} ${roleColor.text}`}>
                {user.role}
              </span>
            </div>
          )}
        </header>
        
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>

        <footer className="bg-gray-100 border-t border-gray-200 p-3 text-center text-sm text-gray-500 shrink-0">
          &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
        </footer>
      </div>
    </div>
  )
}
