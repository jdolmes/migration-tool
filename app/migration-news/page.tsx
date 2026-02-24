'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function MigrationNewsPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubmitted(true)
      setEmail('')
    }
  }

  return (
    <main className="min-h-[calc(100vh-60px)] bg-white flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          Coming Soon
        </span>

        <h1 className="mt-4 text-4xl font-bold text-gray-900">
          Migration News
        </h1>

        <p className="mt-4 text-gray-500 text-lg">
          Stay updated with the latest Australian immigration policy changes and announcements.
        </p>

        {submitted ? (
          <p className="mt-8 text-green-600 font-medium">
            Thanks! We'll notify you when this launches.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 flex gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Notify me
            </button>
          </form>
        )}

        <div className="mt-10 border-t border-gray-100 pt-6">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← Back to search
          </Link>
        </div>
      </div>
    </main>
  )
}
