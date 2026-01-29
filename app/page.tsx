'use client'

import { useState } from 'react'
import SearchBar from '@/components/search/SearchBar'
import OccupationCard from '@/components/search/OccupationCard'
import { useOccupationSearch } from '@/hooks/useOccupationSearch'

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('')
  const { results, isLoading, error } = useOccupationSearch(searchTerm)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Australian Migration Tool
          </h1>
          <p className="text-gray-600">
            Search occupations and discover your visa options
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by occupation code (e.g., 261313) or name (e.g., software engineer)..."
        />

        <div className="mt-6">
          {searchTerm.length > 0 && searchTerm.length < 2 && (
            <p className="text-gray-500 text-center py-8">
              Type at least 2 characters to search...
            </p>
          )}

          {isLoading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-600">Searching...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">Error: {error}</p>
            </div>
          )}

          {!isLoading && !error && results.length === 0 && searchTerm.length >= 2 && (
            <div className="text-center py-8">
              <p className="text-gray-600">No occupations found</p>
              <p className="text-sm text-gray-500 mt-2">
                Try searching by code (e.g., 261313) or occupation name
              </p>
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <>
              <div className="mb-4 text-sm text-gray-600">
                Found {results.length} occupation{results.length !== 1 ? 's' : ''}
              </div>
              <div className="space-y-3">
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
      </div>
    </main>
  )
}
