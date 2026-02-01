'use client'

import { useRouter } from 'next/navigation'

interface OccupationCardProps {
  code: string
  title: string
  skillLevel: number | null
  catalogues: string[]
}

export default function OccupationCard({
  code,
  title,
  skillLevel,
  catalogues
}: OccupationCardProps) {
  const router = useRouter()

  const getCatalogueBadgeColor = (version: string) => {
    switch (version) {
      case 'v1.3':
        return 'bg-cyan-100 text-cyan-800'
      case 'v2022':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div
      onClick={() => router.push(`/occupation/${code}`)}
      className="group bg-white rounded-xl p-5 shadow-sm border border-gray-100
                 hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-blue-600 text-white font-bold px-3 py-1 rounded-lg text-sm">
              {code}
            </span>
            <div className="flex items-center gap-1.5">
              {catalogues.sort().map(cat => (
                <span
                  key={cat}
                  className={`px-2 py-0.5 rounded text-xs font-medium ${getCatalogueBadgeColor(cat)}`}
                >
                  {cat.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {title}
          </h3>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-sm text-gray-500">
              <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-700">
                {skillLevel || '?'}
              </span>
              Skill Level
            </span>
          </div>
        </div>
        <div className="text-blue-600 font-medium pl-4 group-hover:translate-x-1 transition-transform">
          <span className="hidden sm:inline">View Details </span>
          <span className="text-xl">→</span>
        </div>
      </div>
    </div>
  )
}
