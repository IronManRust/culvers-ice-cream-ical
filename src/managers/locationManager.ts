import axios from 'axios'
import { FastifyLoggerInstance, FastifyRequest } from 'fastify'
import httpErrors from 'http-errors'
import { StatusCodes } from 'http-status-codes'
import { parse } from 'node-html-parser'
import postalCodes from 'postal-codes-js'
import { getCacheKeyLocation } from '../functions/cacheKeys'
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
  ErrorCode: number | undefined
  ErrorMessage: number | undefined
  Collection: {
    Locations: {
      Name: string
      Id: number
      Url: string
    }[]
  }
}

/**
 * Gets a list of store locations by querying Culver's address API.
 * @param {FastifyLoggerInstance} logger - The logger instance.
 * @param {string} postal - The postal code to search for.
 * @returns {LocationSummary[]} - A list of store locations.
 */
const searchLocationListScrape = async (logger: FastifyLoggerInstance, postal: string): Promise<LocationSummary[]> => {
  logger.info('scrape store location list - begin')
  const response = await axios.get(`https://www.culvers.com/api/locate/address/json?address=${postal}`)
  if (response.status === StatusCodes.OK) {
    const locationListResponse: LocationListResponse = response.data
    if (!locationListResponse.ErrorCode && !locationListResponse.ErrorMessage) {
      const locationSummaryList: LocationSummary[] = locationListResponse.Collection.Locations.map((x) => {
        return {
          id: x.Id,
          key: x.Url.split('/')[x.Url.split('/').length - 1],
          name: x.Name,
          url: x.Url
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
  const locationListQuery = request.query as LocationListQuery
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
 * @param {FastifyLoggerInstance} logger - The logger instance.
 * @param {number} locationID - The ID of the store location.
 * @returns {LocationDetail} - A store location.
 */
const getLocationScrape = async (logger: FastifyLoggerInstance, locationID: number): Promise<LocationDetail> => {
  logger.info('scrape store location - begin')
  const response = await axios.get(`https://www.culvers.com/fotd.aspx?storeid=${locationID}`)
  if (response.status === StatusCodes.OK) {
    if (response.request.res.responseUrl !== 'https://www.culvers.com/flavor-of-the-day') {
      const html = parse(response.data)
      let schedule: Schedule | null = null
      const hours = html.querySelector('.hours')
      if (hours) {
        const scheduleList = hours.getElementsByTagName('ul')
        if (scheduleList.length > 0) {
          const scheduleListItems = scheduleList[0].getElementsByTagName('li')
          schedule = {
            monday: {
              open: scheduleListItems[0].childNodes[1].innerText.split(' – ')[0].trim(),
              close: scheduleListItems[0].childNodes[1].innerText.split(' – ')[1].trim()
            },
            tuesday: {
              open: scheduleListItems[1].childNodes[1].innerText.split(' – ')[0].trim(),
              close: scheduleListItems[1].childNodes[1].innerText.split(' – ')[1].trim()
            },
            wednesday: {
              open: scheduleListItems[2].childNodes[1].innerText.split(' – ')[0].trim(),
              close: scheduleListItems[2].childNodes[1].innerText.split(' – ')[1].trim()
            },
            thursday: {
              open: scheduleListItems[3].childNodes[1].innerText.split(' – ')[0].trim(),
              close: scheduleListItems[3].childNodes[1].innerText.split(' – ')[1].trim()
            },
            friday: {
              open: scheduleListItems[4].childNodes[1].innerText.split(' – ')[0].trim(),
              close: scheduleListItems[4].childNodes[1].innerText.split(' – ')[1].trim()
            },
            saturday: {
              open: scheduleListItems[5].childNodes[1].innerText.split(' – ')[0].trim(),
              close: scheduleListItems[5].childNodes[1].innerText.split(' – ')[1].trim()
            },
            sunday: {
              open: scheduleListItems[6].childNodes[1].innerText.split(' – ')[0].trim(),
              close: scheduleListItems[6].childNodes[1].innerText.split(' – ')[1].trim()
            }
          }
        }
      }
      const locationDetail: LocationDetail = {
        id: locationID,
        key: response.request.res.responseUrl.split('/').slice(-1),
        name: html.getElementsByTagName('h1')[0].innerText.trim(),
        url: response.request.res.responseUrl,
        address: {
          street: (html.querySelector('.street-address')?.innerText ?? '').trim(),
          city: (html.querySelector('.locality')?.innerText ?? '').trim(),
          state: (html.querySelector('.region')?.innerText ?? '').trim(),
          postal: Number((html.querySelector('.postal-code')?.innerText ?? '').trim()),
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
