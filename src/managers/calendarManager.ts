import Calendar from '../types/calendar'
import CalendarQuery from '../types/calendarQuery'

/**
 * Gets a calendar.
 * @param {CalendarQuery} calendarQuery - A list of query terms used to generate a calendar.
 * @returns {string} - A Flavor of the Day calendar in iCal format.
 */
export const getCalendarFeed = (calendarQuery: CalendarQuery): string => {
  // TODO: Stub Operation
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
 * @param {CalendarQuery} calendarQuery - A list of query terms used to generate a calendar.
 * @returns {Calendar} - A Flavor of the Day calendar in JSON format.
 */
export const getCalendarJSON = (calendarQuery: CalendarQuery): Calendar => {
  // TODO: Stub Operation
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
          imageURL: '#',
          description: 'This is a description of Flavor #1.'
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
          }
        }
      }
    ]
  }
}
