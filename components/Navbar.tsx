'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavLink {
  href: string
  label: string
  comingSoon?: boolean
}

const navLinks: NavLink[] = [
  { href: '/', label: 'Occupation Search' },
  { href: '/migration-news', label: 'Migration News', comingSoon: true },
  { href: '/points-calculator', label: 'Points Calculator', comingSoon: true },
  { href: '/visas', label: 'Visas', comingSoon: true },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="h-[60px] bg-white border-b border-[#f1f5f9] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-[800] text-gray-900">
            Sk<span className="text-orange-500">ill</span>Index
          </span>
          <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
            Beta
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 text-sm transition-colors ${
                  isActive
                    ? 'text-gray-900 font-semibold'
                    : 'text-gray-500 hover:text-gray-700 font-medium'
                }`}
              >
                {link.label}
                {link.comingSoon && (
                  <span className="text-[10px] text-gray-400 uppercase font-medium">
                    Soon
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
