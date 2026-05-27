import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { raffles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { fetchCosmicSeed, getCosmicProof } from '@/lib/cosmic-raffle/fetchCosmicSeed'
import { withDbRetry } from '@/lib/db/retry'

export const dynamic = 'force-dynamic'

/**
 * GET /api/raffles/[id]/cosmic-seed
 * Resolves the SpaceComputer cTRNG cosmic seed once the commit timestamp buffer is reached.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const [raffle] = await withDbRetry(() => db
      .select()
      .from(raffles)
      .where(eq(raffles.id, id))
      .limit(1)
    )

    if (!raffle) {
      return NextResponse.json({ error: 'Raffle not found.' }, { status: 404 })
    }

    if (raffle.drawn) {
      return NextResponse.json({ error: 'Raffle has already been drawn.' }, { status: 400 })
    }

    // Verify commit timestamp buffer has been reached
    const now = Date.now()
    const target = raffle.commitTimestamp

    if (now < target) {
      const timeRemainingMs = target - now
      return NextResponse.json({
        error: `Target commit time has not been reached yet.`,
        timeRemainingMs,
        now,
        commitTimestamp: target,
      }, { status: 423 })
    }

    // Fetch off-chain cosmic seed combining raffle information and SpaceComputer cTRNG entropy
    const seed = await fetchCosmicSeed(raffle.id, raffle.commitTimestamp)
    const cosmicProof = getCosmicProof(raffle.id) ?? null

    return NextResponse.json({
      success: true,
      seed,
      cosmicProof,
    })
  } catch (error) {
    console.error('❌ [/api/raffles/[id]/cosmic-seed] Error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to fetch cosmic seed.'
    }, { status: 500 })
  }
}
