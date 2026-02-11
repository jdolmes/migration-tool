'use client'

import { useState } from 'react'
import SearchBar from '@/components/search/SearchBar'
import OccupationCard from '@/components/search/OccupationCard'
import { useOccupationSearch } from '@/hooks/useOccupationSearch'

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('')
  const { results, isLoading, error } = useOccupationSearch(searchTerm)

  const hasSearched = searchTerm.length >= 2

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section - Simple & Centered */}
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <div className="text-center space-y-8">
          {/* Elegant Typography */}
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 tracking-tight leading-tight">
            Find Your Path
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              to Australia
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-500 max-w-2xl mx-auto font-light leading-relaxed">
            Search skilled occupations and discover your visa eligibility
          </p>

          {/* Search Bar */}
          <div className="pt-8">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by occupation code or name..."
            />
          </div>

          {/* Subtle hint */}
          <p className="text-sm text-gray-400 font-medium">
            Try: 261313, software engineer, accountant, nurse
          </p>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        {searchTerm.length > 0 && searchTerm.length < 2 && (
          <p className="text-gray-400 text-center py-12 text-lg">
            Type at least 2 characters to search...
          </p>
        )}

        {isLoading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
            <p className="mt-6 text-gray-500 text-lg font-medium">Searching...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
            <p className="text-red-600 font-semibold text-lg">Error: {error}</p>
          </div>
        )}

        {!isLoading && !error && results.length === 0 && hasSearched && (
          <div className="text-center py-16">
            <div className="text-gray-200 text-7xl mb-6 font-bold">?</div>
            <p className="text-gray-700 font-semibold text-xl mb-3">No occupations found</p>
            <p className="text-gray-400 text-lg">
              Try a different search term
            </p>
          </div>
        )}

        {!isLoading && results.length > 0 && (
          <>
            <div className="mb-8 flex items-center justify-between border-b border-gray-100 pb-4">
              <span className="text-gray-500 text-base">
                Found <span className="font-bold text-gray-900 text-lg">{results.length}</span> {results.length === 1 ? 'occupation' : 'occupations'}
              </span>
            </div>
            <div className="space-y-4">
              {results.map((occ) => (
                <OccupationCard
                  key={occ.code}
                  code={occ.code}
                  title={occ.principal_title}
                  skillLevel={occ.skill_level}
                  catalogues={occ.catalogues}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
