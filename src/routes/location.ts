import { StatusCodes } from 'http-status-codes'
import { ContentType } from '../enums/contentType'
import { RouteTag } from '../enums/routeTag'
import { RouteVerb } from '../enums/routeVerb'
import { generateJSONSchemaObject, generateJSONSchemaParams } from '../functions/route'
import { getErrorHandlerSchemas } from '../plugins/errorHandler'
import Route from '../types/route'

const errorHandlerSchemas = getErrorHandlerSchemas()

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
      params: generateJSONSchemaParams(routeLocationSearchPath),
      headers: undefined,
      response: {
        200: generateJSONSchemaObject(undefined, undefined, undefined), // TODO: Response Object
        400: errorHandlerSchemas.HTTP400,
        404: errorHandlerSchemas.HTTP404,
        500: errorHandlerSchemas.HTTP500
      }
    }
  }
}

const routeLocationGetPath = '/api/location/:locationID'
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
      headers: undefined,
      response: {
        200: generateJSONSchemaObject(undefined, undefined, undefined), // TODO: Response Object
        400: errorHandlerSchemas.HTTP400,
        404: errorHandlerSchemas.HTTP404,
        500: errorHandlerSchemas.HTTP500
      }
    }
  }
}
