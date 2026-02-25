'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Clock,
  Briefcase,
  MessageSquare,
  Send,
  CheckCircle,
  ChevronDown,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import {
  formatDate,
  formatDateTime,
  formatTimeline,
  formatLocation,
  getIntentLabel,
  getIntentColor,
  updateLeadStatus,
  addComment,
  getLeadJourney,
  getEventLabel,
  getEventIcon,
  getEventColor,
  getEventDetail,
  summariseJourney,
  getOccupationNames,
  calculateIntentScore,
  getIntentLabelFromScore,
  getIntentColorFromScore,
  type Lead,
  type LeadStatus,
  type Comment,
  type AnalyticsEvent,
  type JourneySummary,
} from '@/lib/admin'

const STATUS_OPTIONS: { label: string; value: LeadStatus; color: string; selected: string }[] = [
  {
    label: 'New',
    value: 'new',
    color: 'border-gray-200 text-gray-600 hover:border-gray-300',
    selected: 'border-blue-500 bg-blue-50 text-blue-700',
  },
  {
    label: 'Contacted',
    value: 'contacted',
    color: 'border-gray-200 text-gray-600 hover:border-gray-300',
    selected: 'border-yellow-500 bg-yellow-50 text-yellow-700',
  },
  {
    label: 'Converted',
    value: 'converted',
    color: 'border-gray-200 text-gray-600 hover:border-gray-300',
    selected: 'border-green-500 bg-green-50 text-green-700',
  },
]

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string | null | undefined
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-blue-600" />
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value || '—'}</p>
      </div>
    </div>
  )
}

function CommentBubble({ comment }: { comment: Comment }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
        <p className="text-sm text-gray-800">{comment.text}</p>
      </div>
      <p className="text-xs text-gray-400 px-1">
        {formatDateTime(comment.timestamp)}
      </p>
    </div>
  )
}

export default function LeadDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const commentsEndRef = useRef<HTMLDivElement>(null)

  const [lead, setLead] = useState<Lead | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState<LeadStatus>('new')
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isAddingComment, setIsAddingComment] = useState(false)
  const [isSavingStatus, setIsSavingStatus] = useState(false)
  const [statusSaved, setStatusSaved] = useState(false)
  const [journey, setJourney] = useState<AnalyticsEvent[]>([])
  const [isLoadingJourney, setIsLoadingJourney] = useState(true)
  const [summary, setSummary] = useState<JourneySummary | null>(null)
  const [realIntentScore, setRealIntentScore] = useState<number | null>(null)
  const [occupationNames, setOccupationNames] = useState<Record<string, string>>({})
  const [expandedOccupations, setExpandedOccupations] = useState<Set<string>>(new Set())
  const [expandedRepeatViews, setExpandedRepeatViews] = useState<Set<string>>(new Set())
  const [showNoiseForSession, setShowNoiseForSession] = useState<Set<number>>(new Set())

  // Process journey events into session-based timeline structure
  type SubAction = {
    type: 'anzsco_details' | 'lin_clicked' | 'info_clicked'
    event: AnalyticsEvent
  }

  type TimelineItem =
    | { type: 'search'; event: AnalyticsEvent; isNoise?: boolean }
    | {
        type: 'occupation'
        code: string
        event: AnalyticsEvent
        isFirstView: boolean
        subActions: SubAction[]
      }
    | { type: 'repeat_views'; code: string; count: number; events: AnalyticsEvent[] }
    | { type: 'noise'; event: AnalyticsEvent; reason: string }

  type Session = {
    sessionNumber: number
    startTime: string
    gapFromPrevious: number | null // milliseconds
    items: TimelineItem[]
    noiseItems: TimelineItem[]
  }

  const processedSessions = useMemo((): Session[] => {
    if (journey.length === 0) return []

    const SESSION_GAP_MS = 30 * 60 * 1000 // 30 minutes

    // First, identify partial searches (where a longer search immediately follows)
    const partialSearchIndices = new Set<number>()
    for (let i = 0; i < journey.length - 1; i++) {
      const current = journey[i]
      const next = journey[i + 1]
      if (
        current.event_type === 'search_performed' &&
        next.event_type === 'search_performed' &&
        current.search_term &&
        next.search_term &&
        next.search_term.toLowerCase().startsWith(current.search_term.toLowerCase()) &&
        next.search_term.length > current.search_term.length
      ) {
        partialSearchIndices.add(i)
      }
    }

    // Split events into sessions based on time gaps, storing events with each session
    type RawSession = {
      startTime: string
      events: { event: AnalyticsEvent; originalIndex: number }[]
    }
    const rawSessions: RawSession[] = []
    let currentSession: RawSession | null = null

    for (let i = 0; i < journey.length; i++) {
      const event = journey[i]
      const prevEvent = i > 0 ? journey[i - 1] : null

      const shouldStartNewSession = !currentSession || (
        prevEvent &&
        new Date(event.created_at).getTime() - new Date(prevEvent.created_at).getTime() >= SESSION_GAP_MS
      )

      if (shouldStartNewSession) {
        if (currentSession) {
          rawSessions.push(currentSession)
        }
        currentSession = {
          startTime: event.created_at,
          events: [],
        }
      }

      currentSession!.events.push({ event, originalIndex: i })
    }

    // Push the last session
    if (currentSession && currentSession.events.length > 0) {
      rawSessions.push(currentSession)
    }

    // Now process each session's events into timeline items
    const sessions: Session[] = rawSessions.map((rawSession, sessionIdx) => {
      const session: Session = {
        sessionNumber: sessionIdx + 1,
        startTime: rawSession.startTime,
        gapFromPrevious: sessionIdx > 0
          ? new Date(rawSession.startTime).getTime() - new Date(rawSessions[sessionIdx - 1].startTime).getTime()
          : null,
        items: [],
        noiseItems: [],
      }

      const seenOccupationsInSession = new Set<string>()
      const repeatViewsMap: Record<string, AnalyticsEvent[]> = {}
      let currentOccupation: string | null = null

      // First pass: collect sub-actions per occupation
      const occupationSubActions: Record<string, SubAction[]> = {}
      const occupationHasAnzscoDetails: Record<string, boolean> = {}

      for (const { event } of rawSession.events) {
        if (event.event_type === 'occupation_viewed' && event.occupation_code) {
          currentOccupation = event.occupation_code
          if (!occupationSubActions[event.occupation_code]) {
            occupationSubActions[event.occupation_code] = []
            occupationHasAnzscoDetails[event.occupation_code] = false
          }
        }

        const occupationCode = event.occupation_code || currentOccupation
        if (occupationCode && occupationSubActions[occupationCode]) {
          if (event.event_type === 'tab_switched') {
            const tabId = event.metadata?.to || event.metadata?.tab
            if (tabId === 'anzsco-details' && !occupationHasAnzscoDetails[occupationCode]) {
              occupationHasAnzscoDetails[occupationCode] = true
              occupationSubActions[occupationCode].push({ type: 'anzsco_details', event })
            }
          }
          if (event.event_type === 'lin_clicked') {
            occupationSubActions[occupationCode].push({ type: 'lin_clicked', event })
          }
          if (event.event_type === 'info_button_clicked') {
            occupationSubActions[occupationCode].push({ type: 'info_clicked', event })
          }
        }
      }

      // Reset for second pass
      currentOccupation = null

      // Second pass: build timeline items
      for (const { event, originalIndex } of rawSession.events) {
        // Handle search events
        if (event.event_type === 'search_performed') {
          if (partialSearchIndices.has(originalIndex)) {
            session.noiseItems.push({
              type: 'noise',
              event,
              reason: 'Partial search',
            })
          } else {
            session.items.push({ type: 'search', event })
          }
          continue
        }

        // Handle occupation views
        if (event.event_type === 'occupation_viewed' && event.occupation_code) {
          currentOccupation = event.occupation_code

          if (!seenOccupationsInSession.has(event.occupation_code)) {
            // First view in this session
            seenOccupationsInSession.add(event.occupation_code)
            session.items.push({
              type: 'occupation',
              code: event.occupation_code,
              event,
              isFirstView: true,
              subActions: occupationSubActions[event.occupation_code] || [],
            })
          } else {
            // Repeat view - collect for grouping
            if (!repeatViewsMap[event.occupation_code]) {
              repeatViewsMap[event.occupation_code] = []
            }
            repeatViewsMap[event.occupation_code].push(event)
          }
          continue
        }

        // Handle tab switches to visa-options (noise)
        if (event.event_type === 'tab_switched') {
          const tabId = event.metadata?.to || event.metadata?.tab
          if (tabId === 'visa-options') {
            session.noiseItems.push({
              type: 'noise',
              event,
              reason: 'Default tab switch',
            })
          }
          continue
        }

        // Other events are sub-actions or not shown
      }

      // Add repeat view groups after first view of each occupation
      const finalItems: TimelineItem[] = []
      for (const item of session.items) {
        finalItems.push(item)
        if (item.type === 'occupation' && repeatViewsMap[item.code]) {
          finalItems.push({
            type: 'repeat_views',
            code: item.code,
            count: repeatViewsMap[item.code].length,
            events: repeatViewsMap[item.code],
          })
        }
      }
      session.items = finalItems

      return session
    })

    return sessions
  }, [journey])

  const toggleOccupationExpand = (code: string) => {
    setExpandedOccupations(prev => {
      const next = new Set(prev)
      if (next.has(code)) {
        next.delete(code)
      } else {
        next.add(code)
      }
      return next
    })
  }

  const toggleRepeatViews = (key: string) => {
    setExpandedRepeatViews(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const toggleSessionNoise = (sessionNumber: number) => {
    setShowNoiseForSession(prev => {
      const next = new Set(prev)
      if (next.has(sessionNumber)) {
        next.delete(sessionNumber)
      } else {
        next.add(sessionNumber)
      }
      return next
    })
  }

  const formatTimeGap = (ms: number): string => {
    const minutes = Math.floor(ms / 60000)
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''} later`
    }
    return `${minutes} minute${minutes !== 1 ? 's' : ''} later`
  }

  const formatSessionTime = (timestamp: string): string => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
    }) + ', ' + date.toLocaleTimeString('en-AU', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).toLowerCase()
  }

  useEffect(() => {
    const fetchLead = async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        console.error('Error fetching lead:', error)
        router.push('/admin/leads')
        return
      }

      setLead(data)
      setStatus(data.status as LeadStatus)
      setComments(data.comments || [])
      setIsLoading(false)
    }

    fetchLead()
  }, [id, router])

  // Scroll to bottom of comments when new one added
  useEffect(() => {
    if (comments.length > 0) {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [comments])

  useEffect(() => {
    const fetchJourney = async () => {
      if (!lead?.session_id) {
        setIsLoadingJourney(false)
        return
      }

      const events = await getLeadJourney(lead.session_id)
      setJourney(events)

      // Build summary
      const journeySummary = summariseJourney(events, lead.created_at)
      setSummary(journeySummary)

      const realScore = calculateIntentScore(events, {
        timeline: lead.timeline,
        location: lead.location,
        created_at: lead.created_at,
      })
      setRealIntentScore(realScore)

      // Get occupation names for all unique codes in journey
      const codes = [
        ...new Set(
          events
            .map(e => e.occupation_code)
            .filter(Boolean) as string[]
        )
      ]
      if (lead.occupation_code) codes.push(lead.occupation_code)
      const names = await getOccupationNames([...new Set(codes)])
      setOccupationNames(names)

      setIsLoadingJourney(false)
    }
    fetchJourney()
  }, [lead])

  const handleSaveStatus = async () => {
    if (!lead) return
    setIsSavingStatus(true)
    await updateLeadStatus(id, status)
    setIsSavingStatus(false)
    setStatusSaved(true)
    setTimeout(() => setStatusSaved(false), 3000)
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !lead) return
    setIsAddingComment(true)

    const updated = await addComment(id, newComment.trim(), comments)
    if (updated) {
      setComments(updated)
      setNewComment('')
    }

    setIsAddingComment(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleAddComment()
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <p className="ml-3 text-gray-600">Loading lead...</p>
        </div>
      </div>
    )
  }

  if (!lead) return null

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => router.push('/admin/leads')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Lead Inbox
      </button>

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            {lead.name}
          </h1>
          <p className="text-gray-500 text-sm">
            Submitted {formatDate(lead.created_at)}
          </p>
        </div>
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getIntentColorFromScore(realIntentScore ?? lead.intent_score ?? 3)}`}
        >
          {getIntentLabelFromScore(realIntentScore ?? lead.intent_score ?? 3)} Intent
          {` (${realIntentScore ?? lead.intent_score ?? 3})`}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Contact Info + Comments */}
        <div className="col-span-2 space-y-6">

          {/* Contact Details Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Contact Information
            </h2>
            <InfoRow icon={Mail} label="Email" value={lead.email} />
            <InfoRow icon={Phone} label="Phone" value={lead.phone || 'Not provided'} />
            <InfoRow icon={MapPin} label="Location" value={formatLocation(lead.location)} />
            <InfoRow
              icon={MapPin}
              label="Country"
              value={summary?.country ? `🌏 ${summary.country}` : 'Unknown'}
            />
            <InfoRow icon={Briefcase} label="Current Visa" value={lead.current_visa || 'Not specified'} />
            <InfoRow icon={Clock} label="Timeline" value={formatTimeline(lead.timeline)} />
            <InfoRow
              icon={Briefcase}
              label="Occupation Researched"
              value={
                lead.occupation_code
                  ? `ANZSCO ${lead.occupation_code}${occupationNames[lead.occupation_code] ? ` — ${occupationNames[lead.occupation_code]}` : ''}`
                  : 'Not specified'
              }
            />
          </div>

          {/* Message from Lead */}
          {lead.message && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Message from Lead
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 rounded-lg p-4 italic">
                "{lead.message}"
              </p>
            </div>
          )}

          {/* Comments / Activity Log */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Comments
              {comments.length > 0 && (
                <span className="ml-1 bg-blue-100 text-blue-700 text-xs rounded-full px-2 py-0.5">
                  {comments.length}
                </span>
              )}
            </h2>

            {/* Comments Feed */}
            <div className="space-y-4 mb-4 max-h-64 overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">
                  No comments yet. Add one below.
                </p>
              ) : (
                comments.map((comment) => (
                  <CommentBubble key={comment.id} comment={comment} />
                ))
              )}
              <div ref={commentsEndRef} />
            </div>

            {/* Add Comment Input */}
            <div className="border-t border-gray-100 pt-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add a comment... (Cmd+Enter to submit)"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-2"
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-400">
                  Comments are timestamped and private to RMAs
                </p>
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || isAddingComment}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-3 h-3" />
                  {isAddingComment ? 'Saving...' : 'Add Comment'}
                </button>
              </div>
            </div>
          </div>

          {/* Research Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              📊 Research Summary
            </h2>

            {!summary ? (
              <p className="text-sm text-gray-400 text-center py-4">No data available</p>
            ) : (
              <div className="space-y-4">

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-semibold text-blue-700">
                      {summary.uniqueOccupations}
                    </p>
                    <p className="text-xs text-blue-600 mt-0.5">
                      Occupation{summary.uniqueOccupations !== 1 ? 's' : ''} Explored
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-semibold text-gray-700">
                      {summary.searchesPerformed}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Search{summary.searchesPerformed !== 1 ? 'es' : ''} Performed
                    </p>
                  </div>
                  <div className={`rounded-lg p-3 text-center ${summary.linClicks > 0 ? 'bg-purple-50' : 'bg-gray-50'}`}>
                    <p className={`text-2xl font-semibold ${summary.linClicks > 0 ? 'text-purple-700' : 'text-gray-700'}`}>
                      {summary.linClicks}
                    </p>
                    <p className={`text-xs mt-0.5 ${summary.linClicks > 0 ? 'text-purple-600' : 'text-gray-600'}`}>
                      LIN Click{summary.linClicks !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-indigo-50 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎯</span>
                    <span className="text-sm font-medium text-gray-700">Intent Score</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getIntentColorFromScore(realIntentScore ?? lead.intent_score ?? 3)}`}>
                      {getIntentLabelFromScore(realIntentScore ?? lead.intent_score ?? 3)}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {realIntentScore ?? lead.intent_score ?? 3} pts
                    </span>
                  </div>
                </div>

                {/* Research Duration */}
                <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🕐</span>
                    <span className="text-sm font-medium text-gray-700">Total Research Time</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {summary.researchDuration}
                  </span>
                </div>

                {/* Visa Interests */}
                {summary.topVisaInterests.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Visa subclasses researched:</p>
                    <div className="flex flex-wrap gap-2">
                      {summary.topVisaInterests.map(visa => (
                        <span
                          key={visa}
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700"
                        >
                          Visa {visa}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Occupations Explored */}
                {summary.uniqueOccupations > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Occupations explored:</p>
                    <div className="space-y-1">
                      {[...new Set(
                        journey
                          .filter(e => e.event_type === 'occupation_viewed' && e.occupation_code)
                          .map(e => e.occupation_code as string)
                      )].map(code => (
                        <div key={code} className="flex items-center gap-2 text-xs">
                          <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                            {code}
                          </span>
                          <span className="text-gray-700">
                            {occupationNames[code] || 'Loading...'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

          {/* Research Journey */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-1 flex items-center gap-2">
              🗺️ Research Journey
              {journey.length > 0 && (
                <span className="ml-1 bg-indigo-100 text-indigo-700 text-xs rounded-full px-2 py-0.5">
                  {journey.length} events
                </span>
              )}
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Everything this person did before submitting their enquiry
            </p>

            {isLoadingJourney ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                <p className="ml-2 text-sm text-gray-500">Loading journey...</p>
              </div>
            ) : journey.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-400">
                  {lead.session_id
                    ? 'No tracked activity found for this session'
                    : 'No session data available for this lead'}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {processedSessions.map((session, sessionIndex) => (
                  <div key={session.sessionNumber}>
                    {/* Session Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-1 h-px bg-gray-200" />
                      <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
                        Session {session.sessionNumber} — {formatSessionTime(session.startTime)}
                      </span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    {/* Time gap from previous session */}
                    {session.gapFromPrevious && (
                      <p className="text-xs text-gray-400 italic text-center mb-3 -mt-1">
                        {formatTimeGap(session.gapFromPrevious)}
                      </p>
                    )}

                    {/* Session Items */}
                    <div className="space-y-2">
                      {session.items.map((item, itemIndex) => {
                        // Search event
                        if (item.type === 'search') {
                          return (
                            <div key={item.event.id} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm">🔍</span>
                                  <span className="text-sm font-medium text-gray-800">
                                    Searched
                                  </span>
                                  {item.event.search_term && (
                                    <span className="text-sm text-gray-600">
                                      "{item.event.search_term}"
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                                  {formatDateTime(item.event.created_at)}
                                </span>
                              </div>
                            </div>
                          )
                        }

                        // Occupation view (first view in session)
                        if (item.type === 'occupation') {
                          const hasSubActions = item.subActions.length > 0
                          const isExpanded = expandedOccupations.has(`${session.sessionNumber}-${item.code}`)
                          const name = occupationNames[item.code]
                          const displayName = name
                            ? `${name} (${item.code})`
                            : `ANZSCO ${item.code}`

                          return (
                            <div key={`occ-${session.sessionNumber}-${item.code}`}>
                              <div
                                className={`rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 ${
                                  hasSubActions ? 'cursor-pointer hover:bg-blue-100 transition-colors' : ''
                                }`}
                                onClick={hasSubActions ? () => toggleOccupationExpand(`${session.sessionNumber}-${item.code}`) : undefined}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-sm">👁️</span>
                                    <span className="text-sm font-medium text-gray-800">
                                      Viewed {displayName}
                                    </span>
                                    {hasSubActions && (
                                      <ChevronDown
                                        className={`w-4 h-4 text-gray-400 transition-transform ${
                                          isExpanded ? 'rotate-180' : ''
                                        }`}
                                      />
                                    )}
                                  </div>
                                  <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                                    {formatDateTime(item.event.created_at)}
                                  </span>
                                </div>
                              </div>

                              {/* Nested sub-actions */}
                              {isExpanded && hasSubActions && (
                                <div className="ml-4 pl-3 border-l-2 border-blue-200 space-y-1.5 mt-1.5 mb-1">
                                  {item.subActions.map((subAction) => {
                                    let icon = '📄'
                                    let label = ''
                                    let isHighIntent = false

                                    if (subAction.type === 'anzsco_details') {
                                      icon = '🗂️'
                                      label = 'Switched to ANZSCO Details'
                                    } else if (subAction.type === 'lin_clicked') {
                                      icon = '📄'
                                      isHighIntent = true
                                      const visa = subAction.event.visa_subclass
                                      const stream = subAction.event.visa_stream
                                      label = visa
                                        ? `Clicked LIN — Visa ${visa}${stream ? ` (${stream})` : ''}`
                                        : 'Clicked LIN'
                                    } else if (subAction.type === 'info_clicked') {
                                      icon = 'ℹ️'
                                      const visa = subAction.event.visa_subclass
                                      label = visa ? `Clicked visa info — Visa ${visa}` : 'Clicked visa info'
                                    }

                                    return (
                                      <div
                                        key={subAction.event.id}
                                        className={`flex items-center justify-between text-xs py-1.5 px-2 rounded ${
                                          isHighIntent
                                            ? 'bg-purple-50 border border-purple-200'
                                            : 'bg-white border border-gray-100'
                                        }`}
                                      >
                                        <span className={`flex items-center gap-1.5 ${isHighIntent ? 'text-purple-700 font-medium' : 'text-gray-600'}`}>
                                          <span>{icon}</span>
                                          {label}
                                        </span>
                                        <span className="text-gray-400">
                                          {formatDateTime(subAction.event.created_at)}
                                        </span>
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          )
                        }

                        // Repeat views (collapsible)
                        if (item.type === 'repeat_views') {
                          const repeatKey = `${session.sessionNumber}-${item.code}-repeat`
                          const isExpanded = expandedRepeatViews.has(repeatKey)
                          const name = occupationNames[item.code]

                          return (
                            <div key={repeatKey} className="ml-4">
                              <button
                                onClick={() => toggleRepeatViews(repeatKey)}
                                className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
                              >
                                <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                viewed again {item.count} time{item.count !== 1 ? 's' : ''}
                              </button>
                              {isExpanded && (
                                <div className="mt-1.5 space-y-1 pl-4 border-l border-gray-200">
                                  {item.events.map((event) => (
                                    <div key={event.id} className="text-xs text-gray-400 py-1">
                                      Viewed {name || `ANZSCO ${item.code}`} — {formatDateTime(event.created_at)}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        }

                        return null
                      })}

                      {/* Noise toggle */}
                      {session.noiseItems.length > 0 && (
                        <div className="mt-2">
                          <button
                            onClick={() => toggleSessionNoise(session.sessionNumber)}
                            className="text-xs text-gray-400 hover:text-gray-500 transition-colors"
                          >
                            {showNoiseForSession.has(session.sessionNumber)
                              ? '− hide noise'
                              : `+ show noise (${session.noiseItems.length})`}
                          </button>
                          {showNoiseForSession.has(session.sessionNumber) && (
                            <div className="mt-1.5 space-y-1 pl-2 border-l border-gray-100">
                              {session.noiseItems.map((noiseItem) => {
                                if (noiseItem.type === 'noise') {
                                  return (
                                    <div key={noiseItem.event.id} className="text-xs text-gray-400 py-0.5">
                                      <span className="text-gray-300">{noiseItem.reason}:</span>{' '}
                                      {noiseItem.event.search_term && `"${noiseItem.event.search_term}"`}
                                      {noiseItem.event.event_type === 'tab_switched' && 'switched to visa-options'}
                                    </div>
                                  )
                                }
                                return null
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Final event - form submitted */}
                <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">✅</span>
                      <span className="text-sm font-medium text-green-800">
                        Submitted consultation request
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatDateTime(lead.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Status + Actions */}
        <div className="space-y-6">

          {/* Status Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Lead Status
            </h2>
            <div className="space-y-2 mb-4">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setStatus(option.value)}
                  className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                    status === option.value ? option.selected : option.color
                  }`}
                >
                  {option.value === 'new' && '🔵 '}
                  {option.value === 'contacted' && '🟡 '}
                  {option.value === 'converted' && '🟢 '}
                  {option.label}
                </button>
              ))}
            </div>
            <button
              onClick={handleSaveStatus}
              disabled={isSavingStatus}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                statusSaved
                  ? 'bg-green-600 text-white'
                  : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white hover:shadow-lg'
              } disabled:opacity-50`}
            >
              {statusSaved ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Status Saved!
                </>
              ) : isSavingStatus ? 'Saving...' : 'Save Status'}
            </button>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <a
                href={`mailto:${lead.email}`}
                className="flex items-center gap-2 w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Send Email
              </a>
              {lead.phone && (
                <a
                  href={`tel:${lead.phone}`}
                  className="flex items-center gap-2 w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  Call Lead
                </a>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
