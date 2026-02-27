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
