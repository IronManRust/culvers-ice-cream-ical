import { FastifyInstance } from 'fastify'
import { getCalendarFeed, getCalendarJSON } from '../managers/calendarManager'
import { RouteCalendarFeed, RouteCalendarJSON } from '../routes/calendar'
import CalendarQuery from '../types/calendarQuery'

/**
 * Registers the controller.
 * @param {FastifyInstance} fastifyInstance - The instance of the Fastify runtime to apply the routing to.
 */
export const registerCalendarController = (fastifyInstance: FastifyInstance): void => {
  fastifyInstance.get(RouteCalendarFeed.path, RouteCalendarFeed.options, (request, response) => {
    const query = request.query as CalendarQuery
    const value = getCalendarFeed(query)
    // TODO: Add Hypermedia
    response
      .code(RouteCalendarFeed.successCode)
      // TODO: Add Expiration Header
      .send(value)
  })
  fastifyInstance.get(RouteCalendarJSON.path, RouteCalendarJSON.options, (request, response) => {
    const query = request.query as CalendarQuery
    const value = getCalendarJSON(query)
    // TODO: Add Hypermedia
    response
      .code(RouteCalendarJSON.successCode)
      // TODO: Add Expiration Header
      .send(value)
  })
}
