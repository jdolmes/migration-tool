'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// Set to false to enable the page
const PAGE_HIDDEN = false

interface NewsArticle {
  id: string
  source: string
  source_url: string
  title: string
  published_at: string | null
  snippet: string | null
  tags: string[]
  impact_level: string | null
  impact_note: string | null
  impact_note_status: string | null
}

const PAGE_SIZE = 50

export default function MigrationNewsPage() {
  const router = useRouter()
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Redirect to homepage if page is hidden
  useEffect(() => {
    if (PAGE_HIDDEN) {
      router.replace('/')
    }
  }, [router])

  const fetchArticles = async (cursor?: string) => {
    try {
      let query = supabase
        .from('news_articles')
        .select('*')
        .eq('status', 'approved')
        .order('published_at', { ascending: false, nullsFirst: false })
        .limit(PAGE_SIZE + 1)

      if (cursor) {
        query = query.lt('published_at', cursor)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      const hasMoreResults = data && data.length > PAGE_SIZE
      const articlesToAdd = hasMoreResults ? data.slice(0, PAGE_SIZE) : data || []

      return { articles: articlesToAdd, hasMore: hasMoreResults }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load articles'
      throw new Error(message)
    }
  }

  useEffect(() => {
    if (PAGE_HIDDEN) return
    const loadInitial = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await fetchArticles()
        setArticles(result.articles)
        setHasMore(result.hasMore)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load articles')
      } finally {
        setIsLoading(false)
      }
    }
    loadInitial()
  }, [])

  const loadMore = async () => {
    if (!hasMore || isLoadingMore || articles.length === 0) return

    const lastArticle = articles[articles.length - 1]
    if (!lastArticle.published_at) return

    setIsLoadingMore(true)
    try {
      const result = await fetchArticles(lastArticle.published_at)
      setArticles(prev => [...prev, ...result.articles])
      setHasMore(result.hasMore)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more')
    } finally {
      setIsLoadingMore(false)
    }
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

  const getSourceBadge = (source: string): { bg: string; text: string; abbr: string } => {
    switch (source) {
      case 'Migration Alliance':
        return { bg: '#1a1a2e', text: '#f5c842', abbr: 'MA' }
      case 'The Guardian Australia':
        return { bg: '#052962', text: '#ffffff', abbr: 'Gu' }
      case 'SBS News':
        return { bg: '#e4002b', text: '#ffffff', abbr: 'SBS' }
      default:
        return { bg: '#6b7280', text: '#ffffff', abbr: source.substring(0, 2).toUpperCase() }
    }
  }

  // Return null while redirecting
  if (PAGE_HIDDEN) {
    return null
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 pt-16 pb-20">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Migration News</h1>
          <p className="mt-3 text-lg text-gray-500">
            Latest Australian immigration policy updates and announcements
          </p>
        </div>

        {isLoading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
            <p className="mt-6 text-gray-500 text-lg font-medium">Loading news...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
            <p className="text-red-600 font-semibold text-lg">Error: {error}</p>
          </div>
        )}

        {!isLoading && !error && articles.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-200 text-7xl mb-6 font-bold">?</div>
            <p className="text-gray-700 font-semibold text-xl mb-3">No articles yet</p>
            <p className="text-gray-400 text-lg">
              Check back soon for migration news updates
            </p>
          </div>
        )}

        {!isLoading && articles.length > 0 && (
          <>
            <div className="divide-y divide-gray-100">
              {articles.map((article) => {
                const badge = getSourceBadge(article.source)
                return (
                  <a
                    key={article.id}
                    href={article.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex gap-3 py-3 group"
                  >
                    <div
                      className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: badge.bg, color: badge.text }}
                    >
                      {badge.abbr}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-400">
                        {article.source}
                        {article.published_at && ` · ${formatDate(article.published_at)}`}
                      </div>
                      <h2 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {article.title}
                      </h2>
                      {article.snippet && (
                        <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">
                          {article.snippet}
                        </p>
                      )}
                    </div>
                  </a>
                )
              })}
            </div>

            {hasMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingMore ? 'Loading...' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
