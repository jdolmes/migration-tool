'use client'

import { useState } from 'react'
import { Compass, FileCheck, Globe } from 'lucide-react'
import SearchBar from '@/components/search/SearchBar'
import OccupationCard from '@/components/search/OccupationCard'
import { useOccupationSearch } from '@/hooks/useOccupationSearch'

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('')
  const { results, isLoading, error } = useOccupationSearch(searchTerm)

  const hasSearched = searchTerm.length >= 2

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Find Your Path to Australia
          </h1>
          <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Search skilled occupations and discover which visas you may be eligible for
          </p>

          <div className="flex justify-center">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by occupation code or name..."
            />
          </div>

          <p className="text-blue-200 text-sm mt-4">
            Try: 261313, software engineer, accountant, nurse
          </p>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {searchTerm.length > 0 && searchTerm.length < 2 && (
          <p className="text-gray-500 text-center py-8">
            Type at least 2 characters to search...
          </p>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Searching occupations...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-800">Error: {error}</p>
          </div>
        )}

        {!isLoading && !error && results.length === 0 && hasSearched && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">?</div>
            <p className="text-gray-700 font-medium text-lg">No occupations found</p>
            <p className="text-gray-500 mt-2">
              Try a different ANZSCO code or occupation name
            </p>
          </div>
        )}

        {!isLoading && results.length > 0 && (
          <>
            <div className="mb-6 flex items-center justify-between">
              <span className="text-gray-600">
                Found <span className="font-semibold text-gray-900">{results.length}</span> occupation{results.length !== 1 ? 's' : ''}
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

        {/* Feature Cards - Show when no search */}
        {!hasSearched && !isLoading && (
          <div className="grid md:grid-cols-3 gap-6 mt-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Compass className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Explore Occupations</h3>
              <p className="text-gray-600 text-sm">
                Browse ANZSCO codes and find occupations that match your skills and experience.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <FileCheck className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Check Visa Eligibility</h3>
              <p className="text-gray-600 text-sm">
                See which skilled visas your occupation qualifies for, including 189, 190, 482 and more.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Skilled Occupation Lists</h3>
              <p className="text-gray-600 text-sm">
                View list memberships including MLTSSL, STSOL, ROL, and the new CSOL.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
