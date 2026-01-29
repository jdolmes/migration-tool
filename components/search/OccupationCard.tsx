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
      className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 
                 hover:shadow-md transition-all cursor-pointer bg-white"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-lg font-bold text-gray-900">
              {code}: {title}
            </h3>
            {catalogues.sort().map(cat => (
              <span 
                key={cat} 
                className={`px-2 py-1 rounded text-xs font-semibold ${getCatalogueBadgeColor(cat)}`}
              >
                {cat.toUpperCase()}
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Skill Level: {skillLevel || 'N/A'}
          </p>
        </div>
        <div className="text-blue-500 text-sm font-medium whitespace-nowrap ml-4">
          View Details →
        </div>
      </div>
    </div>
  )
}
