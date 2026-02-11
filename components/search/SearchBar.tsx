'use client'

import { Search } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full pl-14 pr-5 py-4 bg-white border-2 border-gray-200 rounded-full
                   shadow-xl shadow-gray-200/50
                   focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none
                   transition-all
                   text-lg text-gray-900 placeholder-gray-400"
        placeholder={placeholder || "Search by occupation code or name..."}
      />
    </div>
  )
}
