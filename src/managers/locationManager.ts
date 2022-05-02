import LocationDetail from '../types/locationDetail'
import LocationList from '../types/locationList'
import LocationListQuery from '../types/locationListQuery'
import LocationParams from '../types/locationParams'

/**
 * Searches for store locations.
 * @param {LocationListQuery} locationListQuery - A list of query terms used to find the nearest store locations.
 * @returns {LocationList} - A list of the nearest store locations.
 */
export const searchLocation = (locationListQuery: LocationListQuery): LocationList => {
  // TODO: Stub Operation
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
 * @param {LocationParams} locationParams - The specified store location.
 * @returns {LocationDetail} - Information about the specified store location.
 */
export const getLocation = (locationParams: LocationParams): LocationDetail => {
  // TODO: Stub Operation
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
