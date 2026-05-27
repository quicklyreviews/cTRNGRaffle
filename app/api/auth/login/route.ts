import { NextResponse } from 'next/server'
import { loginAdmin } from '@/lib/auth/session'

/**
 * POST /api/auth/login
 * Validates admin password and stores session cookie.
 */
export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    const success = await loginAdmin(password)
    
    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Login failed.' }, { status: 500 })
  }
}
