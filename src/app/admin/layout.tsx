'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Toaster } from 'react-hot-toast'
import { 
  LayoutDashboard, 
  Package, 
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
  User,
  Contact,
  ExternalLink,
  CreditCard
} from 'lucide-react'

interface UserData {
  id: string
  name: string
  email: string
  role: string
}

interface SettingsData {
  siteName: string
  colorPrimary: string
}

const SUPER_ADMIN_ONLY_MENUS = ['Settings', 'Users', 'Activity Log', 'Backup']
const ADMIN_MENUS = ['Payments']

const ROLE_COLORS: Record<string, { bg: string; text: string; iconBg: string }> = {
  SUPER_ADMIN: { bg: 'bg-red-100', text: 'text-red-700', iconBg: 'bg-red-100 text-red-600' },
  ADMIN: { bg: 'bg-[#c4367b]/10', text: 'text-[#c4367b]', iconBg: 'bg-[#c4367b]/10 text-[#c4367b]' },
  EDITOR: { bg: 'bg-blue-100', text: 'text-blue-700', iconBg: 'bg-blue-100 text-blue-600' },
  STAFF: { bg: 'bg-purple-100', text: 'text-purple-700', iconBg: 'bg-purple-100 text-purple-600' },
}

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: '🛡️ Super Admin',
  ADMIN: '⚙️ Admin',
  EDITOR: '✍️ Editor',
  STAFF: '👤 Staff',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [user, setUser] = useState<UserData | null>(null)
  const [settings, setSettings] = useState<SettingsData | null>(null)
  const [loading, setLoading] = useState(true)

  const primaryColor = '#c4367b'
  const primaryHover = '#e20373'

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
    { icon: Calendar, label: 'Bookings', href: '/admin/bookings' },
    { icon: Star, label: 'Reviews', href: '/admin/reviews' },
    { icon: FileText, label: 'Blog', href: '/admin/blog' },
    { icon: MessageSquare, label: 'Testimonials', href: '/admin/testimonials' },
    { icon: Image, label: 'Media', href: '/admin/media' },
    { icon: Video, label: 'Videos', href: '/admin/videos' },
    { icon: Contact, label: 'Contact Messages', href: '/admin/contact-messages' },
    { icon: HelpCircle, label: 'FAQ', href: '/admin/faq' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
    { icon: Users, label: 'Users', href: '/admin/users' },
    { icon: Activity, label: 'Activity Log', href: '/admin/activity-logs' },
    { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
    { icon: Database, label: 'Backup', href: '/admin/backup' },
    { icon: CreditCard, label: 'Payments', href: '/admin/payments' },
  ]

  const menuItems = allMenuItems.filter((item) => {
    if (user?.role === 'SUPER_ADMIN') return true
    if (user?.role === 'ADMIN') return !SUPER_ADMIN_ONLY_MENUS.includes(item.label)
    if (user?.role === 'EDITOR' || user?.role === 'STAFF') {
      return !SUPER_ADMIN_ONLY_MENUS.includes(item.label) && !ADMIN_MENUS.includes(item.label)
    }
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: primaryColor }}></div>
      </div>
    )
  }

  const siteName = settings?.siteName || 'Beauty CMS'
  const roleColor = user?.role ? ROLE_COLORS[user.role] : ROLE_COLORS.STAFF
  const roleLabel = user?.role ? ROLE_LABELS[user.role] : 'Staff'

  const getHeaderTitle = () => {
    if (pathname === '/admin') return 'Dashboard'
    if (pathname?.startsWith('/admin/products')) return 'Products'
    if (pathname?.startsWith('/admin/bookings')) return 'Bookings'
    if (pathname?.startsWith('/admin/testimonials')) return 'Testimonials'
    if (pathname?.startsWith('/admin/blog')) return 'Blog'
    if (pathname?.startsWith('/admin/faq')) return 'FAQ'
    if (pathname?.startsWith('/admin/settings')) return 'Settings'
    if (pathname?.startsWith('/admin/media')) return 'Media'
    if (pathname?.startsWith('/admin/users')) return 'User Management'
    if (pathname?.startsWith('/admin/activity-logs')) return 'Activity Log'
    if (pathname?.startsWith('/admin/analytics')) return 'Analytics'
    if (pathname?.startsWith('/admin/backup')) return 'Backup'
    if (pathname?.startsWith('/admin/videos')) return 'Videos'
    if (pathname?.startsWith('/admin/reviews')) return 'Reviews'
    if (pathname?.startsWith('/admin/contact-messages')) return 'Contact Messages'
    if (pathname?.startsWith('/admin/payments')) return 'Payments'
    return 'Dashboard'
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <style>{`
        :root {
          --color-primary: ${primaryColor};
          --color-primary-hover: ${primaryHover};
        }
      `}</style>

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
        <div className={`p-4.5 border-b border-gray-200 flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
          {sidebarOpen ? (
            <>
              <h1 className="text-xl font-bold" style={{ color: primaryColor }}>{siteName}</h1>
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
              isActive = pathname?.startsWith('/admin/blog') || false
            } else {
              isActive = pathname?.startsWith(item.href) || false
            }
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm ${
                  isActive 
                    ? 'text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                } ${!sidebarOpen && 'justify-center'}`}
                style={isActive ? { backgroundColor: primaryColor } : {}}
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
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-800">
              {getHeaderTitle()}
            </h2>
            {user && (
              <span className={`px-2 py-0.5 text-xs rounded-full ${roleColor.bg} ${roleColor.text}`}>
                {roleLabel}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100"
              style={{ color: primaryColor }}
            >
              <ExternalLink className="w-4 h-4" />
              View Site
            </Link>
            
            {user && (
              <div className="flex items-center gap-3 text-sm">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${roleColor.iconBg}`}>
                  <User className="w-4 h-4" />
                </div>
              </div>
            )}
          </div>
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
