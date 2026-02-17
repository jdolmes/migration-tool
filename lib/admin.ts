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
