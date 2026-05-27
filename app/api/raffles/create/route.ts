import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { raffles } from '@/lib/db/schema'
import { getCurrentUser } from '@/lib/auth/session'
import { withDbRetry } from '@/lib/db/retry'

export const dynamic = 'force-dynamic'

/**
 * POST /api/raffles/create
 * Saves a new raffle and its entries in the database.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      title,
      description,
      prizeDescription,
      winnerCount,
      totalEntries,
      merkleRoot,
      commitTimestamp,
      rawEntries
    } = body

    if (!title || !merkleRoot || !rawEntries || !commitTimestamp) {
      return NextResponse.json({ error: 'Missing required parameters.' }, { status: 400 })
    }

    const [inserted] = await withDbRetry(() => db
      .insert(raffles)
      .values({
        title,
        description: description ?? '',
        prizeDescription: prizeDescription ?? '',
        winnerCount: Number(winnerCount),
        totalEntries: Number(totalEntries),
        merkleRoot,
        commitTimestamp: Number(commitTimestamp),
        drawn: false,
        rawEntries,
      })
      .returning()
    )

    return NextResponse.json({ success: true, raffle: inserted })
  } catch (error) {
    console.error('❌ [/api/raffles/create] Error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to save raffle.'
    }, { status: 500 })
  }
}
