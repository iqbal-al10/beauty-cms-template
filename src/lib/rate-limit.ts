import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Inisialisasi Redis dari environment variables
const redis = Redis.fromEnv()

// Rate limiters
export const loginLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '5 m'),
})

export const contactLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1 h'),
})

export const bookingLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 h'),
})

export const forgotPasswordLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1 h'),
})
