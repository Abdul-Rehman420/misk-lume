const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(key: string, limit: number, windowMs: number): { success: boolean; remaining: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(key)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs })
    return { success: true, remaining: limit - 1 }
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0 }
  }

  entry.count++
  return { success: true, remaining: limit - entry.count }
}

const HOUR = 60 * 60 * 1000

export const rateLimiters = {
  contact: { limit: 5, windowMs: HOUR, prefix: "contact" },
  newsletter: { limit: 3, windowMs: HOUR, prefix: "newsletter" },
  orders: { limit: 10, windowMs: HOUR, prefix: "orders" },
  reviews: { limit: 5, windowMs: HOUR, prefix: "reviews" },
} as const
