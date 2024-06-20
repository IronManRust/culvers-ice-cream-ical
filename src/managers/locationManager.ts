import axios from 'axios'
import { FastifyBaseLogger, FastifyRequest } from 'fastify'
import fs from 'fs'
import { unescape } from 'html-escaper'
import httpErrors from 'http-errors'
import { StatusCodes } from 'http-status-codes'
import pRetry from 'p-retry'
import postalCodes from 'postal-codes-js'
import { HTTPAddress } from '../constants/httpAddress'
import { RetryOptions } from '../constants/retryOptions'
import { getCacheKeyLocation } from '../functions/cacheKeys'
import { combineAliasesLocationList } from '../functions/combineAliases'
import { Cache } from '../plugins/caching'
import CachedAsset from '../types/cachedAsset'
import LocationDetail from '../types/locationDetail'
import LocationList from '../types/locationList'
import LocationListQuery from '../types/locationListQuery'
import LocationParams from '../types/locationParams'
import LocationSummary from '../types/locationSummary'

interface LocationMapping {
  [id: string]: string
}
const locationMapping: LocationMapping = JSON.parse(fs.readFileSync(`${__dirname}/../locationMapping.json`).toString())

/**
 * The JSON object returned by the Culver's address API.
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
 * The JSON object returned by the Culver's address API.
 */
interface LocationResponse {
  isSuccessful: boolean
  message: string
  data: {
    id: number
    number: string
    title: string
    slug: string
    phoneNumber: string
    address: string
    city: string
    state: string
    postalCode: string
    latitude: number
    longitude: number
    onlineOrderUrl: string
    ownerFriendlyName: string
    ownerMessage: string
    jobsApplyUrl: string
    flavorOfTheDay: {
      flavorId: number
      menuItemId: number
      onDate: string
      title: string
      urlSlug: string
      image: {
        useWhiteBackground: boolean
        src: string
      }
    }[]
    upcomingEvents: string[]
    currentTimes: {
      dineInTimes: {
        opens: string
        closes: string
        dayOfWeek: number
        day: string
      }[]
      driveThruTimes: {
        opens: string
        closes: string
        dayOfWeek: number
        day: string
      }[]
    }
    hours: {
      dineInTimes: {
        days: string
        times: string
      }[]
      driveThruTimes: {
        days: string
        times: string
      }[]
    }
    timeZoneOffset: number
    isTemporaryClosed: boolean
  }
  isException: boolean
  exceptionCorrelationId: string
}

/**
 * Maps a location ID to a location key.
 * @param {number} locationID - The ID of the store location.
 * @returns {string} - The key of the store location.
 */
export const mapLocationIDToKey = (locationID: number): string => {
  return locationMapping[locationID.toString()]
}

/**
 * Gets a list of store locations by querying Culver's address API.
 * @param {FastifyBaseLogger} logger - The logger instance.
 * @param {string} postal - The postal code to search for.
 * @returns {LocationSummary[]} - A list of store locations.
 */
const searchLocationListScrape = async (logger: FastifyBaseLogger, postal: string): Promise<LocationSummary[]> => {
  logger.info('scrape store location list - begin')
  const response = await axios.get(`${HTTPAddress.Website}/api/locator/getLocations?limit=10&radius=40233&location=${postal}`)
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

  const locationList = await pRetry(() => { return searchLocationListScrape(request.log, locationListQuery.postal) }, RetryOptions)
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
  logger.info('scrape store location - begin')
  const locationKey = mapLocationIDToKey(locationID)
  if (locationKey) {
    const response = await axios.get(`${HTTPAddress.Website}/api/restaurants/getDetails?slug=${locationKey}`)
    if (response.status === StatusCodes.OK) {
      const locationResponse: LocationResponse = response.data
      const locationDetail: LocationDetail = {
        id: locationID,
        key: locationKey,
        name: unescape(locationResponse.data.title),
        url: `${HTTPAddress.Website}/restaurants/${locationKey}`,
        address: {
          street: unescape(locationResponse.data.address),
          city: unescape(locationResponse.data.city),
          state: unescape(locationResponse.data.state),
          postal: Number(locationResponse.data.postalCode),
          country: 'US'
        },
        schedule: {
          sunday: {
            open: locationResponse.data.currentTimes.dineInTimes[0].opens,
            close: locationResponse.data.currentTimes.dineInTimes[0].closes
          },
          monday: {
            open: locationResponse.data.currentTimes.dineInTimes[1].opens,
            close: locationResponse.data.currentTimes.dineInTimes[1].closes
          },
          tuesday: {
            open: locationResponse.data.currentTimes.dineInTimes[2].opens,
            close: locationResponse.data.currentTimes.dineInTimes[2].closes
          },
          wednesday: {
            open: locationResponse.data.currentTimes.dineInTimes[3].opens,
            close: locationResponse.data.currentTimes.dineInTimes[3].closes
          },
          thursday: {
            open: locationResponse.data.currentTimes.dineInTimes[4].opens,
            close: locationResponse.data.currentTimes.dineInTimes[4].closes
          },
          friday: {
            open: locationResponse.data.currentTimes.dineInTimes[5].opens,
            close: locationResponse.data.currentTimes.dineInTimes[5].closes
          },
          saturday: {
            open: locationResponse.data.currentTimes.dineInTimes[6].opens,
            close: locationResponse.data.currentTimes.dineInTimes[6].closes
          }
        }
      }
      logger.info('scrape store location - success')
      return locationDetail
    } else {
      logger.info('scrape store location - failure')
      throw new httpErrors.InternalServerError('Unable to retrieve store location data.')
    }
  } else {
    logger.info('scrape store location - failure')
    throw new httpErrors.NotFound('Unable to retrieve store location data.')
  }
}

/**
 * Gets a store location.
 * @param {FastifyRequest} request - The request instance.
 * @returns {CachedAsset<LocationDetail>} - Information about the specified store location.
 */
export const getLocation = async (request: FastifyRequest): Promise<CachedAsset<LocationDetail>> => {
  const locationParams = request.params as LocationParams
  const location = getLocationCache(request.cache, locationParams.id) ?? setLocationCache(request.cache, await pRetry(() => { return getLocationScrape(request.log, locationParams.id) }, RetryOptions))
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
  const location = getLocationCache(cache, locationID) ?? setLocationCache(cache, await pRetry(() => { return getLocationScrape(logger, locationID) }, RetryOptions))
  return location.data
}
