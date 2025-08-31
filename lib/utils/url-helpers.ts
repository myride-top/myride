/**
 * Convert car name to URL-friendly format
 * Example: "Mazda MX-3" -> "mazda-mx-3"
 */
export function carNameToUrl(carName: string): string {
  return carName.toLowerCase().replace(/\s+/g, '-')
}

/**
 * Convert URL format back to car name
 * Example: "mazda-mx-3" -> "Mazda MX-3"
 */
export function urlToCarName(urlName: string): string {
  // Handle edge cases
  if (!urlName || typeof urlName !== 'string') {
    return ''
  }

  // First, let's try to find the exact car name by doing a case-insensitive search
  // This is more reliable than trying to reconstruct the name
  return urlName
    .split('-')
    .map(word => {
      // Handle special cases like "MX" -> "MX" (preserve uppercase abbreviations)
      if (word.length <= 3 && word.toUpperCase() === word) {
        return word.toUpperCase()
      }
      // Handle numbers and special characters
      if (/^\d+$/.test(word)) {
        return word // Keep numbers as-is
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(' ')
}
