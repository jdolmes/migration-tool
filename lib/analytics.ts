import { supabase } from './supabase'

// Generate or retrieve session ID
function getSessionId(): string {
  if (typeof window === 'undefined') return 'server'
  
  let sessionId = sessionStorage.getItem('session_id')
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem('session_id', sessionId)
  }
  return sessionId
}

// Get user's country from IP (using a free service)
async function getUserCountry(): Promise<string | null> {
  try {
    const response = await fetch('https://ipapi.co/json/')
    const data = await response.json()
    return data.country_code || null
  } catch (error) {
    console.error('Failed to get user country:', error)
    return null
  }
}

// Track an analytics event
export async function trackEvent(
  eventType: string,
  data?: {
    occupationCode?: string
    visaSubclass?: string
    visaStream?: string
    searchTerm?: string
    metadata?: Record<string, any>
  }
) {
  try {
    const sessionId = getSessionId()
    const userCountry = await getUserCountry()

    await supabase.from('analytics_events').insert({
      session_id: sessionId,
      event_type: eventType,
      occupation_code: data?.occupationCode,
      visa_subclass: data?.visaSubclass,
      visa_stream: data?.visaStream,
      user_country: userCountry,
      search_term: data?.searchTerm,
      metadata: data?.metadata,
    })
  } catch (error) {
    // Silently fail - don't break the app if analytics fails
    console.error('Analytics tracking error:', error)
  }
}
