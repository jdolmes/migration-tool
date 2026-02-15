'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, Sparkles } from 'lucide-react'
import LeadForm from './LeadForm'

import type { LeadFormData } from './LeadForm'

interface LeadWidgetProps {
  occupations: string[]
  isExpanded?: boolean
  onSubmit: (data: LeadFormData) => void
  onDismiss: () => void
}

export default function LeadWidget({
  occupations,
  isExpanded = false,
  onSubmit,
  onDismiss,
}: LeadWidgetProps) {
  const [isMinimized, setIsMinimized] = useState(true) // Start minimized (bubble)
  const [isDismissed, setIsDismissed] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const prevIsExpandedRef = useRef(isExpanded)

  console.log('[LeadWidget] Render - isExpanded:', isExpanded, 'isMinimized:', isMinimized)

  // Auto-expand ONLY when isExpanded changes from false to true
  useEffect(() => {
    const wasExpanded = prevIsExpandedRef.current
    const nowExpanded = isExpanded

    console.log('[LeadWidget] useEffect - wasExpanded:', wasExpanded, '→ nowExpanded:', nowExpanded)

    // Detect transition: false → true
    if (!wasExpanded && nowExpanded) {
      console.log('[LeadWidget] Timer fired! Auto-expanding widget')
      setIsMinimized(false)
    }

    // Update ref for next render
    prevIsExpandedRef.current = isExpanded
  }, [isExpanded])

  const handleShowForm = () => {
    console.log('[LeadWidget] "Yes, Let\'s Talk" clicked → showing form')
    setShowForm(true)
  }

  const handleFormBack = () => {
    console.log('[LeadWidget] Form back clicked → returning to widget')
    setShowForm(false)
  }

  const handleFormSubmit = (data: LeadFormData) => {
    console.log('[LeadWidget] Form submitted, passing to parent')
    onSubmit(data)
  }

  const handleMinimize = () => {
    console.log('[LeadWidget] "Maybe Later" clicked → minimizing to bubble')
    setIsMinimized(true)
  }

  const handleExpand = () => {
    console.log('[LeadWidget] Chat bubble clicked → expanding widget')
    setIsMinimized(false)
  }

  // Format occupations for display
  const formatOccupations = () => {
    if (occupations.length === 0) return 'your occupation'
    if (occupations.length === 1) return occupations[0]
    if (occupations.length === 2) return `${occupations[0]} and ${occupations[1]}`
    return `${occupations[0]} and ${occupations.length - 1} other${occupations.length > 2 ? 's' : ''}`
  }

  if (isDismissed) {
    return null
  }

  // Show form instead of widget when user clicks "Yes, Let's Talk"
  if (showForm) {
    return (
      <LeadForm
        occupations={occupations}
        onSubmit={handleFormSubmit}
        onBack={handleFormBack}
      />
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Minimized chat bubble - always visible when minimized */}
      <button
        onClick={handleExpand}
        className={`
          absolute bottom-0 right-0
          w-14 h-14 rounded-full
          bg-gradient-to-r from-blue-600 to-indigo-600
          shadow-lg shadow-blue-500/30
          flex items-center justify-center
          transition-all duration-300 ease-in-out
          hover:scale-110 hover:shadow-xl hover:shadow-blue-500/40
          ${isMinimized ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}
        `}
        aria-label="Open chat"
      >
        <MessageCircle className="w-6 h-6 text-white" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
      </button>

      {/* Full widget */}
      <div
        className={`
          w-[360px]
          bg-white rounded-2xl
          shadow-2xl shadow-gray-300/50
          border border-gray-100
          overflow-hidden
          transition-all duration-300 ease-in-out origin-bottom-right
          ${!isMinimized ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}
        `}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Great news!</h3>
              <p className="text-blue-100 text-sm">We found pathways for you</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 py-4">
          <p className="text-gray-700 text-sm leading-relaxed">
            Based on your interest in <span className="font-semibold text-gray-900">{formatOccupations()}</span>,
            you may be eligible for <span className="font-semibold text-blue-600">multiple visa pathways</span>.
          </p>
          <p className="text-gray-600 text-sm mt-3">
            Would you like to speak with a migration specialist who can help you explore your options?
          </p>
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 space-y-2">
          <button
            onClick={handleShowForm}
            className="
              w-full py-3 px-4
              bg-gradient-to-r from-blue-600 to-indigo-600
              text-white font-medium
              rounded-xl
              shadow-lg shadow-blue-500/30
              hover:shadow-xl hover:shadow-blue-500/40
              hover:from-blue-500 hover:to-indigo-500
              transition-all duration-200
              active:scale-[0.98]
            "
          >
            Yes, Let&apos;s Talk
          </button>
          <button
            onClick={handleMinimize}
            className="
              w-full py-3 px-4
              bg-gray-50 hover:bg-gray-100
              text-gray-600 font-medium
              rounded-xl
              border border-gray-200
              transition-all duration-200
              active:scale-[0.98]
            "
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  )
}
