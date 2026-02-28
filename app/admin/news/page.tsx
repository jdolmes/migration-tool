'use client'

import { useState, useEffect } from 'react'
import { Newspaper, RefreshCw, Check, X, Inbox, Plus, Link, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface NewsArticle {
  id: string
  source: string
  source_url: string
  title: string
  published_at: string | null
  snippet: string | null
  tags: string[]
  status: string
}

interface ArticlePreview {
  title: string
  snippet: string | null
  source: string
  source_url: string
}

export default function AdminNewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Manual entry state
  const [manualUrl, setManualUrl] = useState('')
  const [isFetchingArticle, setIsFetchingArticle] = useState(false)
  const [articlePreview, setArticlePreview] = useState<ArticlePreview | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)
  const [manualError, setManualError] = useState<string | null>(null)

  const fetchArticles = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true)
    else setIsLoading(true)

    const { data, error } = await supabase
      .from('news_articles')
      .select('*')
      .eq('status', 'pending')
      .order('published_at', { ascending: false, nullsFirst: false })

    if (error) {
      console.error('Error fetching articles:', error)
    } else {
      setArticles(data || [])
    }

    setIsLoading(false)
    setIsRefreshing(false)
  }

  useEffect(() => {
    fetchArticles()
  }, [])

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    setUpdatingId(id)

    try {
      const response = await fetch('/api/admin/news', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, status }),
      })

      console.log(`[updateStatus] Response status: ${response.status}`)

      let result
      const responseText = await response.text()
      console.log(`[updateStatus] Response body: ${responseText}`)

      try {
        result = JSON.parse(responseText)
      } catch {
        console.error('[updateStatus] Failed to parse response as JSON:', responseText)
        setUpdatingId(null)
        return
      }

      if (!response.ok || !result.success) {
        console.error(`[updateStatus] API error: ${response.status} - ${result.message}`)
      } else {
        setArticles(prev => prev.filter(a => a.id !== id))
      }
    } catch (error) {
      console.error('[updateStatus] Fetch error:', error)
    }

    setUpdatingId(null)
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const fetchArticlePreview = async () => {
    if (!manualUrl.trim()) return

    setIsFetchingArticle(true)
    setManualError(null)
    setArticlePreview(null)

    try {
      const response = await fetch('/api/admin/news/fetch-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ url: manualUrl.trim() }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        setManualError(result.message || 'Failed to fetch article')
      } else {
        setArticlePreview(result.data)
      }
    } catch (error) {
      setManualError('Failed to fetch article')
      console.error('[fetchArticlePreview] Error:', error)
    } finally {
      setIsFetchingArticle(false)
    }
  }

  const publishArticle = async () => {
    if (!articlePreview) return

    setIsPublishing(true)
    setManualError(null)

    try {
      const response = await fetch('/api/admin/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(articlePreview),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        setManualError(result.message || 'Failed to publish article')
      } else {
        // Success - clear the form
        setArticlePreview(null)
        setManualUrl('')
      }
    } catch (error) {
      setManualError('Failed to publish article')
      console.error('[publishArticle] Error:', error)
    } finally {
      setIsPublishing(false)
    }
  }

  const cancelPreview = () => {
    setArticlePreview(null)
    setManualUrl('')
    setManualError(null)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-blue-600" />
            News Review Queue
          </h1>
          <p className="text-gray-600">
            {articles.length} article{articles.length !== 1 ? 's' : ''} pending review
          </p>
        </div>
        <button
          onClick={() => fetchArticles(true)}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Manual Article Entry */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="url"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isFetchingArticle && fetchArticlePreview()}
              placeholder="Paste article URL to add manually..."
              disabled={isFetchingArticle || !!articlePreview}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
          <button
            onClick={fetchArticlePreview}
            disabled={!manualUrl.trim() || isFetchingArticle || !!articlePreview}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFetchingArticle ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add Article
          </button>
        </div>

        {manualError && (
          <p className="mt-2 text-sm text-red-600">{manualError}</p>
        )}

        {articlePreview && (
          <div className="mt-4 border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Preview</p>
            <a
              href={articlePreview.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors"
            >
              {articlePreview.title}
            </a>
            <div className="mt-1 text-sm text-gray-500">
              {articlePreview.source}
            </div>
            {articlePreview.snippet && (
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                {articlePreview.snippet}
              </p>
            )}
            <div className="mt-4 flex gap-2">
              <button
                onClick={publishArticle}
                disabled={isPublishing}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isPublishing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Confirm & Publish
              </button>
              <button
                onClick={cancelPreview}
                disabled={isPublishing}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Articles List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mr-2" />
            <p className="text-gray-600">Loading articles...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Inbox className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-1">
              No articles pending review
            </p>
            <p className="text-sm text-gray-500">
              New articles will appear here when feeds are ingested
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {articles.map((article) => (
              <div
                key={article.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <a
                      href={article.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      {article.title}
                    </a>

                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                      <span className="font-medium">{article.source}</span>
                      {article.published_at && (
                        <>
                          <span>·</span>
                          <span>{formatDate(article.published_at)}</span>
                        </>
                      )}
                    </div>

                    {article.snippet && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {article.snippet}
                      </p>
                    )}

                    {article.tags && article.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {article.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => updateStatus(article.id, 'approved')}
                      disabled={updatingId === article.id}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(article.id, 'rejected')}
                      disabled={updatingId === article.id}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer count */}
      {!isLoading && articles.length > 0 && (
        <p className="text-sm text-gray-500 mt-4 text-right">
          {articles.length} article{articles.length !== 1 ? 's' : ''} awaiting review
        </p>
      )}
    </div>
  )
}
