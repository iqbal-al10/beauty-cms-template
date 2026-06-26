// In-memory rate limiter (untuk development)
// Untuk production, gunakan Upstash Redis

interface RateLimitRecord {
  count: number
  resetTime: number
}

const store = new Map<string, RateLimitRecord>()

export function rateLimitMemory(
  key: string,
  limit: number,
  windowMs: number
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const record = store.get(key)

  // Jika tidak ada record atau sudah expired
  if (!record || now > record.resetTime) {
    store.set(key, {
      count: 1,
      resetTime: now + windowMs,
    })
    return { success: true, remaining: limit - 1, resetTime: now + windowMs }
  }

  // Jika masih dalam window
  if (record.count < limit) {
    record.count += 1
    store.set(key, record)
    return { success: true, remaining: limit - record.count, resetTime: record.resetTime }
  }

  // Melebihi limit
  return { success: false, remaining: 0, resetTime: record.resetTime }
}

// Cleanup expired records setiap 5 menit
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of store) {
    if (now > record.resetTime) {
      store.delete(key)
    }
  }
}, 5 * 60 * 1000)
