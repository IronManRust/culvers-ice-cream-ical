import { StatusCodes } from 'http-status-codes'
import { ContentType } from '../enums/contentType'
import { RouteTag } from '../enums/routeTag'
import { RouteVerb } from '../enums/routeVerb'
import { generateJSONSchemaObject } from '../functions/route'
import { getErrorHandlerSchemas } from '../plugins/errorHandler'
import CalendarQuery from '../types/calendarQuery'
import Route from '../types/route'

const errorHandlerSchemas = getErrorHandlerSchemas()

const calendarQueryFeed: CalendarQuery = {
  locationID: [1, 2],
  flavorKey: ['flavor-1', 'flavor-2']
}
const routeCalendarFeedPath = '/api/calendar/feed'
export const RouteCalendarFeed: Route = {
  verb: RouteVerb.GET,
  path: routeCalendarFeedPath,
  successCode: StatusCodes.OK,
  options: {
    schema: {
      hide: false,
      operationId: 'getCalendarFeed',
      summary: 'Gets a calendar.',
      description: 'Gets a Flavor of the Day calendar in iCal format.',
      tags: [RouteTag.Calendar],
      consumes: [ContentType.JSON],
      produces: [ContentType.iCalendar],
      query: generateJSONSchemaObject(calendarQueryFeed, 'Calendar Query Terms', 'A list of query terms used to generate a calendar.'),
      response: {
        200: generateJSONSchemaObject(undefined, undefined, undefined), // TODO: Response Object
        400: errorHandlerSchemas.HTTP400,
        404: errorHandlerSchemas.HTTP404,
        500: errorHandlerSchemas.HTTP500
      }
    }
  }
}

const calendarQueryJSON: CalendarQuery = {
  locationID: [1, 2],
  flavorKey: ['flavor-1', 'flavor-2']
}
const routeCalendarJSONPath = '/api/calendar/json'
export const RouteCalendarJSON: Route = {
  verb: RouteVerb.GET,
  path: routeCalendarJSONPath,
  successCode: StatusCodes.OK,
  options: {
    schema: {
      hide: false,
      operationId: 'getCalendarJSON',
      summary: 'Gets a calendar.',
      description: 'Gets a Flavor of the Day calendar in JSON format.',
      tags: [RouteTag.Calendar],
      consumes: [ContentType.JSON],
      produces: [ContentType.JSON],
      query: generateJSONSchemaObject(calendarQueryJSON, 'Calendar Query Terms', 'A list of query terms used to generate a calendar.'),
      response: {
        200: generateJSONSchemaObject(undefined, undefined, undefined), // TODO: Response Object
        400: errorHandlerSchemas.HTTP400,
        404: errorHandlerSchemas.HTTP404,
        500: errorHandlerSchemas.HTTP500
      }
    }
  }
}
