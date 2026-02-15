'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-500 text-sm mb-8">Last updated: February 15, 2026</p>

        {/* Content */}
        <div className="prose prose-gray max-w-none">
          {/* Introduction */}
          <p className="text-gray-700 leading-relaxed">
            Australia Migration Hub is a free tool that helps you check if your occupation qualifies
            for Australian skilled migration visas. We believe in being upfront about how we handle
            your information, so here&apos;s the straightforward version of our privacy practices.
          </p>

          {/* What We Collect */}
          <section className="mt-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">What We Collect</h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Session Data</h3>
                <p className="text-sm leading-relaxed">
                  We track basic usage like page views, clicks, and time spent on the site. This helps
                  us understand which occupations people search for and how they use the tool.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Contact Information</h3>
                <p className="text-sm leading-relaxed">
                  When you submit the contact form, we collect your name, email, phone (optional),
                  current location, visa details, and migration timeline. We only collect this when
                  you choose to share it.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Technical Data</h3>
                <p className="text-sm leading-relaxed">
                  We detect your country using your IP address to show relevant information. We also
                  collect basic browser information to ensure the site works properly for you.
                </p>
              </div>
            </div>
          </section>

          {/* How We Use It */}
          <section className="mt-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use It</h2>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>To connect you with registered migration agents who can help with your visa application</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>To improve the tool based on how people use it</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>To analyze which occupations are most searched and help users find relevant information</span>
              </li>
            </ul>
          </section>

          {/* Who We Share With */}
          <section className="mt-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Who We Share With</h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Registered Migration Agents</h3>
                <p className="text-sm leading-relaxed">
                  When you submit the contact form, your information is shared with registered
                  migration agents who may reach out to assist you.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Service Providers</h3>
                <p className="text-sm leading-relaxed">
                  We use Supabase to securely store data and basic analytics tools to understand
                  site usage. These providers have their own privacy policies and security measures.
                </p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800 font-medium">
                  We do NOT sell your data to advertisers or third parties. Ever.
                </p>
              </div>
            </div>
          </section>

          {/* Your Rights */}
          <section className="mt-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights</h2>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span><strong>Access:</strong> You can request a copy of any data we hold about you</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span><strong>Deletion:</strong> You can request we delete your information at any time</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span><strong>Unsubscribe:</strong> You can opt out of any communications we send</span>
              </li>
            </ul>
            <p className="mt-4 text-sm text-gray-700">
              To exercise any of these rights, contact us at:{' '}
              <a
                href="mailto:australiamigrationhub@gmail.com"
                className="text-blue-600 hover:underline"
              >
                australiamigrationhub@gmail.com
              </a>
            </p>
          </section>

          {/* Cookies & Tracking */}
          <section className="mt-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cookies & Tracking</h2>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>We use sessionStorage (not cookies) for basic analytics tracking</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>We don&apos;t use any third-party advertising or tracking cookies</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>You can clear your browser data anytime to remove session information</span>
              </li>
            </ul>
          </section>

          {/* Data Security */}
          <section className="mt-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Security</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              We take security seriously. Your data is protected with industry-standard encryption,
              stored in secure databases with limited access, and we regularly review our security
              practices to keep your information safe.
            </p>
          </section>

          {/* Changes to Policy */}
          <section className="mt-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to This Policy</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              We may update this privacy policy from time to time. When we do, we&apos;ll update the
              &quot;Last updated&quot; date at the top of this page. We encourage you to check back
              occasionally to stay informed about how we protect your information.
            </p>
          </section>

          {/* Contact */}
          <section className="mt-10 bg-gray-100 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Questions?</h2>
            <p className="text-gray-700 text-sm">
              If you have any questions about this privacy policy or how we handle your data,
              please reach out to us at{' '}
              <a
                href="mailto:australiamigrationhub@gmail.com"
                className="text-blue-600 hover:underline"
              >
                australiamigrationhub@gmail.com
              </a>
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Return to Australia Migration Hub
          </Link>
        </div>
      </div>
    </main>
  )
}
