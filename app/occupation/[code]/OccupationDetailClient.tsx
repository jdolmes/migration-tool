'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { trackEvent } from '../../../lib/analytics'
import { ArrowLeft, ExternalLink, Info, X, Check, ChevronDown } from 'lucide-react'
import LeadWidget from '@/components/lead-capture/LeadWidget'

// ============================================
// VISA LIST CONFIGURATION
// ============================================
// Add or modify visa list requirements here
const VISA_LIST_RULES: {
  [key: string]: {
    lists: ('MLTSSL' | 'STSOL' | 'ROL' | 'CSOL')[]
    hasInfoButton: boolean
    infoTitle?: string
    infoText?: string
  }
} = {
  '189': { lists: ['MLTSSL'], hasInfoButton: false },
  '190': { lists: ['MLTSSL', 'STSOL'], hasInfoButton: false },
  '491-state': { lists: ['MLTSSL', 'STSOL', 'ROL'], hasInfoButton: false },
  '491-family': { lists: ['MLTSSL'], hasInfoButton: false },
  '494': { lists: ['MLTSSL', 'ROL'], hasInfoButton: false },
  '482-core': { lists: ['CSOL'], hasInfoButton: false },
  '482-specialist': {
    lists: [],
    hasInfoButton: true,
    infoTitle: 'Subclass 482 SID - Specialist Skills',
    infoText: 'Special Requirements (No occupation list)\n\nEligible occupations must be from ANZSCO Major Groups 1, 2, 4, 5, or 6 only.'
  },
  '186-direct': { lists: ['CSOL'], hasInfoButton: false },
  '186-trt': {
    lists: [],
    hasInfoButton: true,
    infoTitle: 'Subclass 186 ENS - TRT Stream',
    infoText: 'Special Requirements (No occupation list)\n\nYour current occupation must match the occupation from your previous Subclass 457, 482 TSS, or 482 SID visa.\n\nNote: This pathway is for transitioning from temporary to permanent residence in the same occupation.'
  },
  '485': { lists: ['MLTSSL'], hasInfoButton: false },
}

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
  unit_group_description: string | null
  indicative_skill_level: string | null
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

export default function OccupationDetailClient() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string

  const [occupations, setOccupations] = useState<Occupation[]>([])
  const [relatedOccupations, setRelatedOccupations] = useState<{code: string, principal_title: string}[]>([])
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

  // Active tab/accordion state
  const [activeTab, setActiveTab] = useState<'visa-options' | 'anzsco-details'>('visa-options')
  const [mobileAccordion, setMobileAccordion] = useState<{
    visaOptions: boolean
    anzscoDetails: boolean
  }>({ visaOptions: true, anzscoDetails: false })
  const [showIneligible, setShowIneligible] = useState(false)

  // Ineligible visas state
  const [ineligibleVisas, setIneligibleVisas] = useState<VisaOption[]>([])

  // Lead capture widget state - tracks if widget should auto-expand
  const [widgetExpanded, setWidgetExpanded] = useState(false)
  const [widgetDismissed, setWidgetDismissed] = useState(false)

  // Handle lead form submission - save to Supabase
  async function handleLeadSubmit(formData: {
    name: string
    email: string
    phone: string
    location: 'onshore' | 'offshore' | ''
    currentVisa?: string
    timeline: string
    message?: string
  }) {
    try {
      // Get session ID from analytics
      const sessionId = sessionStorage.getItem('session_id') || 'unknown'

      // Calculate real intent score from session analytics events
      const intentSessionId = sessionStorage.getItem('session_id')
      let intentScore = 3 // base score

      if (intentSessionId) {
        try {
          const { data: sessionEvents } = await supabase
            .from('analytics_events')
            .select('*')
            .eq('session_id', intentSessionId)
            .order('created_at', { ascending: true })

          if (sessionEvents && sessionEvents.length > 0) {
            const { calculateIntentScore } = await import('@/lib/admin')
            intentScore = calculateIntentScore(sessionEvents, {
              timeline: formData.timeline,
              location: formData.location,
              created_at: new Date().toISOString(),
            })
          }
        } catch (err) {
          console.error('Intent score calculation error:', err)
          intentScore = 3 // fallback to base score
        }
      }

      // Prepare lead data for database
      const leadData = {
        session_id: sessionId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        location: formData.location,
        current_visa: formData.currentVisa || null,
        timeline: formData.timeline,
        message: formData.message || null,
        occupation_code: code,
        intent_score: intentScore,
        status: 'new',
        created_at: new Date().toISOString()
      }

      // Insert into Supabase
      const { data, error } = await supabase
        .from('leads')
        .insert(leadData)
        .select()
        .single()

      if (error) {
        console.error('Error saving lead:', error)
        // Still show success to user (fail gracefully)
        return
      }

      console.log('Lead saved successfully:', data)

      // Track lead submission event
      trackEvent('lead_submitted', {
        occupationCode: code,
        metadata: {
          location: formData.location,
          timeline: formData.timeline,
          has_phone: !!formData.phone,
          has_message: !!formData.message
        }
      })

      // TODO: Create session summary in lead_summaries table

    } catch (error) {
      console.error('Failed to save lead:', error)
      // Fail gracefully - user still sees success message
    }
  }

  // Auto-expand widget after 2 minutes (once per session)
  useEffect(() => {
    console.log('[LeadWidget] Auto-expand useEffect running')
    console.log('[LeadWidget] Already expanded this session:', sessionStorage.getItem('lead_widget_auto_expanded'))

    if (sessionStorage.getItem('lead_widget_auto_expanded') === 'true') {
      console.log('[LeadWidget] Skipping - already auto-expanded this session')
      return
    }

    console.log('[LeadWidget] Setting 2-minute timer for auto-expand')
    const timer = setTimeout(() => {
      console.log('[LeadWidget] Timer fired! Expanding widget now')
      sessionStorage.setItem('lead_widget_auto_expanded', 'true')
      setWidgetExpanded(true)
      console.log('[LeadWidget] widgetExpanded set to true')
    }, 120000) // 2 minutes - shows user engagement

    return () => {
      console.log('[LeadWidget] Cleanup - clearing timer')
      clearTimeout(timer)
    }
  }, [])

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
          .select('code, catalogue_version, principal_title, skill_level, alternative_titles, specialisations, major_group, major_group_title, sub_major_group, sub_major_group_title, minor_group, minor_group_title, unit_group, unit_group_title, description, tasks, unit_group_description, indicative_skill_level')
          .eq('code', code)
          .order('catalogue_version')

        if (occError) throw occError
        if (!occData || occData.length === 0) throw new Error('Occupation not found')

        setOccupations(occData)

        // 🆕 Track occupation view
trackEvent('occupation_viewed', {
  occupationCode: code,
  metadata: {
    principal_title: occData[0]?.principal_title,
    catalogues: occData.map(o => o.catalogue_version).join(',')
  }
})

        // Fetch related occupations in the same unit group
        const v2022Occ = occData.find(o => o.catalogue_version === 'v2022')
        if (v2022Occ && v2022Occ.unit_group) {
          const { data: relatedData, error: relatedError } = await supabase
            .from('occupations')
            .select('code, principal_title')
            .eq('unit_group', v2022Occ.unit_group)
            .eq('catalogue_version', 'v2022')
            .order('code')

          if (!relatedError && relatedData) {
            setRelatedOccupations(relatedData)
          }
        }

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
        const eligibleVisas: VisaOption[] = []
        const notEligibleVisas: VisaOption[] = []

        for (const occ of occupations) {
          // Fetch eligible visas
          const { data: eligibleData, error: eligibleError } = await supabase
            .from('visa_eligibility')
            .select('visa_id, anzsco_code, catalogue_version, is_eligible, eligibility_reason, applicable_lists, visa:visas!inner(subclass, visa_name, stream, category, catalogue_version, legislative_instrument)')
            .eq('anzsco_code', code)
            .eq('catalogue_version', occ.catalogue_version)
            .eq('is_eligible', true)

          if (eligibleError) throw eligibleError
          if (eligibleData) {
            const transformedData = eligibleData.map((item: any) => ({
              ...item,
              visa: Array.isArray(item.visa) ? item.visa[0] : item.visa
            }))
            eligibleVisas.push(...transformedData)
          }

          // Fetch ineligible visas
          const { data: ineligibleData, error: ineligibleError } = await supabase
            .from('visa_eligibility')
            .select('visa_id, anzsco_code, catalogue_version, is_eligible, eligibility_reason, applicable_lists, visa:visas!inner(subclass, visa_name, stream, category, catalogue_version, legislative_instrument)')
            .eq('anzsco_code', code)
            .eq('catalogue_version', occ.catalogue_version)
            .eq('is_eligible', false)

          if (ineligibleError) throw ineligibleError
          if (ineligibleData) {
            const transformedData = ineligibleData.map((item: any) => ({
              ...item,
              visa: Array.isArray(item.visa) ? item.visa[0] : item.visa
            }))
            notEligibleVisas.push(...transformedData)
          }
        }

        setAllVisaOptions(eligibleVisas)
        setIneligibleVisas(notEligibleVisas)

        // Determine list membership
        const v13Occ = occupations.find(o => o.catalogue_version === 'v1.3')
        const v2022Occ = occupations.find(o => o.catalogue_version === 'v2022')

        const newListMembership: ListMembership = {
          v13: { MLTSSL: false, STSOL: false, ROL: false },
          v2022: { CSOL: false }
        }

        if (v13Occ) {
          const v13Lists = await supabase
            .from('occupation_lists')
            .select('list_name')
            .eq('anzsco_code', code)
            .eq('catalogue_version', 'v1.3')
            .is('date_removed', null)

          console.log('v1.3 Lists Query Result:', v13Lists)

          if (v13Lists.data) {
            v13Lists.data.forEach((item: { list_name: string }) => {
              console.log('v1.3 List item:', item)
              if (item.list_name === 'MLTSSL') newListMembership.v13.MLTSSL = true
              if (item.list_name === 'STSOL') newListMembership.v13.STSOL = true
              if (item.list_name === 'ROL') newListMembership.v13.ROL = true
            })
          }
        }

        if (v2022Occ) {
          const v2022Lists = await supabase
            .from('occupation_lists')
            .select('list_name')
            .eq('anzsco_code', code)
            .eq('catalogue_version', 'v2022')
            .is('date_removed', null)

          console.log('v2022 Lists Query Result:', v2022Lists)

          if (v2022Lists.data) {
            v2022Lists.data.forEach((item: { list_name: string }) => {
              console.log('v2022 List item:', item)
              if (item.list_name === 'CSOL') newListMembership.v2022.CSOL = true
            })
          }
        }

        console.log('Final List Membership:', newListMembership)

        setListMembership(newListMembership)

      } catch (err: any) {
        console.error('Error fetching visa options:', err)
      }
    }

    fetchAllVisaOptions()
  }, [occupations, code])

  const getCatalogueBadgeColor = (version: string) => {
    if (version === 'v1.3') return 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-sm'
    if (version === 'v2022') return 'bg-gradient-to-r from-amber-400 to-amber-500 text-gray-900 shadow-sm'
    return 'bg-gray-100 text-gray-800'
  }

  const CheckIcon = () => (
    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )

  const XIcon = () => (
    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )

  const DashIcon = () => (
    <span className="text-gray-400 text-xl">—</span>
  )

  const getVisaKey = (subclass: string, stream: string | null): string => {
    if (subclass === '482') {
      if (stream === 'Core Skills') return '482-core'
      if (stream === 'Specialist') return '482-specialist'
    }
    if (subclass === '186') {
      if (stream === 'Direct Entry') return '186-direct'
      if (stream === 'Temporary Residence Transition (TRT)') return '186-trt'
    }
    if (subclass === '491') {
      if (stream === 'State Nominated') return '491-state'
      if (stream === 'Family Sponsored') return '491-family'
    }
    return subclass
  }

  const getListIndicator = (
    subclass: string,
    stream: string | null,
    visaCatalogueVersion: string,
    listName: 'MLTSSL' | 'STSOL' | 'ROL' | 'CSOL'
  ) => {
    const visaKey = getVisaKey(subclass, stream)
    const rules = VISA_LIST_RULES[visaKey]

    if (!rules) return <DashIcon />

    // If this list is not required for this visa, show dash
    if (!rules.lists.includes(listName)) return <DashIcon />

    // Check if occupation is on the required list
    if (visaCatalogueVersion === 'v1.3') {
      if (listName === 'CSOL') return <DashIcon /> // CSOL doesn't exist in v1.3
      if (listName === 'MLTSSL') return listMembership.v13.MLTSSL ? <CheckIcon /> : <XIcon />
      if (listName === 'STSOL') return listMembership.v13.STSOL ? <CheckIcon /> : <XIcon />
      if (listName === 'ROL') return listMembership.v13.ROL ? <CheckIcon /> : <XIcon />
    } else if (visaCatalogueVersion === 'v2022') {
      if (listName === 'CSOL') return listMembership.v2022.CSOL ? <CheckIcon /> : <XIcon />
      if (['MLTSSL', 'STSOL', 'ROL'].includes(listName)) return <DashIcon /> // These don't exist in v2022
    }
    return <DashIcon />
  }

  const getInfoButton = (subclass: string, stream: string | null) => {
    const visaKey = getVisaKey(subclass, stream)
    const rules = VISA_LIST_RULES[visaKey]

    if (!rules || !rules.hasInfoButton) return null

    return (
      <button
        onClick={() => {
          trackEvent('info_button_clicked', {
            visaSubclass: subclass,
            visaStream: stream || undefined,
            occupationCode: code,
            metadata: {
              info_type: rules.infoTitle || 'Special Requirements'
            }
          })
          setCaveatModal({
            show: true,
            title: rules.infoTitle || 'Special Requirements',
            content: rules.infoText || ''
          })
        }}
        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
        aria-label="View special requirements"
      >
        <Info className="w-4 h-4" />
      </button>
    )
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

  const hasCaveats = (subclass: string, stream: string | null): boolean => {
    const visaKey = getVisaKey(subclass, stream)
    const rules = VISA_LIST_RULES[visaKey]
    return rules?.hasInfoButton || false
  }

  const getApplicableLists = (option: VisaOption): string[] => {
    const visaKey = getVisaKey(option.visa.subclass, option.visa.stream)
    const rules = VISA_LIST_RULES[visaKey]
    if (!rules) return []

    const lists: string[] = []
    const version = option.visa.catalogue_version

    if (version === 'v1.3') {
      if (rules.lists.includes('MLTSSL') && listMembership.v13.MLTSSL) lists.push('MLTSSL')
      if (rules.lists.includes('STSOL') && listMembership.v13.STSOL) lists.push('STSOL')
      if (rules.lists.includes('ROL') && listMembership.v13.ROL) lists.push('ROL')
    } else if (version === 'v2022') {
      if (rules.lists.includes('CSOL') && listMembership.v2022.CSOL) lists.push('CSOL')
    }

    return lists
  }

  const toggleMobileAccordion = (section: 'visaOptions' | 'anzscoDetails') => {
    // Update state first so UI responds immediately
    setMobileAccordion(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
    // Track analytics after state update
    if (section === 'visaOptions') {
      trackEvent('tab_switched', {
        occupationCode: code,
        metadata: { from: mobileAccordion.visaOptions ? 'visa-options' : 'closed', to: 'visa-options' }
      })
    } else {
      trackEvent('tab_switched', {
        occupationCode: code,
        metadata: { from: mobileAccordion.anzscoDetails ? 'anzsco-details' : 'closed', to: 'anzsco-details' }
      })
    }
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
  const v2022Occ = occupations.find(o => o.catalogue_version === 'v2022')

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-white to-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200
                       rounded-lg text-sm font-medium hover:bg-gray-50 hover:border-gray-300
                       transition-all shadow-sm mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Search
          </button>

          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
              {firstOccupation.code}: {firstOccupation.principal_title}
            </h1>
            {occupations.map(occ => (
              <span key={occ.catalogue_version} className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide ${getCatalogueBadgeColor(occ.catalogue_version)}`}>
                {occ.catalogue_version.replace('v', '')}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-sm">
              <span className="font-bold text-sm">Level {firstOccupation.skill_level || '?'}</span>
            </div>
            <span className="text-sm text-gray-600 font-medium">Skill Level</span>
          </div>
        </div>
      </div>

      {/* Desktop Tab Navigation - Hidden on mobile */}
      <div className="hidden md:block bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            <button
              onClick={() => {
                trackEvent('tab_switched', {
                  occupationCode: code,
                  metadata: { from: activeTab, to: 'visa-options' }
                })
                setActiveTab('visa-options')
              }}
              className={`px-8 py-4 font-semibold text-sm transition-all relative ${
                activeTab === 'visa-options'
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                <span>Visa Options</span>
              </div>
              {activeTab === 'visa-options' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-full"></div>
              )}
            </button>
            <button
              onClick={() => {
                trackEvent('tab_switched', {
                  occupationCode: code,
                  metadata: { from: activeTab, to: 'anzsco-details' }
                })
                setActiveTab('anzsco-details')
              }}
              className={`px-8 py-4 font-semibold text-sm transition-all relative ${
                activeTab === 'anzsco-details'
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                <span>ANZSCO Details</span>
              </div>
              {activeTab === 'anzsco-details' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-full"></div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Tab Content */}
      <div className="hidden md:block max-w-7xl mx-auto px-6 py-10">
        {/* VISA OPTIONS TAB */}
        {activeTab === 'visa-options' && (
          <div className="space-y-6">
            {/* Eligible Visas Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 flex items-center justify-between">
                <h2 className="text-lg font-bold text-green-800 flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  Visas you may be eligible for
                </h2>
                {allVisaOptions.length > 0 && (
                  <span className="bg-green-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                    {allVisaOptions.length}
                  </span>
                )}
              </div>
              <div className="p-6">
                {allVisaOptions.length > 0 ? (
                  <div className="space-y-3">
                    {allVisaOptions.map((option, idx) => (
                      <div key={idx} className="bg-white rounded-lg border-l-4 border-l-green-500 border border-gray-200 p-4 hover:shadow-md transition-shadow">
                        {/* Row 1: Badge + Name + Stream + Check */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg font-bold text-white text-sm bg-blue-600 min-w-[52px]">
                              {option.visa.subclass}
                            </span>
                            <div>
                              <span className="font-semibold text-gray-900">{option.visa.visa_name}</span>
                              {option.visa.stream && (
                                <span className="text-gray-500 text-sm ml-2">— {formatStreamName(option.visa.stream)}</span>
                              )}
                            </div>
                          </div>
                          <span className="text-green-600 flex-shrink-0">
                            <Check className="w-5 h-5" />
                          </span>
                        </div>
                        {/* Row 2: Category + List pills + LIN + Caveats */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            option.visa.category === 'Permanent'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {option.visa.category}
                          </span>
                          <span className="text-gray-300">|</span>
                          {getApplicableLists(option).map(list => (
                            <span key={list} className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                              {list}
                            </span>
                          ))}
                          {option.visa.legislative_instrument && (
                            <a
                              href={getLINUrl(option.visa.legislative_instrument)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => trackEvent('lin_clicked', {
                                visaSubclass: option.visa.subclass,
                                visaStream: option.visa.stream || undefined,
                                occupationCode: code,
                                metadata: {
                                  lin_code: option.visa.legislative_instrument,
                                  eligibility: 'eligible'
                                }
                              })}
                              className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition-colors inline-flex items-center gap-1"
                            >
                              LIN <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          {hasCaveats(option.visa.subclass, option.visa.stream) && (
                            <button
                              onClick={() => {
                                const visaKey = getVisaKey(option.visa.subclass, option.visa.stream)
                                const rules = VISA_LIST_RULES[visaKey]
                                trackEvent('info_button_clicked', {
                                  visaSubclass: option.visa.subclass,
                                  visaStream: option.visa.stream || undefined,
                                  occupationCode: code,
                                  metadata: { info_type: rules?.infoTitle || 'Caveats' }
                                })
                                setCaveatModal({
                                  show: true,
                                  title: rules?.infoTitle || 'Special Requirements',
                                  content: rules?.infoText || ''
                                })
                              }}
                              className="text-xs font-medium px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors inline-flex items-center gap-1"
                            >
                              Caveats <Info className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    No eligible visa options found for this occupation based on current data.
                  </p>
                )}
              </div>
            </div>

            {/* Ineligible Visas Section */}
            {ineligibleVisas.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setShowIneligible(!showIneligible)}
                  className="w-full px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between hover:bg-gray-100 transition-colors"
                >
                  <h2 className="text-lg font-bold text-gray-500 flex items-center gap-2">
                    <X className="w-5 h-5" />
                    Not available for this occupation
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className="bg-gray-400 text-white text-sm font-bold px-3 py-1 rounded-full">
                      {ineligibleVisas.length}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showIneligible ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                {showIneligible && (
                  <div className="p-6">
                    <div className="space-y-3">
                      {ineligibleVisas.map((option, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-lg border-l-4 border-l-gray-400 border border-gray-200 p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg font-bold text-white text-sm bg-gray-400 min-w-[52px]">
                                {option.visa.subclass}
                              </span>
                              <div>
                                <span className="font-semibold text-gray-700">{option.visa.visa_name}</span>
                                {option.visa.stream && (
                                  <span className="text-gray-500 text-sm ml-2">— {formatStreamName(option.visa.stream)}</span>
                                )}
                              </div>
                            </div>
                            <span className="text-red-500 flex-shrink-0">
                              <X className="w-5 h-5" />
                            </span>
                          </div>
                          <p className="text-sm text-red-600 mt-2 ml-16 italic">
                            {option.eligibility_reason || 'Not on required occupation list'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Legend */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Legend</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">MLTSSL</span>
                  <span>Medium and Long-term Strategic Skills List</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">STSOL</span>
                  <span>Short-term Skilled Occupation List</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">ROL</span>
                  <span>Regional Occupation List</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">CSOL</span>
                  <span>Core Skills Occupation List</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">LIN</span>
                  <span>Legislative Instrument (official list)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium">Caveats</span>
                  <span>Special conditions or requirements</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ANZSCO DETAILS TAB - NOW SECONDARY */}
        {activeTab === 'anzsco-details' && v2022Occ && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                ANZSCO Details
              </h2>
              <p className="text-sm text-gray-500 mt-2 font-medium">
                ANZSCO version 2022 (reference only)
              </p>
            </div>

            <div className="px-8 py-8 space-y-8">
              {(() => {
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
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-100">
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-bold text-gray-700">Major Group:</span>
                            <span className="ml-2 text-gray-900 font-medium">{v2022Occ.major_group} - {v2022Occ.major_group_title}</span>
                          </div>
                          <div>
                            <span className="font-bold text-gray-700">Sub-Major Group:</span>
                            <span className="ml-2 text-gray-900 font-medium">{v2022Occ.sub_major_group} - {v2022Occ.sub_major_group_title}</span>
                          </div>
                          <div>
                            <span className="font-bold text-gray-700">Minor Group:</span>
                            <span className="ml-2 text-gray-900 font-medium">{v2022Occ.minor_group} - {v2022Occ.minor_group_title}</span>
                          </div>
                          <div>
                            <span className="font-bold text-gray-700">Unit Group:</span>
                            <span className="ml-2 text-gray-900 font-medium">{v2022Occ.unit_group} - {v2022Occ.unit_group_title}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    {hasDescription && (
                      <div>
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-3 text-lg">
                          <span className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></span>
                          Description
                        </h3>
                        <p className="text-gray-700 leading-relaxed text-base">
                          {v2022Occ.description}
                        </p>
                      </div>
                    )}

                    {/* Tasks */}
                    {hasTasks && (
                      <div>
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-3 text-lg">
                          <span className="w-1 h-6 bg-gradient-to-b from-orange-500 to-amber-600 rounded-full"></span>
                          Tasks Include
                        </h3>
                        <ul className="space-y-3">
                          {tasks.map((task, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-gray-700 text-base">
                              <span className="text-orange-500 mt-1.5 font-bold">•</span>
                              <span className="leading-relaxed">{task}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Alternative Titles */}
                    {hasAltTitles && (
                      <div>
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-3 text-lg">
                          <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-cyan-600 rounded-full"></span>
                          Alternative Titles
                        </h3>
                        <div className="flex flex-wrap gap-3">
                          {altTitles.map((title, idx) => (
                            <span key={idx} className="px-4 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 rounded-lg text-sm border-2 border-blue-200 font-medium">
                              {title}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Specialisations */}
                    {hasSpecs && (
                      <div>
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-3 text-lg">
                          <span className="w-1 h-6 bg-gradient-to-b from-purple-500 to-fuchsia-600 rounded-full"></span>
                          Specialisations
                        </h3>
                        <div className="grid md:grid-cols-2 gap-3">
                          {specs.map((spec, idx) => (
                            <div key={idx} className="px-4 py-3 bg-gradient-to-r from-purple-50 to-fuchsia-50 text-purple-700 rounded-lg border-2 border-purple-200 text-sm font-medium">
                              {spec}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Unit Group Details */}
                    {v2022Occ.unit_group && v2022Occ.unit_group_description && (
                      <div className="bg-gray-50 rounded-lg p-6 border border-gray-300">
                        <h3 className="font-bold text-gray-900 mb-4 text-lg">
                          Unit Group {v2022Occ.unit_group}: {v2022Occ.unit_group_title}
                        </h3>

                        {/* Unit Group Description */}
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {v2022Occ.unit_group_description}
                          </p>
                        </div>

                        {/* Indicative Skill Level */}
                        {v2022Occ.indicative_skill_level && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">
                                {v2022Occ.skill_level || '1'}
                              </span>
                              Indicative Skill Level
                            </h4>
                            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                              {v2022Occ.indicative_skill_level}
                            </p>
                          </div>
                        )}

                        {/* Related Occupations */}
                        {relatedOccupations.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">
                              Occupations in this Unit Group ({relatedOccupations.length})
                            </h4>
                            <div className="grid md:grid-cols-2 gap-2">
                              {relatedOccupations.map((occ) => (
                                <a
                                  key={occ.code}
                                  href={`/occupation/${occ.code}`}
                                  onClick={() => trackEvent('related_occupation_clicked', {
                                    occupationCode: code,
                                    metadata: {
                                      from_occupation: code,
                                      to_occupation: occ.code,
                                      from_title: v2022Occ.principal_title,
                                      to_title: occ.principal_title
                                    }
                                  })}
                                  className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                                    occ.code === v2022Occ.code
                                      ? 'bg-blue-100 text-blue-900 border-blue-300 font-semibold'
                                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                  }`}
                                >
                                  {occ.code}: {occ.principal_title}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ABS Link */}
                    <div className="pt-4 border-t border-gray-200">
                      <a
                        href={`https://www.abs.gov.au/statistics/classifications/anzsco-australian-and-new-zealand-standard-classification-occupations/2022/browse-classification/${v2022Occ.code.substring(0,1)}/${v2022Occ.code.substring(0,2)}/${v2022Occ.code.substring(0,4)}/${v2022Occ.code}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
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
        )}
      </div>

      {/* Mobile Accordion Layout - Hidden on desktop */}
      <div className="md:hidden px-4 py-6 pb-24 space-y-4">
        {/* Visa Options Accordion */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleMobileAccordion('visaOptions')}
            className="w-full px-4 py-4 min-h-[56px] flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 cursor-pointer select-none active:bg-green-100 touch-manipulation"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <span className="font-bold text-green-800 flex items-center gap-2 pointer-events-none">
              <Check className="w-5 h-5" />
              Visa Options
            </span>
            <ChevronDown className={`w-5 h-5 text-green-600 transition-transform pointer-events-none ${mobileAccordion.visaOptions ? 'rotate-180' : ''}`} />
          </button>
          {mobileAccordion.visaOptions && (
            <div className="p-4">
              {/* Eligible Visas */}
              <div className="space-y-3">
                {allVisaOptions.length > 0 ? (
                  allVisaOptions.map((option, idx) => (
                    <div key={idx} className="bg-white rounded-lg border-l-4 border-l-green-500 border border-gray-200 p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg font-bold text-white text-xs bg-blue-600">
                            {option.visa.subclass}
                          </span>
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                            option.visa.category === 'Permanent'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {option.visa.category}
                          </span>
                        </div>
                        <span className="text-green-600">
                          <Check className="w-4 h-4" />
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900 text-sm">{option.visa.visa_name}</h4>
                      {option.visa.stream && (
                        <p className="text-xs text-gray-500">{formatStreamName(option.visa.stream)}</p>
                      )}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {getApplicableLists(option).map(list => (
                          <span key={list} className="text-xs font-medium px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                            {list}
                          </span>
                        ))}
                        {option.visa.legislative_instrument && (
                          <a
                            href={getLINUrl(option.visa.legislative_instrument)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackEvent('lin_clicked', {
                              visaSubclass: option.visa.subclass,
                              visaStream: option.visa.stream || undefined,
                              occupationCode: code,
                              metadata: { lin_code: option.visa.legislative_instrument, eligibility: 'eligible' }
                            })}
                            className="text-xs font-medium px-1.5 py-0.5 rounded bg-green-100 text-green-700 flex items-center gap-1"
                          >
                            LIN <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                        {hasCaveats(option.visa.subclass, option.visa.stream) && (
                          <button
                            onClick={() => {
                              const visaKey = getVisaKey(option.visa.subclass, option.visa.stream)
                              const rules = VISA_LIST_RULES[visaKey]
                              trackEvent('info_button_clicked', {
                                visaSubclass: option.visa.subclass,
                                visaStream: option.visa.stream || undefined,
                                occupationCode: code,
                                metadata: { info_type: rules?.infoTitle || 'Caveats' }
                              })
                              setCaveatModal({
                                show: true,
                                title: rules?.infoTitle || 'Special Requirements',
                                content: rules?.infoText || ''
                              })
                            }}
                            className="text-xs font-medium px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 flex items-center gap-1"
                          >
                            Caveats <Info className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No eligible visa options found for this occupation.
                  </p>
                )}
              </div>

              {/* Ineligible Visas - No toggle, always visible */}
              {ineligibleVisas.length > 0 && (
                <>
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-gray-300"></div>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Not available for this occupation</span>
                    <div className="flex-1 h-px bg-gray-300"></div>
                  </div>
                  <div className="space-y-3">
                    {ineligibleVisas.map((option, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg border-l-4 border-l-gray-400 border border-gray-200 p-3">
                        <div className="flex items-start justify-between mb-1">
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded font-bold text-white text-xs bg-gray-400">
                            {option.visa.subclass}
                          </span>
                          <span className="text-red-500">
                            <X className="w-4 h-4" />
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-700 text-sm">{option.visa.visa_name}</h4>
                        {option.visa.stream && (
                          <p className="text-xs text-gray-500">{formatStreamName(option.visa.stream)}</p>
                        )}
                        <p className="text-xs text-red-600 mt-1 italic">
                          {option.eligibility_reason || 'Not on required occupation list'}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ANZSCO Details Accordion */}
        {v2022Occ && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleMobileAccordion('anzscoDetails')}
              className="w-full px-4 py-4 min-h-[56px] flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 cursor-pointer select-none active:bg-blue-100 touch-manipulation"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <span className="font-bold text-blue-800 flex items-center gap-2 pointer-events-none">
                <Info className="w-5 h-5" />
                ANZSCO Details
              </span>
              <ChevronDown className={`w-5 h-5 text-blue-600 transition-transform pointer-events-none ${mobileAccordion.anzscoDetails ? 'rotate-180' : ''}`} />
            </button>
            {mobileAccordion.anzscoDetails && (
              <div className="p-4 space-y-6">
                {(() => {
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
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-semibold text-gray-700">Major Group:</span>
                              <span className="ml-1 text-gray-900">{v2022Occ.major_group} - {v2022Occ.major_group_title}</span>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-700">Unit Group:</span>
                              <span className="ml-1 text-gray-900">{v2022Occ.unit_group} - {v2022Occ.unit_group_title}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Description */}
                      {hasDescription && (
                        <div>
                          <h3 className="font-bold text-gray-900 mb-2 text-sm">Description</h3>
                          <p className="text-gray-700 text-sm leading-relaxed">{v2022Occ.description}</p>
                        </div>
                      )}

                      {/* Tasks */}
                      {hasTasks && (
                        <div>
                          <h3 className="font-bold text-gray-900 mb-2 text-sm">Tasks Include</h3>
                          <ul className="space-y-1.5">
                            {tasks.slice(0, 5).map((task, idx) => (
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
                          <h3 className="font-bold text-gray-900 mb-2 text-sm">Alternative Titles</h3>
                          <div className="flex flex-wrap gap-2">
                            {altTitles.map((title, idx) => (
                              <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs border border-blue-200">
                                {title}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Specialisations */}
                      {hasSpecs && (
                        <div>
                          <h3 className="font-bold text-gray-900 mb-2 text-sm">Specialisations</h3>
                          <div className="flex flex-wrap gap-2">
                            {specs.slice(0, 6).map((spec, idx) => (
                              <span key={idx} className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs border border-purple-200">
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Unit Group Details */}
                      {v2022Occ.unit_group && v2022Occ.unit_group_description && (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-300">
                          <h3 className="font-bold text-gray-900 mb-3 text-sm">
                            Unit Group {v2022Occ.unit_group}: {v2022Occ.unit_group_title}
                          </h3>

                          {/* Unit Group Description */}
                          <div className="mb-3">
                            <h4 className="font-semibold text-gray-900 mb-1 text-xs">Description</h4>
                            <p className="text-gray-700 text-xs leading-relaxed">
                              {v2022Occ.unit_group_description}
                            </p>
                          </div>

                          {/* Indicative Skill Level */}
                          {v2022Occ.indicative_skill_level && (
                            <div className="mb-3">
                              <h4 className="font-semibold text-gray-900 mb-1 text-xs flex items-center gap-2">
                                <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold text-xs">
                                  {v2022Occ.skill_level || '1'}
                                </span>
                                Indicative Skill Level
                              </h4>
                              <p className="text-gray-700 text-xs leading-relaxed whitespace-pre-line">
                                {v2022Occ.indicative_skill_level}
                              </p>
                            </div>
                          )}

                          {/* Related Occupations */}
                          {relatedOccupations.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2 text-xs">
                                Occupations in this Unit Group ({relatedOccupations.length})
                              </h4>
                              <div className="space-y-1.5">
                                {relatedOccupations.map((occ) => (
                                  <a
                                    key={occ.code}
                                    href={`/occupation/${occ.code}`}
                                    onClick={() => trackEvent('related_occupation_clicked', {
                                      occupationCode: code,
                                      metadata: {
                                        from_occupation: code,
                                        to_occupation: occ.code,
                                        from_title: v2022Occ.principal_title,
                                        to_title: occ.principal_title
                                      }
                                    })}
                                    className={`block px-2 py-1.5 rounded text-xs border transition-colors ${
                                      occ.code === v2022Occ.code
                                        ? 'bg-blue-100 text-blue-900 border-blue-300 font-semibold'
                                        : 'bg-white text-gray-700 border-gray-200 active:bg-gray-50'
                                    }`}
                                  >
                                    {occ.code}: {occ.principal_title}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* ABS Link */}
                      <div className="pt-4 border-t border-gray-200">
                        <a
                          href={`https://www.abs.gov.au/statistics/classifications/anzsco-australian-and-new-zealand-standard-classification-occupations/2022/browse-classification/${v2022Occ.code.substring(0,1)}/${v2022Occ.code.substring(0,2)}/${v2022Occ.code.substring(0,4)}/${v2022Occ.code}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-blue-600 text-sm font-medium"
                        >
                          View on ABS website
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </>
                  )
                })()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info Modal */}
      {caveatModal.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">{caveatModal.title}</h3>
              <button
                onClick={() => setCaveatModal({ show: false, title: '', content: '' })}
                className="p-2 hover:bg-white rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="px-8 py-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              <div className="prose prose-sm max-w-none">
                {caveatModal.content.split('\n').map((line, idx) => (
                  <p key={idx} className="mb-3 text-gray-700 leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lead Capture Widget - Always visible as chat bubble */}
      {!widgetDismissed && (
        <LeadWidget
          occupations={[...new Set(occupations.map(o => o.principal_title))]}
          isExpanded={widgetExpanded}
          onSubmit={handleLeadSubmit}
          onDismiss={() => {
            setWidgetDismissed(true)
          }}
        />
      )}
    </main>
  )
}
