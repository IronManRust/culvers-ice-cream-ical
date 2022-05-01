import { StatusCodes } from 'http-status-codes'
import { links } from './common'
import { ContentType } from '../enums/contentType'
import { RouteTag } from '../enums/routeTag'
import { RouteVerb } from '../enums/routeVerb'
import { generateJSONSchemaObject, generateJSONSchemaParams } from '../functions/route'
import { getErrorHandlerSchemas } from '../plugins/errorHandler'
import LocationDetail from '../types/locationDetail'
import LocationList from '../types/locationList'
import LocationListQuery from '../types/locationListQuery'
import Route from '../types/route'

const errorHandlerSchemas = getErrorHandlerSchemas()

const locationListQuery: LocationListQuery = {
  postal: 90210
}
const locationList: LocationList = {
  items: [
    {
      id: 1,
      key: 'key-1',
      name: 'Location #1',
      url: '#'
    },
    {
      id: 2,
      key: 'key-2',
      name: 'Location #2',
      url: '#'
    }
  ],
  links
}
const routeLocationSearchPath = '/api/location'
export const RouteLocationSearch: Route = {
  verb: RouteVerb.GET,
  path: routeLocationSearchPath,
  successCode: StatusCodes.OK,
  options: {
    schema: {
      hide: false,
      operationId: 'searchLocation',
      summary: 'Searches for store locations.',
      description: 'Searches for the nearest store locations.',
      tags: [RouteTag.Location],
      consumes: [ContentType.JSON],
      produces: [ContentType.JSON],
      query: generateJSONSchemaObject(locationListQuery, 'Store Location Query Terms', 'A list of query terms used to find the nearest store locations.'),
      response: {
        200: generateJSONSchemaObject(locationList, 'Store Location List', 'A list of the nearest store locations.'),
        400: errorHandlerSchemas.HTTP400,
        404: errorHandlerSchemas.HTTP404,
        500: errorHandlerSchemas.HTTP500
      }
    }
  }
}

const locationDetail: LocationDetail = {
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
  },
  links
}
const routeLocationGetPath = '/api/location/:id'
export const RouteLocationGet: Route = {
  verb: RouteVerb.GET,
  path: routeLocationGetPath,
  successCode: StatusCodes.OK,
  options: {
    schema: {
      hide: false,
      operationId: 'getLocation',
      summary: 'Gets a store location.',
      description: 'Gets information about the specified store location.',
      tags: [RouteTag.Location],
      consumes: [ContentType.JSON],
      produces: [ContentType.JSON],
      params: generateJSONSchemaParams(routeLocationGetPath),
      response: {
        200: generateJSONSchemaObject(locationDetail, 'Store Location Information', 'Information about the specified store location.'),
        400: errorHandlerSchemas.HTTP400,
        404: errorHandlerSchemas.HTTP404,
        500: errorHandlerSchemas.HTTP500
      }
    }
  }
}
