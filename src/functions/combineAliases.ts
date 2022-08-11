import CalendarQuery from '../types/calendarQuery'
import LocationListQuery from '../types/locationListQuery'

/**
 * Combines query string aliases, standardizing on the full-text version.
 * @param {CalendarQuery} calendarQuery - The query string object.
 * @returns {CalendarQuery} - The query string object.
 */
export const combineAliasesCalendar = (calendarQuery: CalendarQuery): CalendarQuery => {
  return {
    locationID: [...new Set([...calendarQuery.locationID ?? [], ...calendarQuery.l ?? []])],
    l: [],
    flavorKey: [...new Set([...calendarQuery.flavorKey ?? [], ...calendarQuery.f ?? []])],
    f: []
  }
}

/**
 * Combines query string aliases, standardizing on the full-text version.
 * @param {LocationListQuery} locationListQuery - The query string object.
 * @returns {LocationListQuery} - The query string object.
 */
export const combineAliasesLocationList = (locationListQuery: LocationListQuery): LocationListQuery => {
  return {
    postal: locationListQuery.postal || locationListQuery.p || '',
    p: ''
  }
}
