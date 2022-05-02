import { StatusCodes } from 'http-status-codes'
import { links } from './common'
import { ContentType } from '../enums/contentType'
import { RouteTag } from '../enums/routeTag'
import { RouteVerb } from '../enums/routeVerb'
import { generateJSONSchemaObject } from '../functions/route'
import { getErrorHandlerSchemas } from '../plugins/errorHandler'
import Calendar from '../types/calendar'
import CalendarQuery from '../types/calendarQuery'
import Route from '../types/route'

const errorHandlerSchemas = getErrorHandlerSchemas()

const calendarFeed: string = String`
  BEGIN:VCALENDAR
  PRODID:-//Culver's//NONSGML Flavor of the Day//EN
  VERSION:2.0
  BEGIN:VEVENT
  ...
  END:VEVENT
  BEGIN:VEVENT
  ...
  END:VEVENT
  END:VCALENDAR
`
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
        200: generateJSONSchemaObject(calendarFeed, 'Calendar', 'A Flavor of the Day calendar in iCal format.'),
        400: errorHandlerSchemas.HTTP400,
        404: errorHandlerSchemas.HTTP404,
        500: errorHandlerSchemas.HTTP500
      }
    }
  }
}

const calendarJSON: Calendar = {
  items: [
    {
      date: {
        start: new Date('2020-01-01T00:00:00.000+00:00').toISOString(),
        end: new Date('2020-01-01T23:59:59.000+00:00').toISOString()
      },
      flavor: {
        key: 'flavor-1',
        name: 'Flavor #1',
        imageURL: '#',
        description: 'This is a description of Flavor #1.',
        links
      },
      location: {
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
        links
      },
      links
    },
    {
      date: {
        start: new Date('2020-01-02T00:00:00.000+00:00').toISOString(),
        end: new Date('2020-01-02T23:59:59.000+00:00').toISOString()
      },
      flavor: {
        key: 'flavor-2',
        name: 'Flavor #2',
        imageURL: '#',
        description: 'This is a description of Flavor #2.',
        links
      },
      location: {
        id: 2,
        key: 'key-2',
        name: 'Location #2',
        url: '#',
        address: {
          address1: '456 Fake Street',
          address2: 'Suite 200',
          city: 'Beverly Hills',
          state: 'CA',
          postal: 90210,
          country: 'US'
        },
        links
      },
      links
    }
  ],
  links
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
        200: generateJSONSchemaObject(calendarJSON, 'Calendar', 'A Flavor of the Day calendar in JSON format.'),
        400: errorHandlerSchemas.HTTP400,
        404: errorHandlerSchemas.HTTP404,
        500: errorHandlerSchemas.HTTP500
      }
    }
  }
}
