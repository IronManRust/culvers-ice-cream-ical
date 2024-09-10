import axios from 'axios'
import { FastifyBaseLogger, FastifyRequest } from 'fastify'
import httpErrors from 'http-errors'
import { StatusCodes } from 'http-status-codes'
import icalGenerator, { ICalAlarmType, ICalEventBusyStatus, ICalEventStatus } from 'ical-generator'
import { parse } from 'node-html-parser'
import pAll from 'p-all'
import pRetry from 'p-retry'
import RSS from 'rss'
import getUUID from 'uuid-by-string'
import format from 'xml-formatter'
import { lookup } from 'zipcode-to-timezone'
import { getFlavorList, getFlavorInternal } from './flavorManager'
import { getLocationInternal, mapLocationIDToKey } from './locationManager'
import { HTTPAddress } from '../constants/httpAddress'
import { HTTPCacheOptions } from '../constants/httpCacheOptions'
import { LimitOptions } from '../constants/limitOptions'
import { RetryOptions } from '../constants/retryOptions'
import { getCacheKeyCalendar } from '../functions/cacheKeys'
import { combineAliasesCalendar } from '../functions/combineAliases'
import { buildCalendarDateOpen, buildCalendarDateClose } from '../functions/schedule'
import { Cache } from '../plugins/caching'
import CachedAsset from '../types/cachedAsset'
import Calendar from '../types/calendar'
import CalendarHeader from '../types/calendarHeader'
import CalendarItem from '../types/calendarItem'
import CalendarQuery from '../types/calendarQuery'

/**
 * The JSON object powering the Culver's calendar page widget.
 */
interface CalendarResponse {
  props: {
    pageProps: {
      page: {
        customData: {
          restaurantCalendar: {
            flavors: {
              onDate: string
              title: string
              urlSlug: string
            }[]
          }
        }
      }
    }
  }
}

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
 * Gets a calendar header by reading from the cache.
 * @param {Cache} cache - The cache object.
 * @param {number} locationID - The ID of the store location.
 * @param {Date} date - The calendar header date.
 * @returns {CachedAsset<CalendarHeader> | undefined} - A calendar header.
 */
const getCalendarHeaderCache = (cache: Cache, locationID: number, date: Date): CachedAsset<CalendarHeader> | undefined => {
  return cache.read<CalendarHeader>(getCacheKeyCalendar(locationID, date.getFullYear(), date.getMonth() + 1, date.getDate()))
}

/**
 * Writes a calendar header to the cache.
 * @param {Cache} cache - The cache object.
 * @param {CalendarHeader} calendarHeader - A calendar header.
 * @returns {CachedAsset<CalendarHeader>} - A calendar header.
 */
const setCalendarHeaderCache = (cache: Cache, calendarHeader: CalendarHeader): CachedAsset<CalendarHeader> => {
  const date = new Date(calendarHeader.date)
  return cache.write<CalendarHeader>(getCacheKeyCalendar(calendarHeader.locationID, date.getFullYear(), date.getMonth() + 1, date.getDate()), calendarHeader)
}

/**
 * Gets a calendar header by scraping the Culver's website.
 * @param {Cache} cache - The cache object.
 * @param {FastifyBaseLogger} logger - The logger instance.
 * @param {number} locationID - The ID of the store location.
 * @param {Date} date - The calendar header date.
 * @returns {CalendarHeader} - A calendar header.
 */
const getCalendarHeaderScrape = async (cache: Cache, logger: FastifyBaseLogger, locationID: number, date: Date): Promise<CalendarHeader> => {
  logger.info('scrape calendar header - begin')
  const locationKey = mapLocationIDToKey(locationID)
  if (locationKey) {
    const response = await axios.get(`${HTTPAddress.Website}/restaurants/${locationKey}`)
    if (response.status === StatusCodes.OK) {
      const calendarResponse: CalendarResponse = JSON.parse(parse(response.data).getElementById('__NEXT_DATA__').innerText)
      for (const flavor of calendarResponse.props.pageProps.page.customData.restaurantCalendar.flavors) {
        if (new Date(flavor.onDate).toISOString() === date.toISOString()) {
          logger.info('scrape calendar header - success')
          return {
            date: date.toLocaleDateString(),
            flavorKey: flavor.title,
            locationID
          }
        }
      }
      logger.info('scrape calendar header - failure')
      throw new httpErrors.InternalServerError('Unable to retrieve calendar header data.')
    } else {
      logger.info('scrape calendar header - failure')
      throw new httpErrors.NotFound('Unable to retrieve store location data.')
    }
  } else {
    logger.info('scrape calendar header - failure')
    throw new httpErrors.NotFound('Unable to retrieve store location data.')
  }
}

/**
 * Builds a calendar item from a calendar header.
 * @param {Cache} cache - The cache object.
 * @param {FastifyBaseLogger} logger - The logger instance.
 * @param {CachedAsset<CalendarHeader>} calendarHeader - A calendar header.
 * @returns {CachedAssed<CalendarItem>} - A calendar item.
 */
const buildCalendarItem = async (cache: Cache, logger: FastifyBaseLogger, calendarHeader: CachedAsset<CalendarHeader>): Promise<CachedAsset<CalendarItem>> => {
  const flavor = await getFlavorInternal(cache, logger, calendarHeader.data.flavorKey)
  const location = await getLocationInternal(cache, logger, calendarHeader.data.locationID)
  return {
    data: {
      date: calendarHeader.data.date,
      flavor,
      location
    },
    expires: calendarHeader.expires
  }
}

/**
 * Gets a calendar.
 * @param {FastifyRequest} request - The request instance.
 * @returns {CachedAsset<Calendar>} - A Flavor of the Day calendar in JSON format.
 */
export const getCalendarJSON = async (request: FastifyRequest): Promise<CachedAsset<Calendar>> => {
  const calendarQuery = combineAliasesCalendar(request.query as CalendarQuery)
  const calendarItems: CalendarItem[] = []
  const dates = getDatesThisMonthAndNext()
  await getFlavorList(request) // Ensure Flavors Are Pre-Cached
  const locationCalendarItemsList = await pAll(calendarQuery.locationID.map((locationID) => {
    return async () => {
      try {
        await getLocationInternal(request.cache, request.log, locationID) // Ensure Location Is Pre-Cached
      } catch {
        return [] // Skip Invalid Locations
      }
      const locationCalendarItems = await pAll(dates.map((date) => {
        return async () => {
          try {
            return buildCalendarItem(request.cache, request.log, getCalendarHeaderCache(request.cache, locationID, date) ?? setCalendarHeaderCache(request.cache, await pRetry(() => { return getCalendarHeaderScrape(request.cache, request.log, locationID, date) }, RetryOptions)))
          } catch {
            return null // Skip Cache Miss Followed By Failed Calendar Header Scrape
          }
        }
      }), LimitOptions)
      return locationCalendarItems
    }
  }), LimitOptions)
  let expires = HTTPCacheOptions.expires
  for (const locationCalendarItems of locationCalendarItemsList) {
    for (const locationCalendarItem of locationCalendarItems) {
      if (locationCalendarItem !== null) {
        if (locationCalendarItem.expires < expires) {
          expires = locationCalendarItem.expires // Use Earliest Expiration
        }
        if (calendarQuery.flavorKey.length > 0) {
          for (const flavorKey of calendarQuery.flavorKey) {
            if (flavorKey.trim().toLowerCase() === locationCalendarItem.data.flavor.key.trim().toLowerCase()) {
              calendarItems.push(locationCalendarItem.data)
            }
          }
        } else {
          calendarItems.push(locationCalendarItem.data)
        }
      }
    }
  }
  return {
    data: {
      items: calendarItems
    },
    expires
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
    prodId: {
      company: 'Culver\'s',
      product: 'Flavor of the Day Calendar',
      language: 'EN'
    },
    name: 'Culver\'s Flavor of the Day Calendar',
    description: 'This calendar feed contains all of the Culver\'s Flavor of the Day events for the location(s) and flavor(s) specified.',
    ttl: HTTPCacheOptions.ttl
  })
  calendarData.data.items.forEach((calendarItem) => {
    const date = new Date(calendarItem.date)
    const timezone = lookup(calendarItem.location.address.postal) ?? 'UTC'
    calendar.createEvent({
      id: getUUID(getCacheKeyCalendar(calendarItem.location.id, date.getFullYear(), date.getMonth() + 1, date.getDate())),
      summary: `Culver's Flavor of the Day - ${calendarItem.flavor.name} (${calendarItem.location.address.city} - ${calendarItem.location.address.street})`,
      description: `${calendarItem.flavor.description}\n\n${calendarItem.flavor.imageURL}\n\n${calendarItem.location.url}`,
      location: `${calendarItem.location.address.street}, ${calendarItem.location.address.city}, ${calendarItem.location.address.state} ${calendarItem.location.address.postal}, ${calendarItem.location.address.country}`,
      allDay: false,
      start: buildCalendarDateOpen(date, calendarItem.location.schedule, timezone),
      end: buildCalendarDateClose(date, calendarItem.location.schedule, timezone),
      url: calendarItem.location.url,
      attachments: [calendarItem.flavor.imageURL],
      busystatus: ICalEventBusyStatus.FREE,
      alarms: [{
        type: ICalAlarmType.display,
        trigger: 900 // 15 Minutes
      }],
      status: ICalEventStatus.TENTATIVE
    })
  })
  return {
    data: calendar.toString(),
    expires: calendarData.expires
  }
}

/**
 * Gets a calendar.
 * @param {FastifyRequest} request - The request instance.
 * @returns {CachedAsset<string>} - A Flavor of the Day calendar in RSS format.
 */
export const getCalendarRSS = async (request: FastifyRequest): Promise<CachedAsset<string>> => {
  const calendarData = await getCalendarJSON(request)
  const categories = [
    'Culver\'s',
    'Ice Cream',
    'Flavor of the Day'
  ]
  const feed = new RSS({
    title: 'Culver\'s Flavor of the Day Calendar',
    description: 'This calendar feed contains all of the Culver\'s Flavor of the Day events for the location(s) and flavor(s) specified.',
    // eslint-disable-next-line camelcase
    site_url: `${request.protocol}://${request.hostname}`,
    // eslint-disable-next-line camelcase
    feed_url: `${request.protocol}://${request.hostname}${request.url}`,
    copyright: `${new Date().getFullYear()} Culver's Ice Cream iCal`,
    language: 'en',
    categories,
    ttl: HTTPCacheOptions.ttl
  })
  calendarData.data.items.forEach((calendarItem) => {
    const date = new Date(calendarItem.date)
    const timezone = lookup(calendarItem.location.address.postal) ?? 'UTC'
    feed.item({
      guid: getUUID(getCacheKeyCalendar(calendarItem.location.id, date.getFullYear(), date.getMonth() + 1, date.getDate())),
      title: `Culver's Flavor of the Day - ${calendarItem.flavor.name} (${calendarItem.location.address.city} - ${calendarItem.location.address.street})`,
      description: calendarItem.flavor.description,
      date: buildCalendarDateOpen(date, calendarItem.location.schedule, timezone),
      url: calendarItem.location.url,
      categories
    })
  })
  return {
    data: format(feed.xml()),
    expires: calendarData.expires
  }
}
