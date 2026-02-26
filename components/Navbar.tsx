'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false)
      }
    }

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [mobileMenuOpen])

  // Close menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  return (
    <nav className="bg-white border-b border-[#f1f5f9] sticky top-0 z-50" ref={menuRef}>
      <div className="max-w-6xl mx-auto px-6 h-[60px] flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/skillindex-logo.png"
            alt="SkillIndex"
            height={32}
            width={120}
            className="h-8 w-auto"
            priority
          />
          <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
            Beta
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
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

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 bg-gray-600 transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-gray-600 transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-gray-600 transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#f1f5f9] bg-white">
          <div className="px-6 py-4 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center justify-between py-3 px-4 rounded-lg transition-colors ${
                    isActive
                      ? 'text-gray-900 font-semibold bg-gray-50'
                      : 'text-gray-600 hover:bg-gray-50 font-medium'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
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
      )}
    </nav>
  )
}
