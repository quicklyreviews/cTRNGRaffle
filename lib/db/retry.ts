const TRANSIENT_PATTERNS = [
  /ENOTFOUND/i,
  /EAI_AGAIN/i,
  /getaddrinfo/i,
  /ECONNRESET/i,
  /ETIMEDOUT/i,
  /Connection terminated/i,
  /CONNECTION_ENDED/i,
]

function isTransient(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e)
  const cause = (e as { cause?: { message?: string; code?: string } })?.cause
  const causeMsg = cause?.message ?? ''
  const code = cause?.code ?? ''
  return (
    TRANSIENT_PATTERNS.some((p) => p.test(msg) || p.test(causeMsg)) ||
    code === 'ENOTFOUND' ||
    code === 'EAI_AGAIN' ||
    code === 'ECONNRESET' ||
    code === 'ETIMEDOUT'
  )
}

export async function withDbRetry<T>(
  fn: () => Promise<T>,
  opts: { attempts?: number; label?: string } = {},
): Promise<T> {
  const attempts = opts.attempts ?? 5
  let lastErr: unknown
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (e) {
      lastErr = e
      if (!isTransient(e) || i === attempts - 1) throw e
      const delay = 200 * Math.pow(2, i)
      const label = opts.label ?? 'db'
      console.warn(`[withDbRetry:${label}] transient error, retry ${i + 1}/${attempts} in ${delay}ms`)
      await new Promise((r) => setTimeout(r, delay))
    }
  }
  throw lastErr
}
