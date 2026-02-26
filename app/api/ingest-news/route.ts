import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const KEYWORDS = {
  '482': ['482', 'tss', 'temporary skill shortage'],
  'student': ['student', 'student visa', '500'],
  'partner': ['partner', 'spouse', '820', '801', '309', '100'],
  'PR': ['permanent resident', 'pr', '189', '190', '491', 'skilled migration'],
  'policy': ['policy', 'regulation', 'legislation', 'reform', 'announcement'],
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function extractSnippet(content: string, maxLength: number = 200): string {
  const stripped = stripHtml(content)
  if (stripped.length <= maxLength) return stripped
  return stripped.substring(0, maxLength).trim() + '...'
}

function extractTags(title: string, content: string): string[] {
  const text = `${title} ${content}`.toLowerCase()
  const tags: string[] = []

  for (const [tag, keywords] of Object.entries(KEYWORDS)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      tags.push(tag)
    }
  }

  return tags
}

function parseDate(dateStr: string | undefined): string | null {
  if (!dateStr) return null
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return null
    return date.toISOString()
  } catch {
    return null
  }
}

async function parseRssFeed(xml: string, sourceName: string): Promise<Array<{
  source: string
  source_url: string
  title: string
  published_at: string | null
  snippet: string
  tags: string[]
}>> {
  const items: Array<{
    source: string
    source_url: string
    title: string
    published_at: string | null
    snippet: string
    tags: string[]
  }> = []

  // Simple XML parsing using regex (works for standard RSS/Atom feeds)
  const itemMatches = xml.match(/<item[^>]*>[\s\S]*?<\/item>|<entry[^>]*>[\s\S]*?<\/entry>/gi) || []

  for (const itemXml of itemMatches) {
    // Extract title
    const titleMatch = itemXml.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i)
    const title = titleMatch ? stripHtml(titleMatch[1]) : ''

    // Extract link
    const linkMatch = itemXml.match(/<link[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i) ||
                      itemXml.match(/<link[^>]*href=["']([^"']+)["'][^>]*\/?>/i)
    const link = linkMatch ? (linkMatch[1] || '').trim() : ''

    // Extract date
    const dateMatch = itemXml.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i) ||
                      itemXml.match(/<published[^>]*>([\s\S]*?)<\/published>/i) ||
                      itemXml.match(/<updated[^>]*>([\s\S]*?)<\/updated>/i) ||
                      itemXml.match(/<dc:date[^>]*>([\s\S]*?)<\/dc:date>/i)
    const publishedAt = parseDate(dateMatch?.[1]?.trim())

    // Extract description/content for snippet
    const descMatch = itemXml.match(/<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i) ||
                      itemXml.match(/<content[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/content>/i) ||
                      itemXml.match(/<summary[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/summary>/i)
    const description = descMatch ? descMatch[1] : ''
    const snippet = extractSnippet(description)

    // Extract tags based on keywords
    const tags = extractTags(title, description)

    if (title && link) {
      items.push({
        source: sourceName,
        source_url: link,
        title,
        published_at: publishedAt,
        snippet,
        tags,
      })
    }
  }

  return items
}

export async function GET(request: Request) {
  // Verify CRON_SECRET
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = {
    feeds_processed: 0,
    items_found: 0,
    items_inserted: 0,
    errors: [] as string[],
  }

  try {
    // Fetch active feeds
    const { data: feeds, error: feedsError } = await supabase
      .from('news_feeds')
      .select('*')
      .eq('is_active', true)

    if (feedsError) {
      result.errors.push(`Failed to fetch feeds: ${feedsError.message}`)
      return NextResponse.json(result, { status: 500 })
    }

    if (!feeds || feeds.length === 0) {
      return NextResponse.json({ ...result, message: 'No active feeds found' })
    }

    // Process each feed
    for (const feed of feeds) {
      try {
        const response = await fetch(feed.feed_url, {
          headers: { 'User-Agent': 'SkillIndex News Bot/1.0' },
        })

        if (!response.ok) {
          result.errors.push(`Failed to fetch ${feed.source_name}: ${response.status}`)
          continue
        }

        const xml = await response.text()
        const articles = await parseRssFeed(xml, feed.source_name)

        result.feeds_processed++
        result.items_found += articles.length

        // Upsert articles
        for (const article of articles) {
          const { error: upsertError } = await supabase
            .from('news_articles')
            .upsert(
              {
                ...article,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'source_url' }
            )

          if (upsertError) {
            result.errors.push(`Failed to upsert article: ${upsertError.message}`)
          } else {
            result.items_inserted++
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        result.errors.push(`Error processing ${feed.source_name}: ${message}`)
      }
    }

    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    result.errors.push(`Unexpected error: ${message}`)
    return NextResponse.json(result, { status: 500 })
  }
}
