import { FastifyInstance } from 'fastify'
import { HTTPHeader } from '../constants/httpHeader'
import { getCalendarFeed, getCalendarJSON } from '../managers/calendarManager'
import { RouteCalendarFeed, RouteCalendarJSON } from '../routes/calendar'

/**
 * Registers the controller.
 * @param {FastifyInstance} fastifyInstance - The instance of the Fastify runtime to apply the routing to.
 */
export const registerCalendarController = (fastifyInstance: FastifyInstance): void => {
  fastifyInstance.get(RouteCalendarFeed.path, RouteCalendarFeed.options, async (request, response) => {
    const value = await getCalendarFeed(request)
    // TODO: Add Hypermedia
    response
      .code(RouteCalendarFeed.successCode)
      .header(HTTPHeader.Expires, value.expires.toUTCString())
      .send(value.data)
  })
  fastifyInstance.get(RouteCalendarJSON.path, RouteCalendarJSON.options, async (request, response) => {
    const value = await getCalendarJSON(request)
    // TODO: Add Hypermedia
    response
      .code(RouteCalendarJSON.successCode)
      .header(HTTPHeader.Expires, value.expires.toUTCString())
      .send(value.data)
  })
}
