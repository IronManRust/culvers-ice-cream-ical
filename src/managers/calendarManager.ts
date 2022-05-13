import { FastifyRequest } from 'fastify'
import Calendar from '../types/calendar'
import CalendarQuery from '../types/calendarQuery'

/**
 * Gets a calendar.
 * @param {FastifyRequest} request - The request instance.
 * @returns {string} - A Flavor of the Day calendar in iCal format.
 */
export const getCalendarFeed = (request: FastifyRequest): string => {
  // TODO: Stub Operation
  const calendarQuery = request.query as CalendarQuery
  console.log(`getCalendarFeed(${JSON.stringify(calendarQuery)})`)
  return String`
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
}

/**
 * Gets a calendar.
 * @param {FastifyRequest} request - The request instance.
 * @returns {Calendar} - A Flavor of the Day calendar in JSON format.
 */
export const getCalendarJSON = (request: FastifyRequest): Calendar => {
  // TODO: Stub Operation
  const calendarQuery = request.query as CalendarQuery
  console.log(`getCalendarJSON(${JSON.stringify(calendarQuery)})`)
  return {
    items: [
      {
        date: {
          start: new Date('2020-01-01T00:00:00.000+00:00').toISOString(),
          end: new Date('2020-01-01T23:59:59.000+00:00').toISOString()
        },
        flavor: {
          key: 'flavor-1',
          name: 'Flavor #1',
          flavorURL: '#',
          imageURL: '#',
          description: 'This is a description of Flavor #1.'
        },
        location: {
          id: 1,
          key: 'key-1',
          name: 'Location #1',
          url: '#',
          address: {
            street: '123 Fake Street',
            city: 'Beverly Hills',
            state: 'CA',
            postal: 90210,
            country: 'US'
          }
        }
      }
    ]
  }
}
