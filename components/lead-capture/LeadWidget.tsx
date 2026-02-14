'use client'

import { useState, useEffect } from 'react'
import { X, MessageCircle, Sparkles } from 'lucide-react'

interface LeadWidgetProps {
  occupations: string[]
  visaPathways: string[]
  onSubmit: () => void
  onDismiss: () => void
}

export default function LeadWidget({
  occupations,
  visaPathways,
  onSubmit,
  onDismiss,
}: LeadWidgetProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  // Trigger slide-in animation on mount
  useEffect(() => {
    const showTimer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(showTimer)
  }, [])

  // Auto-minimize after 10 seconds
  useEffect(() => {
    if (isMinimized || isDismissed) return

    const timer = setTimeout(() => {
      setIsMinimized(true)
    }, 10000)

    return () => clearTimeout(timer)
  }, [isMinimized, isDismissed])

  const handleDismiss = () => {
    setIsDismissed(true)
    setIsVisible(false)
    // Allow animation to complete before calling onDismiss
    setTimeout(onDismiss, 300)
  }

  const handleSubmit = () => {
    onSubmit()
  }

  const handleMaybeLater = () => {
    setIsMinimized(true)
  }

  const handleExpand = () => {
    setIsMinimized(false)
  }

  // Format occupations for display
  const formatOccupations = () => {
    if (occupations.length === 0) return 'your occupation'
    if (occupations.length === 1) return occupations[0]
    if (occupations.length === 2) return `${occupations[0]} and ${occupations[1]}`
    return `${occupations[0]} and ${occupations.length - 1} other${occupations.length > 2 ? 's' : ''}`
  }

  // Format visa pathways for display
  const formatVisaPathways = () => {
    if (visaPathways.length === 0) return 'potential visa options'
    if (visaPathways.length === 1) return `the ${visaPathways[0]}`
    return 'multiple visa pathways'
  }

  if (isDismissed && !isVisible) {
    return null
  }

  // Render both states with smooth transitions between them
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Minimized chat bubble */}
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
          ${isMinimized && isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}
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
          ${!isMinimized && isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}
        `}
      >
      {/* Header */}
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-5 py-4">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/20 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-white" />
        </button>
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
          you may be eligible for <span className="font-semibold text-blue-600">{formatVisaPathways()}</span>.
        </p>
        <p className="text-gray-600 text-sm mt-3">
          Would you like to speak with a migration specialist who can help you explore your options?
        </p>
      </div>

      {/* Actions */}
      <div className="px-5 pb-5 space-y-2">
        <button
          onClick={handleSubmit}
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
          onClick={handleMaybeLater}
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

