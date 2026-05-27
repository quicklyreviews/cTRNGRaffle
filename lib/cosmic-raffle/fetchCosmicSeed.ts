import dotenv from 'dotenv'
import { resolve } from 'path'
dotenv.config({ path: resolve(process.cwd(), '.env') })
dotenv.config({ path: resolve(process.cwd(), '.env.local'), override: true })

import { keccak256, encodePacked } from 'viem'
import { OrbitportSDK } from '@spacecomputer-io/orbitport-sdk-ts'

// ─── Interfaces & Caches ────────────────────────────────────────
export interface CosmicProofDetails {
  raffleId: string
  commitTimestamp: number
  spaceComputerEntropy: string | null
  verificationMode: 'authenticated_sdk' | 'public_sdk_ipfs' | 'fallback_ipfs' | 'rpc_fallback'
  sourceUrl?: string
  timestamp: number
  src?: string | null
  service?: string | null
  sequence?: number | null
  signature?: {
    algo?: string
    value: string
    pk: string
  } | null
}

interface SpaceComputerFetchResult {
  entropy: string | null
  verificationMode: CosmicProofDetails['verificationMode']
  src?: string | null
  service?: string | null
  signature?: CosmicProofDetails['signature']
  sourceUrl?: string
  sequence?: number | null
}

const seedCache = new Map<string, `0x${string}`>()
export const proofCache = new Map<string, CosmicProofDetails>()

/**
 * Helper to retrieve proof metadata for a given raffle ID.
 */
export function getCosmicProof(raffleId: string): CosmicProofDetails | undefined {
  return proofCache.get(raffleId)
}

/**
 * Fetches the cosmic entropy and cryptographic proofs from SpaceComputer cTRNG.
 * First attempts authenticated direct HTTP API request matching the orbitport-starter-kit,
 * and falls back to direct IPFS gateway manual HTTP requests.
 */
async function fetchSpaceComputerEntropy(): Promise<SpaceComputerFetchResult> {
  const clientId = process.env.ORBITPORT_CLIENT_ID?.trim()
  const clientSecret = process.env.ORBITPORT_CLIENT_SECRET?.trim()
  const AUTH_URL = process.env.ORBITPORT_AUTH_URL || "https://auth.spacecomputer.io";
  const API_URL = process.env.ORBITPORT_API_URL || "https://op.spacecomputer.io";

  // 1. Authenticated Direct HTTP API Request (Satellite cTRNG Gateway via SDK)
  if (clientId && clientSecret && clientId !== "your-client-id") {
    try {
      console.log('🛰️ Initiating authenticated SpaceComputer cTRNG request via SDK...')
      
      const sdk = new OrbitportSDK({
        config: {
          clientId,
          clientSecret,
        }
      });
      
      const result = await sdk.ctrng.random();
      const data = result.data;

      if (data && data.data) {
        const entropy = data.data;
        console.log(`🌌 Successfully retrieved SpaceComputer cTRNG cosmic entropy via SDK: ${entropy}`)
        return {
          entropy,
          verificationMode: 'authenticated_sdk',
          src: data.src || null,
          service: data.service || null,
          signature: data.signature || null,
        }
      }
    } catch (e) {
      console.warn('⚠️ Authenticated SDK cTRNG request failed, falling back to public IPFS beacon:', e instanceof Error ? e.message : e)
    }
  }

  // 2. Fallback: Direct HTTP fetch from public IPFS beacon gateways (no credentials needed)
  const gateways = [
    "https://k2k4r8lvomw737sajfnpav0dpeernugnryng50uheyk1k39lursmn09f.ipns.dweb.link",
    "https://ipfs.io/ipns/k2k4r8lvomw737sajfnpav0dpeernugnryng50uheyk1k39lursmn09f",
    "https://cloudflare-ipfs.com/ipns/k2k4r8lvomw737sajfnpav0dpeernugnryng50uheyk1k39lursmn09f",
    "https://dweb.link/ipns/k2k4r8lvomw737sajfnpav0dpeernugnryng50uheyk1k39lursmn09f",
    "https://gateway.ipfs.io/ipns/k2k4r8lvomw737sajfnpav0dpeernugnryng50uheyk1k39lursmn09f",
    "https://trustless-gateway.link/ipns/k2k4r8lvomw737sajfnpav0dpeernugnryng50uheyk1k39lursmn09f"
  ]

  for (const url of gateways) {
    try {
      console.log(`🛰️ Attempting to fetch SpaceComputer cosmic cTRNG from fallback IPFS: ${url}`)
      const res = await fetch(url, { 
        headers: { "Cache-Control": "no-cache" },
        signal: AbortSignal.timeout(6000) 
      })
      if (res.ok) {
        const json = await res.json()
        const beacon = json?.data || json
        if (beacon?.ctrng && beacon.ctrng.length > 0) {
          const value = beacon.ctrng[0]
          console.log(`🌌 Successfully retrieved SpaceComputer cTRNG cosmic entropy via fallback IPFS: ${value}`)
          return {
            entropy: value,
            verificationMode: 'fallback_ipfs',
            sourceUrl: url,
            sequence: beacon.sequence || null,
          }
        }
      }
    } catch (e) {
      console.warn(`⚠️ Failed to fetch cTRNG from fallback gateway ${url}:`, e instanceof Error ? e.message : e)
    }
  }

  return {
    entropy: null,
    verificationMode: 'rpc_fallback',
  }
}

/**
 * Fetches the Cosmic Randomness Seed for the given raffle.
 * Derives unique, secure seed off-chain:
 * finalSeed = keccak256(raffleId + commitTimestamp + spaceComputerEntropy)
 */
export async function fetchCosmicSeed(raffleId: string, commitTimestamp: number): Promise<`0x${string}`> {
  const cacheKey = `${raffleId}-${commitTimestamp}`
  if (seedCache.has(cacheKey)) {
    return seedCache.get(cacheKey)!
  }

  try {
    // Fetch SpaceComputer cosmic physical entropy
    const result = await fetchSpaceComputerEntropy()
    const spaceComputerEntropy = result.entropy

    let finalSeed: `0x${string}`

    if (spaceComputerEntropy) {
      // Clean up hex formatting
      const cleanEntropy = spaceComputerEntropy.startsWith('0x') 
        ? spaceComputerEntropy 
        : `0x${spaceComputerEntropy}`

      // Mix raffle details with space physical entropy
      finalSeed = keccak256(
        encodePacked(
          ['string', 'uint256', 'bytes32'],
          [raffleId, BigInt(commitTimestamp), cleanEntropy as `0x${string}`]
        )
      )
      console.log(`🔮 Mixed dual-entropy cosmic seed derived: ${finalSeed}`)
    } else {
      console.warn(`⚠️ Could not reach SpaceComputer cTRNG beacon. Falling back to timestamp only.`)
      // Fallback: Mix timestamp and raffle ID with deterministic protocol string
      finalSeed = keccak256(
        encodePacked(
          ['string', 'uint256', 'string'],
          [raffleId, BigInt(commitTimestamp), `SpaceComputer-cTRNG-Beacon-Fallback-v1`]
        )
      )
      console.log(`🔮 Mixed fallback seed derived: ${finalSeed}`)
    }

    // Save proof metadata in global cache
    const proofDetails: CosmicProofDetails = {
      raffleId,
      commitTimestamp,
      spaceComputerEntropy,
      verificationMode: result.verificationMode,
      sourceUrl: result.sourceUrl,
      sequence: result.sequence ?? null,
      src: result.src ?? null,
      service: result.service ?? null,
      signature: result.signature ?? null,
      timestamp: Date.now(),
    }
    proofCache.set(raffleId, proofDetails)

    seedCache.set(cacheKey, finalSeed)
    return finalSeed
  } catch (error) {
    console.error(`⚠️ Error fetching cosmic seed for raffle ${raffleId}:`, error)
    
    // In case of error, generate a secure deterministic fallback hash
    const fallbackSeed = keccak256(
      encodePacked(
        ['string', 'uint256'],
        [raffleId, BigInt(commitTimestamp)]
      )
    )
    
    console.log(`ℹ️ Generated secure fallback seed: ${fallbackSeed}`)
    return fallbackSeed
  }
}
