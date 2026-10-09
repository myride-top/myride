/** Normalize a display name into a URL-safe slug (ASCII, hyphenated). */
export function slugify(input: string, maxLength = 60): string {
  const base = input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLength)

  return base || 'event'
}

/**
 * Resolve a unique slug by appending -2, -3, … when collisions exist.
 * `exists` should return true when the candidate is already taken.
 */
export async function ensureUniqueSlug(
  baseSlug: string,
  exists: (candidate: string) => Promise<boolean>,
  fallbackPrefix = 'event'
): Promise<string> {
  const slug = baseSlug || fallbackPrefix
  let attempt = 0

  while (attempt < 50) {
    const candidate = attempt === 0 ? slug : `${slug}-${attempt + 1}`
    const taken = await exists(candidate)
    if (!taken) {
      return candidate
    }
    attempt += 1
  }

  return `${slug}-${Date.now().toString(36)}`
}
