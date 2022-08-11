export default interface CalendarQuery {
  /**
   * The ID of the location to search for.
   */
  locationID: number[]
  /**
   * The ID of the location to search for. This is an alias for locationID.
   */
  l: number[]
  /**
   * The flavor key to search for.
   */
  flavorKey: string[]
  /**
   * The flavor key to search for. This is an alias for flavorKey.
   */
  f: string[]
}
