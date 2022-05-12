import axios from 'axios'
import { FastifyLoggerInstance, FastifyRequest } from 'fastify'
import httpErrors from 'http-errors'
import { StatusCodes } from 'http-status-codes'
import postalCodes from 'postal-codes-js'
import LocationDetail from '../types/locationDetail'
import LocationList from '../types/locationList'
import LocationListQuery from '../types/locationListQuery'
import LocationParams from '../types/locationParams'
import LocationSummary from '../types/locationSummary'

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
 * Gets a store location.
 * @param {FastifyRequest} request - The request instance.
 * @returns {LocationDetail} - Information about the specified store location.
 */
export const getLocation = (request: FastifyRequest): LocationDetail => {
  // TODO: Stub Operation
  const locationParams = request.params as LocationParams
  console.log(`getLocation(${JSON.stringify(locationParams)})`)
  return {
    id: 1,
    key: 'key-1',
    name: 'Location #1',
    url: '#',
    address: {
      address1: '123 Fake Street',
      address2: 'Suite 100',
      city: 'Beverly Hills',
      state: 'CA',
      postal: 90210,
      country: 'US'
    },
    schedule: {
      monday: {
        open: '9:00 AM',
        close: '9:00 PM'
      },
      tuesday: {
        open: '9:00 AM',
        close: '9:00 PM'
      },
      wednesday: {
        open: '9:00 AM',
        close: '9:00 PM'
      },
      thursday: {
        open: '9:00 AM',
        close: '9:00 PM'
      },
      friday: {
        open: '9:00 AM',
        close: '9:00 PM'
      },
      saturday: {
        open: '9:00 AM',
        close: '9:00 PM'
      },
      sunday: {
        open: '9:00 AM',
        close: '9:00 PM'
      }
    }
  }
}
