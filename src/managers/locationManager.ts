import { FastifyRequest } from 'fastify'
import LocationDetail from '../types/locationDetail'
import LocationList from '../types/locationList'
import LocationListQuery from '../types/locationListQuery'
import LocationParams from '../types/locationParams'

/**
 * Searches for store locations.
 * @param {FastifyRequest} request - The request instance.
 * @returns {LocationList} - A list of the nearest store locations.
 */
export const searchLocation = (request: FastifyRequest): LocationList => {
  // TODO: Stub Operation
  const locationListQuery = request.query as LocationListQuery
  console.log(`searchLocation(${JSON.stringify(locationListQuery)})`)
  return {
    items: [
      {
        id: 1,
        key: 'key-1',
        name: 'Location #1',
        url: '#'
      }
    ]
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
