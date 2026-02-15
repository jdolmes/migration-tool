'use client'

import { useState } from 'react'
import { ArrowLeft, Calendar, CheckCircle, ChevronDown, Loader2, Lock, Send, Sparkles } from 'lucide-react'

export interface LeadFormData {
  name: string
  email: string
  phone: string
  location: 'onshore' | 'offshore' | ''
  currentVisa?: string
  timeline: string
  message?: string
  privacyAccepted: boolean
}

interface LeadFormProps {
  occupations: string[]
  onSubmit: (data: LeadFormData) => void
  onBack: () => void
}

interface ValidationErrors {
  name?: string
  email?: string
  phone?: string
  location?: string
  currentVisa?: string
  timeline?: string
  privacyAccepted?: string
}

const VISA_OPTIONS = [
  'Student',
  'Work',
  'Tourist',
  'Permanent Resident',
  'Other',
]

const TIMELINE_OPTIONS = [
  { value: 'asap', label: 'Within 3 months (ASAP)' },
  { value: '6-12months', label: '6-12 months' },
  { value: '1-2years', label: '1-2 years' },
  { value: 'researching', label: 'Just researching' },
]

export default function LeadForm({
  occupations,
  onSubmit,
  onBack,
}: LeadFormProps) {
  const [formData, setFormData] = useState<LeadFormData>({
    name: '',
    email: '',
    phone: '',
    location: '',
    currentVisa: '',
    timeline: '',
    message: '',
    privacyAccepted: false,
  })
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string): boolean => {
    if (!phone) return true // Optional field
    // Allow various phone formats: +1234567890, (123) 456-7890, 123-456-7890, etc.
    const phoneRegex = /^[\d\s\-\+\(\)]{8,20}$/
    return phoneRegex.test(phone)
  }

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    if (!formData.location) {
      newErrors.location = 'Please select your current location'
    }

    if (formData.location === 'onshore' && !formData.currentVisa) {
      newErrors.currentVisa = 'Please select your current visa type'
    }

    if (!formData.timeline) {
      newErrors.timeline = 'Please select your timeline'
    }

    if (!formData.privacyAccepted) {
      newErrors.privacyAccepted = 'You must accept the privacy policy'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSubmitting(false)
    setIsSubmitted(true)

    // Call parent onSubmit after showing success
    setTimeout(() => {
      onSubmit(formData)
    }, 1500)
  }

  const handleInputChange = (field: keyof LeadFormData, value: string | boolean) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value }
      // Clear currentVisa if location changes to offshore
      if (field === 'location' && value === 'offshore') {
        updated.currentVisa = ''
      }
      return updated
    })
    // Clear error when user starts typing
    if (errors[field as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
    // Also clear currentVisa error if location changes
    if (field === 'location' && errors.currentVisa) {
      setErrors((prev) => ({ ...prev, currentVisa: undefined }))
    }
  }

  // Format occupations for display
  const formatOccupations = () => {
    if (occupations.length === 0) return 'your occupation'
    if (occupations.length === 1) return occupations[0]
    if (occupations.length === 2) return `${occupations[0]} and ${occupations[1]}`
    return `${occupations[0]} and ${occupations.length - 1} other${occupations.length > 2 ? 's' : ''}`
  }

  // Success state
  if (isSubmitted) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div
          className="
            w-[360px] sm:w-[400px]
            bg-white rounded-2xl
            shadow-2xl shadow-gray-300/50
            border border-gray-100
            overflow-hidden
            animate-in fade-in duration-300
          "
        >
          <div className="relative bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Thank you!</h3>
                <p className="text-green-100 text-sm">We&apos;ll be in touch soon</p>
              </div>
            </div>
          </div>
          <div className="px-5 py-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-5" />

            {/* Calendly Booking Section */}
            <div className="space-y-3">
              <h4 className="text-gray-900 font-semibold text-sm">
                Want to speak sooner?
              </h4>
              <p className="text-gray-600 text-xs">
                Book your free 30-minute consultation
              </p>
              <a
                href="https://calendly.com/your-account/migration-consultation"
                target="_blank"
                rel="noopener noreferrer"
                className="
                  inline-flex items-center justify-center gap-2
                  w-full py-3 px-4
                  bg-gradient-to-r from-blue-600 to-indigo-600
                  text-white font-medium text-sm
                  rounded-xl
                  shadow-lg shadow-blue-500/30
                  hover:shadow-xl hover:shadow-blue-500/40
                  hover:from-blue-500 hover:to-indigo-500
                  transition-all duration-200
                  active:scale-[0.98]
                "
              >
                <Calendar className="w-4 h-4" />
                Book a Consultation
              </a>
              <p className="text-gray-500 text-xs">
                Or we&apos;ll email you within 24 hours
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div
        className="
          w-[360px] sm:w-[400px]
          bg-white rounded-2xl
          shadow-2xl shadow-gray-300/50
          border border-gray-100
          overflow-hidden
          animate-in slide-in-from-right duration-300
          max-h-[90vh] overflow-y-auto
        "
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-5 py-4">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="
                w-10 h-10 rounded-full bg-white/20
                flex items-center justify-center
                hover:bg-white/30 transition-colors
                active:scale-95
              "
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h3 className="text-white font-semibold">Get Expert Help</h3>
              <p className="text-blue-100 text-sm">Tell us how to reach you</p>
            </div>
          </div>
        </div>

        {/* Context Banner */}
        <div className="px-5 py-3 bg-blue-50 border-b border-blue-100">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-700">
              <p className="font-medium">Your research:</p>
              <p className="mt-0.5">
                <span className="text-blue-900">{formatOccupations()}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`
                w-full px-4 py-2.5 rounded-xl
                border ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'}
                focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                transition-colors text-sm
              `}
              placeholder="Your full name"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`
                w-full px-4 py-2.5 rounded-xl
                border ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'}
                focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                transition-colors text-sm
              `}
              placeholder="your@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`
                w-full px-4 py-2.5 rounded-xl
                border ${errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200'}
                focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                transition-colors text-sm
              `}
              placeholder="+61 400 000 000"
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
            )}
          </div>

          {/* Current Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Location <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleInputChange('location', 'onshore')}
                className={`
                  flex-1 py-2.5 px-3 rounded-xl text-sm font-medium
                  border transition-all duration-200
                  ${formData.location === 'onshore'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/30'
                    : errors.location
                      ? 'bg-red-50 text-gray-600 border-red-300 hover:bg-red-100'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }
                `}
              >
                In Australia (onshore)
              </button>
              <button
                type="button"
                onClick={() => handleInputChange('location', 'offshore')}
                className={`
                  flex-1 py-2.5 px-3 rounded-xl text-sm font-medium
                  border transition-all duration-200
                  ${formData.location === 'offshore'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/30'
                    : errors.location
                      ? 'bg-red-50 text-gray-600 border-red-300 hover:bg-red-100'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }
                `}
              >
                Outside Australia (offshore)
              </button>
            </div>
            {errors.location && (
              <p className="mt-1 text-xs text-red-600">{errors.location}</p>
            )}
          </div>

          {/* Current Visa Type - Conditional */}
          {formData.location === 'onshore' && (
            <div className="animate-in slide-in-from-top-2 duration-200">
              <label htmlFor="currentVisa" className="block text-sm font-medium text-gray-700 mb-1">
                Current Visa Type <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="currentVisa"
                  value={formData.currentVisa}
                  onChange={(e) => handleInputChange('currentVisa', e.target.value)}
                  className={`
                    w-full px-4 py-2.5 rounded-xl
                    border ${errors.currentVisa ? 'border-red-300 bg-red-50' : 'border-gray-200'}
                    focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                    transition-colors text-sm
                    appearance-none bg-white
                    ${!formData.currentVisa ? 'text-gray-400' : 'text-gray-900'}
                  `}
                >
                  <option value="" disabled>Select your current visa</option>
                  {VISA_OPTIONS.map((visa) => (
                    <option key={visa} value={visa}>{visa}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              {errors.currentVisa && (
                <p className="mt-1 text-xs text-red-600">{errors.currentVisa}</p>
              )}
            </div>
          )}

          {/* Timeline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timeline <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TIMELINE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleInputChange('timeline', option.value)}
                  className={`
                    py-2.5 px-3 rounded-xl text-sm font-medium
                    border transition-all duration-200
                    ${formData.timeline === option.value
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/30'
                      : errors.timeline
                        ? 'bg-red-50 text-gray-600 border-red-300 hover:bg-red-100'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {errors.timeline && (
              <p className="mt-1 text-xs text-red-600">{errors.timeline}</p>
            )}
          </div>

          {/* Brief Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Brief Message <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <textarea
              id="message"
              rows={3}
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              className="
                w-full px-4 py-2.5 rounded-xl
                border border-gray-200
                focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                transition-colors text-sm
                resize-none
              "
              placeholder="Anything else we should know about your situation?"
            />
          </div>

          {/* Privacy Policy Checkbox */}
          <div>
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={formData.privacyAccepted}
                  onChange={(e) => handleInputChange('privacyAccepted', e.target.checked)}
                  className="sr-only peer"
                />
                <div
                  className={`
                    w-5 h-5 rounded-md border-2
                    flex items-center justify-center
                    transition-all duration-200
                    ${formData.privacyAccepted
                      ? 'bg-blue-600 border-blue-600'
                      : errors.privacyAccepted
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300 group-hover:border-gray-400'
                    }
                  `}
                >
                  {formData.privacyAccepted && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-xs text-gray-600 leading-relaxed">
                I agree to the{' '}
                <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline" onClick={(e) => e.stopPropagation()}>
                  Privacy Policy
                </a>{' '}
                and consent to being contacted about migration services.
                <span className="text-red-500"> *</span>
              </span>
            </label>
            {errors.privacyAccepted && (
              <p className="mt-1 text-xs text-red-600 ml-8">{errors.privacyAccepted}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
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
              disabled:opacity-70 disabled:cursor-not-allowed
              flex items-center justify-center gap-2
            "
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send My Details
              </>
            )}
          </button>

          {/* Security Notice */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
            <Lock className="w-3.5 h-3.5" />
            <span>Your info is secure</span>
          </div>
        </form>
      </div>
    </div>
  )
}
