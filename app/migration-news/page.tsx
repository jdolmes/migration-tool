'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

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
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const fetchArticles = async (cursor?: string) => {
    try {
      let query = supabase
        .from('news_articles')
        .select('*')
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
            <div className="space-y-4">
              {articles.map((article) => (
                <article
                  key={article.id}
                  className="border border-gray-100 rounded-xl p-5 hover:border-gray-200 transition-colors"
                >
                  <a
                    href={article.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {article.title}
                    </h2>
                  </a>

                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
                    <span className="font-medium text-gray-500">{article.source}</span>
                    {article.published_at && (
                      <>
                        <span>·</span>
                        <span>{formatDate(article.published_at)}</span>
                      </>
                    )}
                  </div>

                  {article.snippet && (
                    <p className="mt-3 text-gray-600 text-sm line-clamp-2">
                      {article.snippet}
                    </p>
                  )}

                  {article.impact_note_status === 'approved' && article.impact_note && (
                    <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">Impact:</span> {article.impact_note}
                      </p>
                    </div>
                  )}

                  {article.tags && article.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {article.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              ))}
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
