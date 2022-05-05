import { StatusCodes, getReasonPhrase } from 'http-status-codes'
import { links } from './common'
import { ContentType } from '../enums/contentType'
import { HealthStatus } from '../enums/healthStatus'
import { RouteTag } from '../enums/routeTag'
import { RouteVerb } from '../enums/routeVerb'
import { generateJSONSchemaObject } from '../functions/route'
import { getErrorHandlerSchemas } from '../plugins/errorHandler'
import BaseResponse from '../types/baseResponse'
import Route from '../types/route'
import Status from '../types/status'

const errorHandlerSchemas = getErrorHandlerSchemas()

const html = '<html></html>'
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
      response: {
        200: generateJSONSchemaObject(html, getReasonPhrase(StatusCodes.OK), getReasonPhrase(StatusCodes.OK)),
        400: errorHandlerSchemas.HTTP400,
        404: errorHandlerSchemas.HTTP404,
        500: errorHandlerSchemas.HTTP500
      }
    }
  }
}

const root: BaseResponse = {
  links
}
const routeRootPath = '/api'
export const RouteRoot: Route = {
  verb: RouteVerb.GET,
  path: routeRootPath,
  successCode: StatusCodes.OK,
  options: {
    schema: {
      hide: false,
      operationId: 'getRoot',
      summary: 'Gets the API entry point.',
      description: 'Gets the API entry point.',
      tags: [RouteTag.Information],
      consumes: [ContentType.JSON],
      produces: [ContentType.JSON],
      response: {
        200: generateJSONSchemaObject(root, 'API Links Collection', 'The initial API links collection.'),
        400: errorHandlerSchemas.HTTP400,
        404: errorHandlerSchemas.HTTP404,
        500: errorHandlerSchemas.HTTP500
      }
    }
  }
}

const status: Status = {
  health: HealthStatus.Healthy,
  links
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
      response: {
        200: generateJSONSchemaObject(status, 'API Status', 'The API status.'),
        400: errorHandlerSchemas.HTTP400,
        404: errorHandlerSchemas.HTTP404,
        500: errorHandlerSchemas.HTTP500
      }
    }
  }
}
