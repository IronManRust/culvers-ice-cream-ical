import { StatusCodes } from 'http-status-codes'
import { ContentType } from '../enums/contentType'
import { RouteTag } from '../enums/routeTag'
import { RouteVerb } from '../enums/routeVerb'
import { generateJSONSchemaObject, generateJSONSchemaParams } from '../functions/route'
import { getErrorHandlerSchemas } from '../plugins/errorHandler'
import Route from '../types/route'

const errorHandlerSchemas = getErrorHandlerSchemas()

const routeIndexPath = '/'
export const RouteIndex: Route = {
  verb: RouteVerb.GET,
  path: routeIndexPath,
  successCode: StatusCodes.OK,
  options: {
    schema: {
      hide: false,
      operationId: 'getIndex',
      summary: 'Gets the API landing page.',
      description: 'Gets the API landing page.',
      tags: [RouteTag.Information],
      consumes: [ContentType.JSON],
      produces: [ContentType.HTML],
      params: generateJSONSchemaParams(routeIndexPath),
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

const routeStatusPath = '/api/status'
export const RouteStatus: Route = {
  verb: RouteVerb.GET,
  path: routeStatusPath,
  successCode: StatusCodes.OK,
  options: {
    schema: {
      hide: false,
      operationId: 'getStatus',
      summary: 'Gets the API status.',
      description: 'Gets the API status.',
      tags: [RouteTag.Information],
      consumes: [ContentType.JSON],
      produces: [ContentType.JSON],
      params: generateJSONSchemaParams(routeStatusPath),
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
