import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { raffles, raffleWinners } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { fetchCosmicSeed, getCosmicProof } from '@/lib/cosmic-raffle/fetchCosmicSeed'
import { parseEntries } from '@/lib/cosmic-raffle/parseEntries'
import { drawWinnersOffChain } from '@/lib/cosmic-raffle/draw'
import { getCurrentUser } from '@/lib/auth/session'
import { withDbRetry } from '@/lib/db/retry'

export const dynamic = 'force-dynamic'

/**
 * POST /api/raffles/[id]/draw
 * Triggers the off-chain drawing process once the commit timestamp buffer is reached.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 2. Fetch raffle details
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

    // 3. Verify if target timestamp has been reached
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

    // 4. Fetch Cosmic Seed randomness from SpaceComputer
    console.log(`🛰️ Fetching cosmic randomness seed for raffle ${raffle.id}...`)
    const seed = await fetchCosmicSeed(raffle.id, raffle.commitTimestamp)

    // 5. Draw winners using Fisher-Yates and Merkle proofs off-chain
    console.log(`🌌 Initiating off-chain deterministic draw...`)
    const entries = parseEntries(raffle.rawEntries)
    
    const { winners } = drawWinnersOffChain(seed, entries, raffle.winnerCount)

    // 6. Store winners and proofs in DB
    const winnersToInsert = winners.map((w) => ({
      raffleId: raffle.id,
      index: w.index,
      username: w.username,
      merkleProof: w.merkleProof,
    }))

    console.log(`💾 Caching ${winnersToInsert.length} winners in database...`)
    await withDbRetry(() => db.insert(raffleWinners).values(winnersToInsert))

    // 7. Update raffle state in DB
    const cosmicProof = getCosmicProof(raffle.id) ?? null
    const [updatedRaffle] = await withDbRetry(() => db
      .update(raffles)
      .set({
        drawn: true,
        seed: seed,
        cosmicProof: cosmicProof,
      })
      .where(eq(raffles.id, raffle.id))
      .returning()
    )

    return NextResponse.json({
      success: true,
      raffle: updatedRaffle,
      winners: winnersToInsert,
    })
  } catch (error) {
    console.error('❌ [/api/raffles/[id]/draw] Error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Draw operation failed.'
    }, { status: 500 })
  }
}
