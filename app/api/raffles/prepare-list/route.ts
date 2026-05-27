import { NextResponse } from 'next/server'
import { parseEntries } from '@/lib/cosmic-raffle/parseEntries'
import { MerkleTree } from '@/lib/cosmic-raffle/merkle'
import { getCurrentUser } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

/**
 * POST /api/raffles/prepare-list
 * Accepts raw CSV/text entries, normalizes them, constructs the Merkle Tree,
 * and sets a commit timestamp (15-second future security buffer).
 */
export async function POST(request: Request) {
  try {
    // 1. Parse payload
    const { rawInput, winnerCount } = await request.json()

    if (!rawInput || typeof rawInput !== 'string') {
      return NextResponse.json({ error: 'Contestant entries are required.' }, { status: 400 })
    }

    const wCount = Number(winnerCount)
    if (isNaN(wCount) || wCount <= 0) {
      return NextResponse.json({ error: 'Winner count must be a positive integer.' }, { status: 400 })
    }

    // 3. Process entries
    const entries = parseEntries(rawInput)
    if (entries.length === 0) {
      return NextResponse.json({ error: 'No valid unique contestants found in the input.' }, { status: 400 })
    }

    if (wCount > entries.length) {
      return NextResponse.json({
        error: `Winner count (${wCount}) cannot exceed total unique entries (${entries.length}).`
      }, { status: 400 })
    }

    // 4. Generate Merkle Root
    const tree = new MerkleTree(entries)
    const merkleRoot = tree.getRoot()

    // 5. Establish secure future commit timestamp (8-second delay buffer)
    // Shortened to 8 seconds to enable an immediate, fully automated cosmic draw transition
    const commitTimestamp = Date.now() + 8 * 1000

    return NextResponse.json({
      entries,
      totalEntries: entries.length,
      merkleRoot,
      commitTimestamp,
      winnerCount: wCount,
    })
  } catch (error) {
    console.error('❌ [/api/raffles/prepare-list] Error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to prepare contestant list.'
    }, { status: 500 })
  }
}
