import axios from 'axios'
import { FastifyBaseLogger, FastifyRequest } from 'fastify'
import { unescape } from 'html-escaper'
import httpErrors from 'http-errors'
import { StatusCodes } from 'http-status-codes'
import { parse } from 'node-html-parser'
import postalCodes from 'postal-codes-js'
import { HTTPAddress } from '../constants/httpAddress'
import { getCacheKeyLocation } from '../functions/cacheKeys'
import { combineAliasesLocationList } from '../functions/combineAliases'
import { Cache } from '../plugins/caching'
import CachedAsset from '../types/cachedAsset'
import LocationDetail from '../types/locationDetail'
import LocationList from '../types/locationList'
import LocationListQuery from '../types/locationListQuery'
import LocationParams from '../types/locationParams'
import LocationSummary from '../types/locationSummary'
import Schedule from '../types/schedule'

/**
 * The JSON object returned by the Culver's address API.
 * This is not a complete interface, and only includes the desired data points.
 */
interface LocationListResponse {
  isSuccessful: boolean
  data: {
    meta: {
      code: number
    }
    geofences: {
      _id: string
      live: boolean
      description: string
      metadata: {
        dineInHours: string
        driveThruHours: string
        onlineOrderStatus: number
        flavorOfDayName: string
        flavorOfDaySlug: string
        openDate: string
        isTemporarilyClosed: boolean
        utcOffset: number
        street: string
        state: string
        city: string
        postalCode: string
        oloId: string
        slug: string
        jobsearchurl: string
        handoffOptions: string
      }
      tag: string
      externalId: string
      type: string
      geometryCenter: {
        type: string
        coordinates: number[]
      }
      geometryRadius: number
      geometry: {
        type: string
        coordinates: number[][][]
      }
      enabled: boolean
    }[]
    totalResults: number
    address: {
      latitude: number
      longitude: number
      geometry: {
        type: string
        coordinates: number[]
      }
      country: string
      countryCode: string
      countryFlag: string
      county: string
      distance: number
      confidence: string
      borough: string
      city: string
      neighborhood: string
      postalCode: string
      stateCode: string
      state: string
      layer: string
      formattedAddress: string
      addressLabel: string
    }
  }
}

/**
 * Gets a list of store locations by querying Culver's address API.
 * @param {FastifyBaseLogger} logger - The logger instance.
 * @param {string} postal - The postal code to search for.
 * @returns {LocationSummary[]} - A list of store locations.
 */
const searchLocationListScrape = async (logger: FastifyBaseLogger, postal: string): Promise<LocationSummary[]> => {
  logger.info('scrape store location list - begin')
  const response = await axios.get(`${HTTPAddress.Website}/api/restaurants/getLocations?limit=10&location=${postal}`)
  if (response.status === StatusCodes.OK) {
    const locationListResponse: LocationListResponse = response.data
    if (locationListResponse.isSuccessful) {
      const locationSummaryList: LocationSummary[] = locationListResponse.data.geofences.map((x) => {
        return {
          id: parseInt(x.externalId, 10),
          key: x.metadata.slug,
          name: unescape(x.description),
          url: `${HTTPAddress.Website}/restaurants/${x.metadata.slug}`
        }
      })
      logger.info('scrape store location list - success')
      return locationSummaryList
    } else {
      logger.info('scrape store location list - failure')
      throw new httpErrors.InternalServerError('Unable to search for store locations.')
    }
  } else {
    logger.info('scrape store location list - failure')
    throw new httpErrors.InternalServerError('Unable to search for store locations.')
  }
}

/**
 * Searches for store locations.
 * @param {FastifyRequest} request - The request instance.
 * @returns {LocationList} - A list of the nearest store locations.
 */
export const searchLocationList = async (request: FastifyRequest): Promise<LocationList> => {
  const locationListQuery = combineAliasesLocationList(request.query as LocationListQuery)
  if (postalCodes.validate('US', locationListQuery.postal) !== true) {
    throw new httpErrors.BadRequest('Invalid postal code.')
  }

  const locationList = await searchLocationListScrape(request.log, locationListQuery.postal)
  return {
    items: locationList
  }
}

/**
 * Gets a store location by reading from the cache.
 * @param {Cache} cache - The cache object.
 * @param {number} locationID - The ID of the store location.
 * @returns {CachedAsset<LocationDetail> | undefined} - A store location.
 */
const getLocationCache = (cache: Cache, locationID: number): CachedAsset<LocationDetail> | undefined => {
  return cache.read<LocationDetail>(getCacheKeyLocation(locationID))
}

/**
 * Writes a store location to the cache.
 * @param {Cache} cache - The cache object.
 * @param {LocationDetail} locationDetail - A store location.
 * @returns {CachedAsset<LocationDetail>} - A store location.
 */
const setLocationCache = (cache: Cache, locationDetail: LocationDetail): CachedAsset<LocationDetail> => {
  return cache.write<LocationDetail>(getCacheKeyLocation(locationDetail.id), locationDetail)
}

/**
 * Gets a store location by scraping the Culver's website.
 * @param {FastifyBaseLogger} logger - The logger instance.
 * @param {number} locationID - The ID of the store location.
 * @returns {LocationDetail} - A store location.
 */
const getLocationScrape = async (logger: FastifyBaseLogger, locationID: number): Promise<LocationDetail> => {
  // TODO: https://www.culvers.com/api/restaurants/getDetails?slug=<location-key>
  logger.info('scrape store location - begin')
  const response = await axios.get(`${HTTPAddress.Website}/fotd.aspx?storeid=${locationID}`)
  if (response.status === StatusCodes.OK) {
    if (response.request.res.responseUrl !== `${HTTPAddress.Website}/flavor-of-the-day`) {
      const html = parse(response.data)
      let schedule: Schedule | null = null
      const hours = html.querySelector('.hours')
      if (hours) {
        const scheduleList = hours.getElementsByTagName('ul')
        if (scheduleList.length > 0) {
          const defaultScheduleDay = {
            open: '',
            close: ''
          }
          schedule = {
            monday: defaultScheduleDay,
            tuesday: defaultScheduleDay,
            wednesday: defaultScheduleDay,
            thursday: defaultScheduleDay,
            friday: defaultScheduleDay,
            saturday: defaultScheduleDay,
            sunday: defaultScheduleDay
          }
          const scheduleListItems = scheduleList[0].getElementsByTagName('li') // Lobby & Dine-In
          for (const scheduleListItem of scheduleListItems) {
            const dateRange = scheduleListItem.childNodes[0].innerText.trim()
            const scheduleDay = {
              open: scheduleListItem.childNodes[1].innerText.split(' - ')[0].trim(),
              close: scheduleListItem.childNodes[1].innerText.split(' - ')[1].trim()
            }
            switch (dateRange) {
              case 'Mon - Sun':
                schedule.monday = scheduleDay
                schedule.tuesday = scheduleDay
                schedule.wednesday = scheduleDay
                schedule.thursday = scheduleDay
                schedule.friday = scheduleDay
                schedule.saturday = scheduleDay
                schedule.sunday = scheduleDay
                break
              case 'Mon - Sat':
                schedule.monday = scheduleDay
                schedule.tuesday = scheduleDay
                schedule.wednesday = scheduleDay
                schedule.thursday = scheduleDay
                schedule.friday = scheduleDay
                schedule.saturday = scheduleDay
                break
              case 'Mon - Fri':
                schedule.monday = scheduleDay
                schedule.tuesday = scheduleDay
                schedule.wednesday = scheduleDay
                schedule.thursday = scheduleDay
                schedule.friday = scheduleDay
                break
              case 'Mon - Thur':
                schedule.monday = scheduleDay
                schedule.tuesday = scheduleDay
                schedule.wednesday = scheduleDay
                schedule.thursday = scheduleDay
                break
              case 'Mon - Wed':
                schedule.monday = scheduleDay
                schedule.tuesday = scheduleDay
                schedule.wednesday = scheduleDay
                break
              case 'Mon - Tues':
                schedule.monday = scheduleDay
                schedule.tuesday = scheduleDay
                break
              case 'Mon':
                schedule.monday = scheduleDay
                break
              case 'Tues - Sun':
                schedule.tuesday = scheduleDay
                schedule.wednesday = scheduleDay
                schedule.thursday = scheduleDay
                schedule.friday = scheduleDay
                schedule.saturday = scheduleDay
                schedule.sunday = scheduleDay
                break
              case 'Tues - Sat':
                schedule.tuesday = scheduleDay
                schedule.wednesday = scheduleDay
                schedule.thursday = scheduleDay
                schedule.friday = scheduleDay
                schedule.saturday = scheduleDay
                break
              case 'Tues - Fri':
                schedule.tuesday = scheduleDay
                schedule.wednesday = scheduleDay
                schedule.thursday = scheduleDay
                schedule.friday = scheduleDay
                break
              case 'Tues - Thur':
                schedule.tuesday = scheduleDay
                schedule.wednesday = scheduleDay
                schedule.thursday = scheduleDay
                break
              case 'Tues - Wed':
                schedule.tuesday = scheduleDay
                schedule.wednesday = scheduleDay
                break
              case 'Tues':
                schedule.tuesday = scheduleDay
                break
              case 'Wed - Sun':
                schedule.wednesday = scheduleDay
                schedule.thursday = scheduleDay
                schedule.friday = scheduleDay
                schedule.saturday = scheduleDay
                schedule.sunday = scheduleDay
                break
              case 'Wed - Sat':
                schedule.wednesday = scheduleDay
                schedule.thursday = scheduleDay
                schedule.friday = scheduleDay
                schedule.saturday = scheduleDay
                break
              case 'Wed - Fri':
                schedule.wednesday = scheduleDay
                schedule.thursday = scheduleDay
                schedule.friday = scheduleDay
                break
              case 'Wed - Thur':
                schedule.wednesday = scheduleDay
                schedule.thursday = scheduleDay
                break
              case 'Wed':
                schedule.wednesday = scheduleDay
                break
              case 'Thur - Sun':
                schedule.thursday = scheduleDay
                schedule.friday = scheduleDay
                schedule.saturday = scheduleDay
                schedule.sunday = scheduleDay
                break
              case 'Thur - Sat':
                schedule.thursday = scheduleDay
                schedule.friday = scheduleDay
                schedule.saturday = scheduleDay
                break
              case 'Thur - Fri':
                schedule.thursday = scheduleDay
                schedule.friday = scheduleDay
                break
              case 'Thur':
                schedule.thursday = scheduleDay
                break
              case 'Fri - Sun':
                schedule.friday = scheduleDay
                schedule.saturday = scheduleDay
                schedule.sunday = scheduleDay
                break
              case 'Fri - Sat':
                schedule.friday = scheduleDay
                schedule.saturday = scheduleDay
                break
              case 'Fri':
                schedule.friday = scheduleDay
                break
              case 'Sat - Sun':
                schedule.saturday = scheduleDay
                schedule.sunday = scheduleDay
                break
              case 'Sat':
                schedule.saturday = scheduleDay
                break
              case 'Sun':
                schedule.sunday = scheduleDay
                break
              default:
                break
            }
          }
        }
      }
      const addressComponents = html.querySelector('.restaurant-address')?.childNodes
      const locationDetail: LocationDetail = {
        id: locationID,
        key: response.request.res.responseUrl.split('/').slice(-1),
        name: unescape(html.getElementsByTagName('h1')[0].innerText.trim()),
        url: response.request.res.responseUrl,
        address: {
          street: addressComponents ? unescape((addressComponents[1].innerText ?? '').trim()) : '',
          city: addressComponents ? unescape((addressComponents[5].innerText ?? '').trim()) : '',
          state: addressComponents ? unescape((addressComponents[7].innerText ?? '').trim()) : '',
          postal: addressComponents ? Number((addressComponents[9].innerText ?? '').trim()) : 0,
          country: 'US'
        },
        schedule: schedule ?? undefined
      }
      logger.info('scrape store location - success')
      return locationDetail
    } else {
      logger.info('scrape store location - failure')
      throw new httpErrors.NotFound('Unable to retrieve store location data.')
    }
  } else {
    logger.info('scrape store location - failure')
    throw new httpErrors.InternalServerError('Unable to retrieve store location data.')
  }
}

/**
 * Gets a store location.
 * @param {FastifyRequest} request - The request instance.
 * @returns {CachedAsset<LocationDetail>} - Information about the specified store location.
 */
export const getLocation = async (request: FastifyRequest): Promise<CachedAsset<LocationDetail>> => {
  const locationParams = request.params as LocationParams
  const location = getLocationCache(request.cache, locationParams.id) ?? setLocationCache(request.cache, await getLocationScrape(request.log, locationParams.id))
  return location
}

/**
 * Gets a store location.
 * @param {Cache} cache - The cache object.
 * @param {FastifyBaseLogger} logger - The logger instance.
 * @param {number} locationID - The ID of the store location.
 * @returns {LocationDetail} - Information about the specified store location.
 */
export const getLocationInternal = async (cache: Cache, logger: FastifyBaseLogger, locationID: number): Promise<LocationDetail> => {
  const location = getLocationCache(cache, locationID) ?? setLocationCache(cache, await getLocationScrape(logger, locationID))
  return location.data
}
