'use client'

import { useState, useEffect, useRef } from 'react'
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
  type Lead,
  type LeadStatus,
  type Comment,
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
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getIntentColor(lead.intent_score)}`}
        >
          {getIntentLabel(lead.intent_score)} Intent
          {lead.intent_score ? ` (${lead.intent_score}/10)` : ''}
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
            <InfoRow icon={Briefcase} label="Current Visa" value={lead.current_visa || 'Not specified'} />
            <InfoRow icon={Clock} label="Timeline" value={formatTimeline(lead.timeline)} />
            <InfoRow
              icon={Briefcase}
              label="Occupation Researched"
              value={lead.occupation_code ? `ANZSCO ${lead.occupation_code}` : 'Not specified'}
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
