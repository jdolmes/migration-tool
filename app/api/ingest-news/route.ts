import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Only save articles containing at least one of these (case insensitive)
// Evidence-based golden identifiers — no broad standalone words
const INCLUDE_KEYWORDS = [
  // Subclass Numbers
  'subclass 189', 'subclass 190', 'subclass 491', 'subclass 482',
  'subclass 186', 'subclass 485', 'subclass 500', 'subclass 820',
  'subclass 494', 'subclass 187', 'subclass 103', 'subclass 143',
  // Visa Stream Names (official)
  'skills in demand visa', 'SID visa', 'general skilled migration',
  'graduate visa', 'training visa', 'partner visa', 'family visa',
  'temporary graduate', 'contributory parent', 'sponsored parent',
  'global talent', 'distinguished talent', 'TSS visa', 'ENS visa', 'RSMS',
  'employer nomination scheme', 'regional sponsored migration',
  // Legal & Regulatory Citations
  'Migration Act 1958', 'Migration Agents Regulations', 'Ministerial Direction',
  'ESOS Act', 'legislative instrument', 'LIN', 'sunsetting',
  // Regulatory Bodies & Registers
  'Register of Migration Agents', 'Administrative Review Tribunal',
  'Centre for Population', 'MARA', 'OMARA', 'Home Affairs',
  'Department of Home Affairs',
  // Technical Processes
  'SkillSelect', 'TSMIT', 'CSOL', 'MLTSSL', 'STSOL', 'EOI',
  'invitation round', 'Confirmation of Enrolment', 'CoE',
  'skills assessment', 'labour market testing', 'points test',
  'state nomination', 'nomination allocation', 'grant rates',
  'priority processing', 'section 48',
  // Agent-Specific
  'registered migration agent', 'migration agent', 'RMA', 'CPD',
  'continuing professional development', 'professional indemnity',
  'immigration assistance',
  // Visa & Policy Phrases
  'skilled occupation list', 'occupation list', 'employer sponsored',
  'employer sponsorship', 'work rights', 'post-study work rights',
  'processing time', 'visa processing', 'onshore switching',
  'offshore visa', 'bridging visa', 'temporary visa', 'permanent visa',
  'visa cancellation', 'protection visa', 'visa hopping', 'visa fraud',
  'visa stream', 'visa pathway', 'visa conditions',
  // Program & Policy Terms
  'skilled migration', 'migration program', 'migration strategy',
  'migration framework', 'migration system', 'net overseas migration',
  'migration intake', 'temporary skills shortage', 'skills in demand',
  'migration legislation', 'immigration policy', 'migration regulation',
  'English-language thresholds', 'language test',
  // Education-Specific
  'education agent', 'course transfer', 'employer sponsorship pathways',
  'immigration regulations', 'Population Statement',
  // Compliance & Enforcement
  'compliance audits', 'infringement notice', 'civil penalty',
  'critical skills list', 'stay orders', 'migration integrity',
  'regulatory integrity',
]

// Discard articles where title contains any of these (even if they passed include filter)
const EXCLUDE_KEYWORDS = [
  // Political Figures
  'Angus Taylor', 'Pauline Hanson', 'Sussan Ley', 'One Nation',
  'shadow immigration minister', 'Liberal party', 'leadership change',
  'Jacinda Ardern', 'former prime minister', 'ex-prime minister',
  // Political Topics
  'culture wars', 'asylum seeker', 'election', 'polling',
  'border force raid', 'people smuggling', 'maritime border',
  'detention centre', 'deportation order', 'Gaza', 'Somalia',
  'illegal fishing', 'far right', 'Islamic country',
  // Travel & Lifestyle
  'passport changes', 'dual citizens', 'travel and tourism',
  'holiday deal', 'hotel review', 'flight special', 'tourism',
  // Demographics Noise
  'birth rate', 'population forecast', 'demographics',
  // General Noise
  'interest rate', 'cost of living', 'budget deficit',
  'stock market', 'real estate', 'property market',
]

const TAG_KEYWORDS = {
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

  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      tags.push(tag)
    }
  }

  return tags
}

function shouldIncludeArticle(title: string, snippet: string): boolean {
  const text = `${title} ${snippet}`.toLowerCase()
  return INCLUDE_KEYWORDS.some(keyword => text.includes(keyword.toLowerCase()))
}

function shouldExcludeArticle(title: string): boolean {
  const titleLower = title.toLowerCase()
  return EXCLUDE_KEYWORDS.some(keyword => titleLower.includes(keyword.toLowerCase()))
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
    items_skipped: 0,
    items_whitelisted: 0,
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

        // Filter and upsert articles
        for (const article of articles) {
          // Whitelisted sources bypass keyword filter entirely
          if (feed.is_whitelisted) {
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
              result.items_whitelisted++
            }
            continue
          }

          // Non-whitelisted: Check exclude list first (on title only)
          if (shouldExcludeArticle(article.title)) {
            result.items_skipped++
            continue
          }

          // Check include list (on title and snippet)
          if (!shouldIncludeArticle(article.title, article.snippet)) {
            result.items_skipped++
            continue
          }

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
