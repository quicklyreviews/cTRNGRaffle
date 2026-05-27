import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

/**
 * GET /api/auth/me
 * Retrieves current admin session user details.
 */
export async function GET() {
  const user = await getCurrentUser()
  return NextResponse.json({ user })
}
