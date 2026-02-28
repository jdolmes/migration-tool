import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function PATCH(request: NextRequest) {
  console.log('[admin/news PATCH] Request received')

  try {
    // Verify admin session
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin_session')

    console.log('[admin/news PATCH] Admin session:', adminSession?.value ? 'present' : 'missing')

    if (!adminSession || adminSession.value !== 'true') {
      console.log('[admin/news PATCH] Unauthorized - no valid session')
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, status } = body

    console.log(`[admin/news PATCH] Updating article ${id} to status: ${status}`)

    if (!id || !status) {
      console.log('[admin/news PATCH] Missing id or status')
      return NextResponse.json(
        { success: false, message: 'Missing id or status' },
        { status: 400 }
      )
    }

    if (!['approved', 'rejected'].includes(status)) {
      console.log(`[admin/news PATCH] Invalid status: ${status}`)
      return NextResponse.json(
        { success: false, message: 'Invalid status' },
        { status: 400 }
      )
    }

    // Use service role key to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data, error } = await supabase
      .from('news_articles')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()

    if (error) {
      console.error('[admin/news PATCH] Supabase error:', error)
      return NextResponse.json(
        { success: false, message: `Database error: ${error.message}` },
        { status: 500 }
      )
    }

    console.log(`[admin/news PATCH] Success - updated ${data?.length || 0} row(s)`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[admin/news PATCH] Unexpected error:', error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Update failed' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  console.log('[admin/news POST] Request received')

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
    const { title, snippet, source, source_url } = body

    if (!title || !source || !source_url) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Use service role key to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if article already exists
    const { data: existing } = await supabase
      .from('news_articles')
      .select('id')
      .eq('source_url', source_url)
      .single()

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Article with this URL already exists' },
        { status: 409 }
      )
    }

    const { data, error } = await supabase
      .from('news_articles')
      .insert({
        title,
        snippet,
        source,
        source_url,
        status: 'approved',
        published_at: new Date().toISOString(),
        tags: [],
        updated_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      console.error('[admin/news POST] Supabase error:', error)
      return NextResponse.json(
        { success: false, message: `Database error: ${error.message}` },
        { status: 500 }
      )
    }

    console.log('[admin/news POST] Article inserted successfully')
    return NextResponse.json({ success: true, data: data?.[0] })
  } catch (error) {
    console.error('[admin/news POST] Unexpected error:', error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Insert failed' },
      { status: 500 }
    )
  }
}
