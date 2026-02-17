'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Search, RefreshCw, ChevronRight, Inbox } from 'lucide-react'
import {
  getLeads,
  formatDate,
  formatTimeline,
  formatLocation,
  getIntentLabel,
  getIntentColor,
  type Lead,
} from '@/lib/admin'

const TABS = [
  { label: 'All', value: 'all' },
  { label: 'New', value: 'new' },
  { label: 'Contacted', value: 'contacted' },
  { label: 'Converted', value: 'converted' },
]

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700',
    contacted: 'bg-yellow-100 text-yellow-700',
    converted: 'bg-green-100 text-green-700',
  }
  const labels: Record<string, string> = {
    new: 'New',
    contacted: 'Contacted',
    converted: 'Converted',
  }
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-600'}`}
    >
      {labels[status] || status}
    </span>
  )
}

export default function AdminLeadsPage() {
  const router = useRouter()
  const [leads, setLeads] = useState<Lead[]>([])
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([])
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchLeads = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true)
    else setIsLoading(true)

    const data = await getLeads()
    setLeads(data)
    setIsLoading(false)
    setIsRefreshing(false)
  }

  useEffect(() => {
    fetchLeads()
  }, [])

  // Filter by tab and search
  useEffect(() => {
    let result = leads

    if (activeTab !== 'all') {
      result = result.filter((lead) => lead.status === activeTab)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (lead) =>
          lead.name?.toLowerCase().includes(q) ||
          lead.email?.toLowerCase().includes(q) ||
          lead.occupation_code?.toLowerCase().includes(q)
      )
    }

    setFilteredLeads(result)
  }, [leads, activeTab, searchQuery])

  const handleRowClick = (id: string) => {
    router.push(`/admin/leads/${id}`)
  }

  const counts = {
    all: leads.length,
    new: leads.filter((l) => l.status === 'new').length,
    contacted: leads.filter((l) => l.status === 'contacted').length,
    converted: leads.filter((l) => l.status === 'converted').length,
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Page Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Lead Inbox
          </h1>
          <p className="text-gray-600">
            {counts.all} total lead{counts.all !== 1 ? 's' : ''} •{' '}
            <span className="text-blue-600 font-medium">{counts.new} new</span>
          </p>
        </div>
        <button
          onClick={() => fetchLeads(true)}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-6 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
            <span
              className={`text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center ${
                activeTab === tab.value
                  ? tab.value === 'new'
                    ? 'bg-blue-100 text-blue-700'
                    : tab.value === 'contacted'
                      ? 'bg-yellow-100 text-yellow-700'
                      : tab.value === 'converted'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-200 text-gray-700'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {counts[tab.value as keyof typeof counts]}
            </span>
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, email or occupation code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mr-2" />
            <p className="text-gray-600">Loading leads...</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Inbox className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-1">
              No leads found
            </p>
            <p className="text-sm text-gray-500">
              {searchQuery
                ? 'Try a different search term'
                : activeTab !== 'all'
                  ? `No ${activeTab} leads yet`
                  : 'Leads will appear here when users submit the contact form'}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Date
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Name
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Email
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Location
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Timeline
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Intent
                </th>
                {activeTab === 'all' && (
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Status
                  </th>
                )}
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLeads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => handleRowClick(lead.id)}
                  className="hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                    {formatDate(lead.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">
                      {lead.name}
                    </p>
                    {lead.occupation_code && (
                      <p className="text-xs text-gray-500">
                        ANZSCO: {lead.occupation_code}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {lead.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                    {formatLocation(lead.location)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                    {formatTimeline(lead.timeline)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getIntentColor(lead.intent_score)}`}
                    >
                      {getIntentLabel(lead.intent_score)}
                      {lead.intent_score ? ` (${lead.intent_score})` : ''}
                    </span>
                  </td>
                  {activeTab === 'all' && (
                    <td className="px-6 py-4">
                      <StatusBadge status={lead.status} />
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer count */}
      {!isLoading && filteredLeads.length > 0 && (
        <p className="text-sm text-gray-500 mt-4 text-right">
          Showing {filteredLeads.length} of {leads.length} leads
        </p>
      )}
    </div>
  )
}
