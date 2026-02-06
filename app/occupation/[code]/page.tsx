'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, ExternalLink, Info, X } from 'lucide-react'

interface Occupation {
  code: string
  catalogue_version: string
  principal_title: string
  skill_level: number | null
  alternative_titles: string[] | null
  specialisations: string[] | null
  major_group: string | null
  major_group_title: string | null
  sub_major_group: string | null
  sub_major_group_title: string | null
  minor_group: string | null
  minor_group_title: string | null
  unit_group: string | null
  unit_group_title: string | null
  description: string | null
  tasks: string[] | null
}

interface VisaOption {
  visa_id: number
  anzsco_code: string
  catalogue_version: string
  is_eligible: boolean
  eligibility_reason: string
  applicable_lists: string[] | null
  visa: {
    subclass: string
    visa_name: string
    stream: string | null
    category: string
    catalogue_version: string
    legislative_instrument: string | null
  }
}

interface ListMembership {
  v13: { MLTSSL: boolean; STSOL: boolean; ROL: boolean }
  v2022: { CSOL: boolean }
}

export default function OccupationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string

  const [occupations, setOccupations] = useState<Occupation[]>([])
  const [allVisaOptions, setAllVisaOptions] = useState<VisaOption[]>([])
  const [listMembership, setListMembership] = useState<ListMembership>({
    v13: { MLTSSL: false, STSOL: false, ROL: false },
    v2022: { CSOL: false }
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [caveatModal, setCaveatModal] = useState<{ show: boolean; title: string; content: string }>({
    show: false,
    title: '',
    content: ''
  })

  const getLINUrl = (linCode: string | null): string => {
    if (!linCode) return 'https://www.legislation.gov.au/'
    
    const linMapping: { [key: string]: string } = {
      'LIN 24/089': 'https://www.legislation.gov.au/F2024L01620/latest/text',
      'LIN 24/093': 'https://www.legislation.gov.au/F2024L01618/latest/text',
      'LIN 19/219': 'https://www.legislation.gov.au/F2019L01403/latest/text',
      'LIN 19/051': 'https://www.legislation.gov.au/F2019L00278/latest/text'
    }

    return linMapping[linCode] || 'https://www.legislation.gov.au/'
  }

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        
        const { data: occData, error: occError } = await supabase
          .from('occupations')
          .select('code, catalogue_version, principal_title, skill_level, alternative_titles, specialisations, major_group, major_group_title, sub_major_group, sub_major_group_title, minor_group, minor_group_title, unit_group, unit_group_title, description, tasks')
          .eq('code', code)
          .order('catalogue_version')

        if (occError) throw occError
        if (!occData || occData.length === 0) throw new Error('Occupation not found')

        setOccupations(occData)
        
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (code) {
      fetchData()
    }
  }, [code])

  useEffect(() => {
    async function fetchAllVisaOptions() {
      if (occupations.length === 0) return

      try {
        const allVisas: VisaOption[] = []

        for (const occ of occupations) {
          const { data, error } = await supabase
            .from('visa_eligibility')
            .select('visa_id, anzsco_code, catalogue_version, is_eligible, eligibility_reason, applicable_lists, visa:visas!inner(subclass, visa_name, stream, category, catalogue_version, legislative_instrument)')
            .eq('anzsco_code', code)
            .eq('catalogue_version', occ.catalogue_version)
            .eq('is_eligible', true)

          if (error) throw error
          if (data) {
            const transformedData = data.map((item: any) => ({
              ...item,
              visa: Array.isArray(item.visa) ? item.visa[0] : item.visa
            }))
            allVisas.push(...transformedData)
          }
        }

        const visaOrder: { [key: string]: number } = {
          '189': 1, '190': 2, '491': 3, '485': 4,
          '482': 5, '186': 6, '187': 7, '494': 8, '407': 9
        }

        const sortedVisas = allVisas.sort((a, b) => {
          const orderA = visaOrder[a.visa.subclass] || 999
          const orderB = visaOrder[b.visa.subclass] || 999
          if (orderA !== orderB) return orderA - orderB
          
          if (a.visa.subclass === b.visa.subclass) {
            if (a.visa.stream && b.visa.stream) {
              return a.visa.stream.localeCompare(b.visa.stream)
            }
          }
          return 0
        })

        setAllVisaOptions(sortedVisas)
      } catch (err: any) {
        console.error('Error:', err)
      }
    }

    async function fetchListMembership() {
      if (occupations.length === 0) return

      try {
        const { data, error } = await supabase
          .from('occupation_lists')
          .select('list_name, catalogue_version')
          .eq('anzsco_code', code)
          .eq('status', 'active')

        if (error) throw error

        const membership: ListMembership = {
          v13: { MLTSSL: false, STSOL: false, ROL: false },
          v2022: { CSOL: false }
        }

        data?.forEach(item => {
          if (item.catalogue_version === 'v1.3') {
            if (item.list_name === 'MLTSSL') membership.v13.MLTSSL = true
            if (item.list_name === 'STSOL') membership.v13.STSOL = true
            if (item.list_name === 'ROL') membership.v13.ROL = true
          } else if (item.catalogue_version === 'v2022') {
            if (item.list_name === 'CSOL') membership.v2022.CSOL = true
          }
        })

        setListMembership(membership)
      } catch (err: any) {
        console.error('Error fetching lists:', err)
      }
    }

    fetchAllVisaOptions()
    fetchListMembership()
  }, [code, occupations])

  const getCatalogueBadgeColor = (version: string) => {
    switch (version) {
      case 'v1.3': return 'bg-cyan-100 text-cyan-800'
      case 'v2022': return 'bg-yellow-100 text-yellow-800'
      case 'OSCA': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategorySidebarColor = (category: string) => {
    return category === 'Permanent' ? 'bg-green-500' : 'bg-yellow-500'
  }

  const showCaveatModal = (subclass: string, stream: string | null) => {
    let title = ''
    let content = ''

    if (subclass === '482' && stream === 'Specialist') {
      title = 'Subclass 482 Skills in Demand (SID) - Specialist stream'
      content = 'The SID Specialist stream provides access to temporary residence for eligible individuals. To be eligible under the SID Specialist stream: (i) the occupation and its corresponding 6-digit code correspond to an occupation specified in Major Group 1, 2, 4, 5 or 6 in ANZSCO; and (ii) the salary threshold of $135,000+ applies.'
    } else if (subclass === '186' && stream === 'Temporary Residence Transition (TRT)') {
      title = 'Subclass 186 Employer Nomination Scheme (ENS) - TRT stream'
      content = 'May be eligible if worked on 482 visa in same or related occupation (4-digit unit group match required). This pathway allows 482 visa holders to transition to permanent residence after working for their employer.'
    }

    setCaveatModal({ show: true, title, content })
  }

  const CheckIcon = () => (
    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  )

  const XIcon = () => (
    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  )

  const DashIcon = () => (
    <span className="text-gray-400 text-xl">—</span>
  )

  const getListIndicator = (visaCatalogueVersion: string, listName: 'MLTSSL' | 'STSOL' | 'ROL' | 'CSOL') => {
    if (visaCatalogueVersion === 'v1.3') {
      if (listName === 'CSOL') return <DashIcon />
      if (listName === 'MLTSSL') return listMembership.v13.MLTSSL ? <CheckIcon /> : <XIcon />
      if (listName === 'STSOL') return listMembership.v13.STSOL ? <CheckIcon /> : <XIcon />
      if (listName === 'ROL') return listMembership.v13.ROL ? <CheckIcon /> : <XIcon />
    } else if (visaCatalogueVersion === 'v2022') {
      if (listName === 'CSOL') return listMembership.v2022.CSOL ? <CheckIcon /> : <XIcon />
      return <DashIcon />
    }
    return <DashIcon />
  }

  const formatStreamName = (stream: string | null): string => {
    if (!stream) return ''
    if (stream === 'Core Skills') return 'Core Skills'
    if (stream === 'Specialist') return 'Specialist'
    if (stream === 'Direct Entry') return 'Direct Entry'
    if (stream === 'Temporary Residence Transition (TRT)') return 'TRT'
    if (stream === 'State Nominated') return 'State Nominated'
    if (stream === 'Family Sponsored') return 'Family Sponsored'
    return stream
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-700">{error}</p>
          <button onClick={() => router.push('/')} className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            Back to Search
          </button>
        </div>
      </div>
    )
  }

  const firstOccupation = occupations[0]

  return (
    <main className="min-h-screen bg-gray-50">
      {caveatModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">{caveatModal.title}</h3>
                <button
                  onClick={() => setCaveatModal({ show: false, title: '', content: '' })}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-gray-700 whitespace-pre-line">{caveatModal.content}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600
                       rounded-full text-sm font-medium hover:bg-blue-600 hover:text-white
                       transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Search
          </button>
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-3xl font-bold text-gray-900">
              {firstOccupation.code}: {firstOccupation.principal_title}
            </h1>
            {occupations.map(occ => (
              <span key={occ.catalogue_version} className={`px-3 py-1 rounded text-sm font-semibold ${getCatalogueBadgeColor(occ.catalogue_version)}`}>
                {occ.catalogue_version.toUpperCase()}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">
              {firstOccupation.skill_level || '?'}
            </span>
            <span className="text-sm text-gray-600">Skill Level</span>
          </div>
        </div>
      </div>

      {/* ANZSCO Details Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-900">
              ANZSCO Details
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              ANZSCO version 2022 (reference only)
            </p>
          </div>

          <div className="px-6 py-6 space-y-6">
            {(() => {
              const v2022Occ = occupations.find(o => o.catalogue_version === 'v2022')
              
              if (!v2022Occ) {
                return (
                  <p className="text-gray-500">
                    ANZSCO v2022 details not available for this occupation.
                  </p>
                )
              }

              const hasHierarchy = v2022Occ.major_group && v2022Occ.unit_group
              const altTitles = Array.isArray(v2022Occ.alternative_titles) ? v2022Occ.alternative_titles : []
              const specs = Array.isArray(v2022Occ.specialisations) ? v2022Occ.specialisations : []
              const tasks = Array.isArray(v2022Occ.tasks) ? v2022Occ.tasks : []
              const hasAltTitles = altTitles.length > 0
              const hasSpecs = specs.length > 0
              const hasDescription = v2022Occ.description && v2022Occ.description.trim().length > 0
              const hasTasks = tasks.length > 0

              return (
                <>
                  {/* ANZSCO Hierarchy */}
                  {hasHierarchy && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="font-semibold text-gray-700">Major Group:</span>
                          <span className="ml-2 text-gray-900">{v2022Occ.major_group} - {v2022Occ.major_group_title}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Sub-Major Group:</span>
                          <span className="ml-2 text-gray-900">{v2022Occ.sub_major_group} - {v2022Occ.sub_major_group_title}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Minor Group:</span>
                          <span className="ml-2 text-gray-900">{v2022Occ.minor_group} - {v2022Occ.minor_group_title}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Unit Group:</span>
                          <span className="ml-2 text-gray-900">{v2022Occ.unit_group} - {v2022Occ.unit_group_title}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {hasDescription && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-5 bg-green-500 rounded"></span>
                        Description
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {v2022Occ.description}
                      </p>
                    </div>
                  )}

                  {/* Tasks */}
                  {hasTasks && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-5 bg-orange-500 rounded"></span>
                        Tasks Include
                      </h3>
                      <ul className="space-y-2">
                        {tasks.map((task, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-700 text-sm">
                            <span className="text-orange-500 mt-1">•</span>
                            <span>{task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Alternative Titles */}
                  {hasAltTitles && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-5 bg-blue-500 rounded"></span>
                        Alternative Titles
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {altTitles.map((title, idx) => (
                          <span 
                            key={idx}
                            className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-200"
                          >
                            {title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Specialisations */}
                  {hasSpecs && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-5 bg-purple-500 rounded"></span>
                        Specialisations
                      </h3>
                      <div className="grid md:grid-cols-2 gap-2">
                        {specs.map((spec, idx) => (
                          <div 
                            key={idx}
                            className="px-3 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm border border-purple-200"
                          >
                            {spec}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Link to ABS */}
                  <div className="pt-4 border-t border-gray-200">
                    <a 
                      href={`https://www.abs.gov.au/statistics/classifications/anzsco-australian-and-new-zealand-standard-classification-occupations/2022/browse-classification/${v2022Occ.code.substring(0,1)}/${v2022Occ.code.substring(0,2)}/${v2022Occ.code.substring(0,4)}/${v2022Occ.code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 text-sm"
                    >
                      View full occupation description on ABS website
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      </div>

      {/* Visa Options Table */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-900">
              Possible Visa Options
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Visa Type</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Eligibility</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Legislative Instrument</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                    <a href="https://immi.homeaffairs.gov.au/visas/working-in-australia/skill-occupation-list" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 inline-flex items-center gap-1">
                      MLTSSL <ExternalLink className="w-3 h-3" />
                    </a>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                    <a href="https://immi.homeaffairs.gov.au/visas/working-in-australia/skill-occupation-list" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 inline-flex items-center gap-1">
                      STSOL <ExternalLink className="w-3 h-3" />
                    </a>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                    <a href="https://immi.homeaffairs.gov.au/visas/working-in-australia/skill-occupation-list" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 inline-flex items-center gap-1">
                      ROL <ExternalLink className="w-3 h-3" />
                    </a>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                    <a href="https://immi.homeaffairs.gov.au/visas/working-in-australia/skill-occupation-list" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 inline-flex items-center gap-1">
                      CSOL <ExternalLink className="w-3 h-3" />
                    </a>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {allVisaOptions.map((option) => {
                  const needsCaveat = (option.visa.subclass === '482' && option.visa.stream === 'Specialist') ||
                                      (option.visa.subclass === '186' && option.visa.stream === 'Temporary Residence Transition (TRT)')
                  
                  return (
                    <tr key={`${option.visa_id}-${option.catalogue_version}`} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-1 h-16 rounded ${getCategorySidebarColor(option.visa.category)}`}></div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="bg-blue-600 text-white rounded-full px-2 py-1 text-xs font-bold">
                                {option.visa.subclass}
                              </span>
                              <span className="font-semibold text-gray-900">{option.visa.visa_name}</span>
                            </div>
                            {option.visa.stream && (
                              <p className="text-sm text-gray-700 mb-1">
                                <span className="font-medium">Stream:</span> {formatStreamName(option.visa.stream)}
                              </p>
                            )}
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                                option.visa.category === 'Permanent' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {option.visa.category}
                              </span>
                              <span className="text-xs text-gray-500">
                                ({option.catalogue_version})
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex justify-center">
                          <span className="bg-green-100 text-green-800 rounded-full p-2">
                            <CheckIcon />
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col items-center gap-2">
                          {option.visa.legislative_instrument && (
                            <a 
                              href={getLINUrl(option.visa.legislative_instrument)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm font-mono border border-gray-300 px-2 py-1 rounded inline-flex items-center gap-1"
                            >
                              {option.visa.legislative_instrument}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          {needsCaveat && (
                            <button
                              onClick={() => showCaveatModal(option.visa.subclass, option.visa.stream)}
                              className="bg-blue-500 text-white rounded-full p-1.5 hover:bg-blue-600"
                              title="View requirements"
                            >
                              <Info className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {getListIndicator(option.catalogue_version, 'MLTSSL')}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {getListIndicator(option.catalogue_version, 'STSOL')}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {getListIndicator(option.catalogue_version, 'ROL')}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {getListIndicator(option.catalogue_version, 'CSOL')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Legend:</h3>
            <div className="grid grid-cols-3 gap-x-8 gap-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-10 rounded bg-green-500 flex-shrink-0"></div>
                <span className="text-sm text-gray-700">Permanent Visa</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-10 rounded bg-yellow-500 flex-shrink-0"></div>
                <span className="text-sm text-gray-700">Temporary Visa</span>
              </div>
              <div></div>
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0"><CheckIcon /></div>
                <span className="text-sm text-gray-700">On this list</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0"><XIcon /></div>
                <span className="text-sm text-gray-700">Not on this list</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0"><DashIcon /></div>
                <span className="text-sm text-gray-700">List not applicable</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
