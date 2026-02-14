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
  if (typeof window === 'undefined') return null

  // Check if we already have the country cached for this session
  const cached = sessionStorage.getItem('user_country')
  if (cached && cached !== 'null') return cached

  try {
    const response = await fetch('https://ipapi.co/json/')
    const data = await response.json()
    const country = data.country_code || null

    // Cache the result (even if null, to avoid repeated failed requests)
    if (country) {
      sessionStorage.setItem('user_country', country)
    } else {
      sessionStorage.setItem('user_country', 'null')
    }

    return country
  } catch (error) {
    console.error('Failed to get user country:', error)
    // Cache the failure to avoid repeated requests
    sessionStorage.setItem('user_country', 'null')
    return null
  }
}

// Track an analytics event
export async function trackEvent(
  eventType: string,
  data?: {
    occupationCode?: string | null
    visaSubclass?: string | null
    visaStream?: string | null
    searchTerm?: string | null
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
