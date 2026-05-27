import { NextResponse } from 'next/server'
import { logoutAdmin } from '@/lib/auth/session'

/**
 * POST /api/auth/logout
 * Clears admin session cookie.
 */
export async function POST() {
  await logoutAdmin()
  return NextResponse.json({ success: true })
}
