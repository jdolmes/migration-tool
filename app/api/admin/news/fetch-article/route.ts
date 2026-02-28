import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const SOURCE_MAP: Record<string, string> = {
  'theguardian.com': 'The Guardian Australia',
  'sbs.com.au': 'SBS News',
  'migrationalliance.com.au': 'Migration Alliance',
  'abc.net.au': 'ABC News',
  'smh.com.au': 'Sydney Morning Herald',
  'theaustralian.com.au': 'The Australian',
  'news.com.au': 'News.com.au',
  'afr.com': 'Australian Financial Review',
}

function getSourceFromDomain(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '')

    for (const [domain, source] of Object.entries(SOURCE_MAP)) {
      if (hostname.includes(domain)) {
        return source
      }
    }

    // Default: capitalize domain parts
    const parts = hostname.split('.')
    const name = parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
    return name
  } catch {
    return 'Unknown Source'
  }
}

function extractContent(html: string, patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/<[^>]*>/g, '')
        .trim()
    }
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin session
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin_session')

    if (!adminSession || adminSession.value !== 'true') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json(
        { success: false, message: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid URL' },
        { status: 400 }
      )
    }

    // Fetch the page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SkillIndex/1.0)',
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: `Failed to fetch URL: ${response.status}` },
        { status: 400 }
      )
    }

    const html = await response.text()

    // Extract title
    const title = extractContent(html, [
      /<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i,
      /<meta\s+content=["']([^"']+)["']\s+property=["']og:title["']/i,
      /<title[^>]*>([^<]+)<\/title>/i,
      /<h1[^>]*>([^<]+)<\/h1>/i,
    ])

    // Extract snippet/description
    const snippet = extractContent(html, [
      /<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i,
      /<meta\s+content=["']([^"']+)["']\s+property=["']og:description["']/i,
      /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i,
      /<meta\s+content=["']([^"']+)["']\s+name=["']description["']/i,
      /<p[^>]*>([^<]{50,})<\/p>/i,
    ])

    // Get source from domain
    const source = getSourceFromDomain(url)

    if (!title) {
      return NextResponse.json(
        { success: false, message: 'Could not extract title from page' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        title,
        snippet: snippet || null,
        source,
        source_url: url,
      },
    })
  } catch (error) {
    console.error('[fetch-article] Error:', error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to fetch article' },
      { status: 500 }
    )
  }
}
