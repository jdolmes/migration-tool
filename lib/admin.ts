import { supabase } from './supabase'

export type LeadStatus = 'new' | 'contacted' | 'converted'

export interface Comment {
  id: string
  text: string
  timestamp: string
}

export interface Lead {
  id: string
  created_at: string
  name: string
  email: string
  phone: string | null
  location: string | null
  current_visa: string | null
  timeline: string | null
  message: string | null
  occupation_code: string | null
  intent_score: number | null
  status: string
  session_id: string | null
  comments: Comment[]
}

export async function getLeads(status?: string): Promise<Lead[]> {
  let query = supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching leads:', error)
    return []
  }

  return data || []
}

export async function updateLeadStatus(
  id: string,
  status: LeadStatus
): Promise<boolean> {
  const { error } = await supabase
    .from('leads')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('Error updating lead status:', error)
    return false
  }

  return true
}

export async function addComment(
  id: string,
  text: string,
  existingComments: Comment[]
): Promise<Comment[] | null> {
  const newComment: Comment = {
    id: `comment_${Date.now()}`,
    text,
    timestamp: new Date().toISOString(),
  }

  const updatedComments = [...existingComments, newComment]

  const { error } = await supabase
    .from('leads')
    .update({
      comments: updatedComments,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    console.error('Error adding comment:', error)
    return null
  }

  return updatedComments
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-AU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('en-AU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatTimeline(timeline: string | null): string {
  const map: Record<string, string> = {
    asap: 'ASAP',
    '6-12mo': '6–12 Months',
    '6-12months': '6–12 Months',
    '1-2yr': '1–2 Years',
    '1-2years': '1–2 Years',
    researching: 'Just Researching',
  }
  return timeline ? (map[timeline] || timeline) : '—'
}

export function formatLocation(location: string | null): string {
  if (!location) return '—'
  return location === 'onshore' ? '🇦🇺 Onshore' : '✈️ Offshore'
}

export function getIntentLabel(score: number | null): string {
  if (!score) return 'Low'
  if (score >= 8) return 'Very High'
  if (score >= 6) return 'High'
  if (score >= 4) return 'Medium'
  return 'Low'
}

export function getIntentColor(score: number | null): string {
  if (!score) return 'bg-gray-100 text-gray-600'
  if (score >= 8) return 'bg-purple-100 text-purple-700'
  if (score >= 6) return 'bg-green-100 text-green-700'
  if (score >= 4) return 'bg-yellow-100 text-yellow-700'
  return 'bg-gray-100 text-gray-600'
}

export interface AnalyticsEvent {
  id: number
  session_id: string
  event_type: string
  occupation_code: string | null
  visa_subclass: string | null
  visa_stream: string | null
  user_country: string | null
  search_term: string | null
  metadata: Record<string, any> | null
  created_at: string
}

export async function getLeadJourney(sessionId: string): Promise<AnalyticsEvent[]> {
  const { data, error } = await supabase
    .from('analytics_events')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching lead journey:', error)
    return []
  }

  return data || []
}

export function getEventLabel(eventType: string): string {
  const labels: Record<string, string> = {
    search_performed: 'Searched for occupation',
    occupation_viewed: 'Viewed occupation',
    tab_switched: 'Switched tab',
    lin_clicked: 'Clicked legislative instrument',
    info_button_clicked: 'Clicked visa info',
    related_occupation_clicked: 'Explored related occupation',
  }
  return labels[eventType] || eventType
}

export function getEventIcon(eventType: string): string {
  const icons: Record<string, string> = {
    search_performed: '🔍',
    occupation_viewed: '👁️',
    tab_switched: '🗂️',
    lin_clicked: '📄',
    info_button_clicked: 'ℹ️',
    related_occupation_clicked: '🔗',
  }
  return icons[eventType] || '📌'
}

export function getEventColor(eventType: string): string {
  const colors: Record<string, string> = {
    search_performed: 'border-gray-200 bg-gray-50',
    occupation_viewed: 'border-blue-200 bg-blue-50',
    tab_switched: 'border-gray-200 bg-gray-50',
    lin_clicked: 'border-purple-200 bg-purple-50',
    info_button_clicked: 'border-yellow-200 bg-yellow-50',
    related_occupation_clicked: 'border-green-200 bg-green-50',
  }
  return colors[eventType] || 'border-gray-200 bg-gray-50'
}

export function getEventDetail(event: AnalyticsEvent): string {
  switch (event.event_type) {
    case 'search_performed':
      return event.search_term ? `"${event.search_term}"` : ''
    case 'occupation_viewed':
      return event.occupation_code ? `ANZSCO ${event.occupation_code}` : ''
    case 'lin_clicked':
      return event.visa_subclass
        ? `Visa ${event.visa_subclass}${event.visa_stream ? ` (${event.visa_stream})` : ''}`
        : ''
    case 'info_button_clicked':
      return event.visa_subclass ? `Visa ${event.visa_subclass}` : ''
    case 'tab_switched':
      return event.metadata?.tab ? `→ ${event.metadata.tab}` : ''
    case 'related_occupation_clicked':
      return event.occupation_code ? `ANZSCO ${event.occupation_code}` : ''
    default:
      return ''
  }
}

export function calculateResearchDuration(
  events: AnalyticsEvent[],
  formSubmittedAt: string
): string {
  if (events.length === 0) return 'Unknown'

  const firstEvent = new Date(events[0].created_at)
  const submission = new Date(formSubmittedAt)
  const diffMs = submission.getTime() - firstEvent.getTime()

  const minutes = Math.floor(diffMs / 60000)
  const seconds = Math.floor((diffMs % 60000) / 1000)

  if (minutes === 0) return `${seconds} seconds`
  if (minutes < 60) return `${minutes} min ${seconds} sec`

  const hours = Math.floor(minutes / 60)
  const remainingMins = minutes % 60
  return `${hours}h ${remainingMins}m`
}

export interface JourneySummary {
  totalEvents: number
  occupationsViewed: number
  uniqueOccupations: number
  searchesPerformed: number
  linClicks: number
  infoButtonClicks: number
  researchDuration: string
  topVisaInterests: string[]
  country: string | null
}

export function summariseJourney(
  events: AnalyticsEvent[],
  formSubmittedAt: string
): JourneySummary {
  const occupationEvents = events.filter(e => e.event_type === 'occupation_viewed')
  const uniqueOccupations = new Set(
    occupationEvents.map(e => e.occupation_code).filter(Boolean)
  )
  const linEvents = events.filter(e => e.event_type === 'lin_clicked')
  const visaInterests = new Set(
    linEvents.map(e => e.visa_subclass).filter(Boolean)
  )

  return {
    totalEvents: events.length,
    occupationsViewed: occupationEvents.length,
    uniqueOccupations: uniqueOccupations.size,
    searchesPerformed: events.filter(e => e.event_type === 'search_performed').length,
    linClicks: linEvents.length,
    infoButtonClicks: events.filter(e => e.event_type === 'info_button_clicked').length,
    researchDuration: calculateResearchDuration(events, formSubmittedAt),
    topVisaInterests: Array.from(visaInterests) as string[],
    country: events.find(e => e.user_country)?.user_country || null,
  }
}

export async function getOccupationNames(
  codes: string[]
): Promise<Record<string, string>> {
  if (codes.length === 0) return {}

  const { data, error } = await supabase
    .from('occupations')
    .select('code, principal_title')
    .in('code', codes)

  if (error || !data) return {}

  // Return a map of code → title (deduplicated, prefer v2022)
  const map: Record<string, string> = {}
  data.forEach((row: { code: string; principal_title: string }) => {
    if (!map[row.code]) {
      map[row.code] = row.principal_title
    }
  })
  return map
}
