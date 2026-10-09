/**
 * Validate a post-auth redirect path.
 * Only relative same-origin paths are allowed (no protocol-relative or external URLs).
 */
export function getSafeNextPath(
  next: string | string[] | undefined | null,
  fallback = '/dashboard'
): string {
  const raw = Array.isArray(next) ? next[0] : next
  if (!raw || typeof raw !== 'string') {
    return fallback
  }

  const trimmed = raw.trim()
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return fallback
  }

  // Block backslash tricks and encoded absolute URLs
  if (trimmed.includes('\\') || /^\/[a-z]+:/i.test(trimmed)) {
    return fallback
  }

  try {
    const decoded = decodeURIComponent(trimmed)
    if (!decoded.startsWith('/') || decoded.startsWith('//')) {
      return fallback
    }
  } catch {
    return fallback
  }

  return trimmed
}
