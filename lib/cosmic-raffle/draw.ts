import { keccak256, encodePacked } from 'viem'
import { MerkleTree } from './merkle'

export interface DrawResult {
  winningIndices: number[]
  winners: {
    index: number
    username: string
    merkleProof: `0x${string}`[]
  }[]
}

/**
 * Off-chain deterministic Fisher-Yates draw algorithm.
 * Uses keccak256 to pick winners and generates Merkle proofs for verification.
 * Perfectly mirrors the contract-level logic off-chain.
 */
export function drawWinnersOffChain(
  seed: `0x${string}`,
  entries: string[],
  winnerCount: number
): DrawResult {
  const totalEntries = entries.length
  if (totalEntries === 0) {
    throw new Error('No entries to draw from')
  }
  if (winnerCount <= 0 || winnerCount > totalEntries) {
    throw new Error(`Invalid winner count: ${winnerCount} (total entries: ${totalEntries})`)
  }

  const swaps: Record<number, number> = {}
  const winningIndices: number[] = []

  for (let i = 0; i < winnerCount; i++) {
    // Generate deterministic pseudo-random number from seed and step
    const rand = keccak256(
      encodePacked(
        ['bytes32', 'uint256'],
        [seed, BigInt(i)]
      )
    )
    const randBig = BigInt(rand)
    const range = BigInt(totalEntries - i)
    const j = i + Number(randBig % range)

    // Sparse array Fisher-Yates swap
    const valJ = swaps[j] !== undefined ? swaps[j] : j
    const valI = swaps[i] !== undefined ? swaps[i] : i

    swaps[i] = valJ
    swaps[j] = valI

    winningIndices.push(valJ)
  }

  // Build the Merkle tree to generate proofs for the winners
  const tree = new MerkleTree(entries)

  const winners = winningIndices.map((index) => {
    const username = entries[index]
    const proof = tree.getProof(index)
    return {
      index,
      username,
      merkleProof: proof,
    }
  })

  return {
    winningIndices,
    winners,
  }
}
