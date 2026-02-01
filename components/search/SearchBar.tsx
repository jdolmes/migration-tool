'use client'

import { Search } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  return (
    <div className="relative w-full max-w-2xl">
      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full pl-14 pr-5 py-4 bg-white border-0 rounded-full
                   shadow-lg shadow-blue-900/20
                   focus:ring-4 focus:ring-white/30 focus:outline-none
                   text-lg text-gray-900 placeholder-gray-400"
        placeholder={placeholder || "Search by occupation code or name..."}
      />
    </div>
  )
}
