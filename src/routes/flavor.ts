import { StatusCodes } from 'http-status-codes'
import { ContentType } from '../enums/contentType'
import { RouteTag } from '../enums/routeTag'
import { RouteVerb } from '../enums/routeVerb'
import { generateJSONSchemaObject, generateJSONSchemaParams } from '../functions/route'
import { getErrorHandlerSchemas } from '../plugins/errorHandler'
import Route from '../types/route'

const errorHandlerSchemas = getErrorHandlerSchemas()

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
      params: generateJSONSchemaParams(routeFlavorListPath),
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

const routeFlavorGetPath = '/api/flavor/:flavorName'
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
