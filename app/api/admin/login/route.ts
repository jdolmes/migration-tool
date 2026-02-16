import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    // Check password against environment variable
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword) {
      console.error('ADMIN_PASSWORD environment variable not set')
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Simple password comparison (plain text for MVP)
    if (password === adminPassword) {
      // Set session cookie
      const cookieStore = await cookies()
      cookieStore.set('admin_session', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      })

      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid password' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'Login failed' },
      { status: 500 }
    )
  }
}
