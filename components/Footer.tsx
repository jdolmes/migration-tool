'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Footer() {
  const pathname = usePathname()

  // Don't show footer on admin pages
  if (pathname.startsWith('/admin')) {
    return null
  }

  return (
    <footer className="h-10 bg-white border-t border-[#f1f5f9]">
      <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-center gap-2 text-xs text-gray-400">
        <span>&copy; 2026 SkillIndex</span>
        <span>&middot;</span>
        <Link href="/privacy-policy" className="hover:text-gray-600 transition-colors">
          Privacy Policy
        </Link>
      </div>
    </footer>
  )
}
