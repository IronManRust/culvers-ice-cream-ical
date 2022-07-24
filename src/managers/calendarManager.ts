import axios from 'axios'
import { FastifyLoggerInstance, FastifyRequest } from 'fastify'
import httpErrors from 'http-errors'
import { StatusCodes } from 'http-status-codes'
import ical from 'ical'
import icalGenerator from 'ical-generator'
import { getFlavorList, getFlavorInternal } from './flavorManager'
import { getLocationInternal } from './locationManager'
import { getCacheKeyCalendar } from '../functions/cacheKeys'
import { Cache } from '../plugins/caching'
import CachedAsset from '../types/cachedAsset'
import Calendar from '../types/calendar'
import CalendarItem from '../types/calendarItem'
import CalendarQuery from '../types/calendarQuery'

/**
 * Gets the dates for the current and next month.
 * @returns {Date[]} - The dates for the current and next month.
 */
const getDatesThisMonthAndNext = (): Date[] => {
  const today = new Date()

  const startDate = new Date(today.getFullYear(), today.getMonth(), 1)
  const endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0)

  let dateRange: Date[] = []
  const currentDate = new Date(startDate)
  while (currentDate < new Date(endDate)) {
    dateRange = [...dateRange, new Date(currentDate)]
    currentDate.setDate(currentDate.getDate() + 1)
  }
  dateRange = [...dateRange, new Date(endDate)]
  return dateRange
}

/**
 * Gets a calendar item by reading from the cache.
 * @param {Cache} cache - The cache object.
 * @param {number} locationID - The ID of the store location.
 * @param {Date} date - The calendar item date.
 * @returns {CachedAsset<CalendarItem> | undefined} - A calendar item.
 */
const getCalendarItemCache = (cache: Cache, locationID: number, date: Date): CachedAsset<CalendarItem> | undefined => {
  return cache.read<CalendarItem>(getCacheKeyCalendar(locationID, date.getFullYear(), date.getMonth() + 1, date.getDate()))
}

/**
 * Writes a calendar item to the cache.
 * @param {Cache} cache - The cache object.
 * @param {CalendarItem} calendarItem - A calendar item.
 * @returns {CachedAsset<CalendarItem>} - A calendar item.
 */
const setCalendarItemCache = (cache: Cache, calendarItem: CalendarItem): CachedAsset<CalendarItem> => {
  const date = new Date(calendarItem.date.start)
  return cache.write<CalendarItem>(getCacheKeyCalendar(calendarItem.location.id, date.getFullYear(), date.getMonth() + 1, date.getDate()), calendarItem)
}

/**
 * Gets a calendar item by scraping the Culver's website.
 * @param {Cache} cache - The cache object.
 * @param {FastifyLoggerInstance} logger - The logger instance.
 * @param {number} locationID - The ID of the store location.
 * @param {Date} date - The calendar item date.
 * @returns {CalendarItem} - A calendar item.
 */
const getCalendarItemScrape = async (cache: Cache, logger: FastifyLoggerInstance, locationID: number, date: Date): Promise<CalendarItem> => {
  logger.info('scrape calendar item - begin')
  const response = await axios.get(`https://www.culvers.com/fotd-add-to-calendar/${locationID}/${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`)
  if (response.status === StatusCodes.OK) {
    const data = ical.parseICS(response.data)
    const event = data[Object.keys(data)[0]]
    const flavor = await getFlavorInternal(cache, logger, event.summary ?? '')
    const location = await getLocationInternal(cache, logger, locationID)
    logger.info('scrape calendar item - success')
    return {
      date: {
        // TODO: Use proper day-of-the-week hours.
        start: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 5, 0, 0).toISOString(),
        end: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 15, 0, 0).toISOString()
      },
      flavor,
      location
    }
  } else {
    logger.info('scrape calendar item - failure')
    throw new httpErrors.InternalServerError('Unable to retrieve calendar item data.')
  }
}

/**
 * Gets a calendar.
 * @param {FastifyRequest} request - The request instance.
 * @returns {CachedAsset<Calendar>} - A Flavor of the Day calendar in JSON format.
 */
export const getCalendarJSON = async (request: FastifyRequest): Promise<CachedAsset<Calendar>> => {
  const calendarQuery = request.query as CalendarQuery
  const calendarItems: CalendarItem[] = []
  const dates = getDatesThisMonthAndNext()
  await getFlavorList(request) // Ensure Flavors Are Pre-Cached
  const locationCalendarItemsList = await Promise.all((calendarQuery.locationID ?? []).map(async (locationID) => {
    try {
      await getLocationInternal(request.cache, request.log, locationID) // Ensure Location Is Pre-Cached
    } catch {
      return [] // Skip Invalid Locations
    }
    const locationCalendarItems = await Promise.all(dates.map(async (date) => {
      return getCalendarItemCache(request.cache, locationID, date) ?? setCalendarItemCache(request.cache, await getCalendarItemScrape(request.cache, request.log, locationID, date))
    }))
    return locationCalendarItems
  }))
  for (const locationCalendarItems of locationCalendarItemsList) {
    for (const locationCalendarItem of locationCalendarItems) {
      if ((calendarQuery.flavorKey ?? []).length > 0) {
        for (const flavorKey of calendarQuery.flavorKey ?? []) {
          if (flavorKey.trim().toLowerCase() === locationCalendarItem.data.flavor.key.trim().toLowerCase()) {
            calendarItems.push(locationCalendarItem.data)
          }
        }
      } else {
        calendarItems.push(locationCalendarItem.data)
      }
    }
  }
  return {
    data: {
      items: calendarItems
    },
    expires: new Date() // TODO: Newest Expiration
  }
}

/**
 * Gets a calendar.
 * @param {FastifyRequest} request - The request instance.
 * @returns {CachedAsset<string>} - A Flavor of the Day calendar in iCal format.
 */
export const getCalendarFeed = async (request: FastifyRequest): Promise<CachedAsset<string>> => {
  const calendarData = await getCalendarJSON(request)
  const calendar = icalGenerator({
    // TODO: Include Location / Flavor Details
    name: 'Culver\'s Flavor of the Day Calendar'
  })
  calendarData.data.items.forEach((calendarItem) => {
    // TODO: Tweak Data / Include More Data Points
    const dateStart = new Date(calendarItem.date.start)
    const dateEnd = new Date(calendarItem.date.end)
    calendar.createEvent({
      id: getCacheKeyCalendar(calendarItem.location.id, dateStart.getFullYear(), dateStart.getMonth() + 1, dateStart.getDate()),
      summary: `Culver's Flavor of the Day - ${calendarItem.location.address.city} - ${calendarItem.location.address.street} - ${calendarItem.flavor.name}`,
      description: calendarItem.flavor.description,
      location: `${calendarItem.location.address.street}, ${calendarItem.location.address.city}, ${calendarItem.location.address.state} ${calendarItem.location.address.postal}, ${calendarItem.location.address.country}`,
      allDay: false,
      start: dateStart,
      end: dateEnd,
      url: calendarItem.location.url
    })
  })
  return {
    data: calendar.toString(),
    expires: calendarData.expires
  }
}
