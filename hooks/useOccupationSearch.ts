import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Occupation {
  code: string
  catalogue_version: string
  principal_title: string
  skill_level: number | null
}

interface GroupedOccupation {
  code: string
  principal_title: string
  skill_level: number | null
  catalogues: string[]
}

export function useOccupationSearch(searchTerm: string) {
  const [results, setResults] = useState<GroupedOccupation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setResults([])
      return
    }

    const search = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const { data, error } = await supabase
          .from('occupations')
          .select('code, catalogue_version, principal_title, skill_level')
          .or(`principal_title.ilike.%${searchTerm}%,code.eq.${searchTerm}`)
          .neq('catalogue_version', 'OSCA')
          .order('code')
          .order('catalogue_version')
          .limit(40)

        if (error) throw error

        // Group by code - if same code exists in multiple catalogues, combine them
        const grouped: { [key: string]: GroupedOccupation } = {}

        data?.forEach(occ => {
          if (!grouped[occ.code]) {
            grouped[occ.code] = {
              code: occ.code,
              principal_title: occ.principal_title,
              skill_level: occ.skill_level,
              catalogues: [occ.catalogue_version]
            }
          } else {
            // Same code exists in multiple catalogues
            if (!grouped[occ.code].catalogues.includes(occ.catalogue_version)) {
              grouped[occ.code].catalogues.push(occ.catalogue_version)
            }
          }
        })

        const resultArray = Object.values(grouped)
        setResults(resultArray)
      } catch (err: any) {
        setError(err.message)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    const timeoutId = setTimeout(search, 300)
    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  return { results, isLoading, error }
}
