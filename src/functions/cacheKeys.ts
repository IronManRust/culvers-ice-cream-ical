/**
 * Gets the list of cache prefixes.
 * @returns {string[]} - The list of cache prefixes.
 */
export const getCachePrefixes = (): string[] => {
  return [
    'flavors',
    'location',
    'calendar'
  ]
}

/**
 * Generates a cache key.
 * @returns {string} - The cache key.
 */
export const getCacheKeyFlavors = (): string => {
  return 'flavors'
}

/**
 * Generates a cache key.
 * @param {number} locationID - The ID of the location.
 * @returns {string} - The cache key.
 */
export const getCacheKeyLocation = (locationID: number): string => {
  return `location:${locationID}`
}

/**
 * Generates a cache key.
 * @param {number} locationID - The ID of the location.
 * @param {number} year - The calendar event year.
 * @param {number} month - The calendar event month.
 * @param {number} day - The calendar event day.
 * @returns {string} - The cache key.
 */
export const getCacheKeyCalendar = (locationID: number, year: number, month: number, day: number): string => {
  return `calendar:${locationID}:${year}-${month}-${day}`
}
