import { StatusCodes } from 'http-status-codes'
import { links } from './common'
import { ContentType } from '../enums/contentType'
import { RouteTag } from '../enums/routeTag'
import { RouteVerb } from '../enums/routeVerb'
import { generateJSONSchemaObject, generateJSONSchemaParams } from '../functions/route'
import { getErrorHandlerSchemas } from '../plugins/errorHandler'
import FlavorDetail from '../types/flavorDetail'
import FlavorList from '../types/flavorList'
import Route from '../types/route'

const errorHandlerSchemas = getErrorHandlerSchemas()

const flavorList: FlavorList = {
  items: [
    {
      key: 'flavor-1',
      name: 'Flavor #1',
      imageURL: '#',
      links
    },
    {
      key: 'flavor-2',
      name: 'Flavor #2',
      imageURL: '#',
      links
    }
  ],
  links
}
const routeFlavorListPath = '/api/flavor'
export const RouteFlavorList: Route = {
  verb: RouteVerb.GET,
  path: routeFlavorListPath,
  successCode: StatusCodes.OK,
  options: {
    schema: {
      hide: false,
      operationId: 'getFlavorList',
      summary: 'Gets a list of flavors.',
      description: 'Gets a list of all available flavors.',
      tags: [RouteTag.Flavor],
      consumes: [ContentType.JSON],
      produces: [ContentType.JSON],
      response: {
        200: generateJSONSchemaObject(flavorList, 'Flavor List', 'A list of all available flavors.'),
        400: errorHandlerSchemas.HTTP400,
        404: errorHandlerSchemas.HTTP404,
        500: errorHandlerSchemas.HTTP500
      }
    }
  }
}

const flavorDetail: FlavorDetail = {
  key: 'flavor-1',
  name: 'Flavor #1',
  imageURL: '#',
  description: 'This is a description of Flavor #1.',
  links
}
const routeFlavorGetPath = '/api/flavor/:key'
export const RouteFlavorGet: Route = {
  verb: RouteVerb.GET,
  path: routeFlavorGetPath,
  successCode: StatusCodes.OK,
  options: {
    schema: {
      hide: false,
      operationId: 'getFlavor',
      summary: 'Gets a flavor.',
      description: 'Gets information about the specified flavor.',
      tags: [RouteTag.Flavor],
      consumes: [ContentType.JSON],
      produces: [ContentType.JSON],
      params: generateJSONSchemaParams(routeFlavorGetPath),
      response: {
        200: generateJSONSchemaObject(flavorDetail, 'Flavor Information', 'Information about the specified flavor.'),
        400: errorHandlerSchemas.HTTP400,
        404: errorHandlerSchemas.HTTP404,
        500: errorHandlerSchemas.HTTP500
      }
    }
  }
}
