'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users, Settings, LogOut, LayoutDashboard, Newspaper } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/admin/logout', {
        method: 'POST',
      })

      if (response.ok) {
        router.push('/admin/login')
        router.refresh()
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  RMA Dashboard
                </h1>
                <p className="text-xs text-gray-500">
                  Australian Migration Hub
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-6">
              <Link
                href="/admin/leads"
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <Users className="w-4 h-4" />
                <span className="font-medium">Leads</span>
              </Link>

              <Link
                href="/admin/news"
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <Newspaper className="w-4 h-4" />
                <span className="font-medium">News</span>
              </Link>

              <Link
                href="/admin/settings"
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span className="font-medium">Settings</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium">Logout</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-xs text-gray-500 text-center">
            RMA Dashboard © 2026 Australian Migration Hub. For authorized RMAs
            only.
          </p>
        </div>
      </footer>
    </div>
  )
}
