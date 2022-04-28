import { FastifyInstance } from 'fastify'
import { RouteCalendarFeed, RouteCalendarJSON } from '../routes/calendar'

/**
 * Registers the controller.
 * @param {FastifyInstance} fastifyInstance - The instance of the Fastify runtime to apply the routing to.
 */
export const registerCalendarController = (fastifyInstance: FastifyInstance): void => {
  fastifyInstance.get(RouteCalendarFeed.path, RouteCalendarFeed.options, (_request, response) => {
    // TODO: Make Async / Perform Operation / Add Hypermedia / Add Expiration Header
    response
      .code(RouteCalendarFeed.successCode)
      .send(undefined) // TODO: Return Response Body
  })
  fastifyInstance.get(RouteCalendarJSON.path, RouteCalendarJSON.options, (_request, response) => {
    // TODO: Make Async / Perform Operation / Add Hypermedia / Add Expiration Header
    response
      .code(RouteCalendarJSON.successCode)
      .send(undefined) // TODO: Return Response Body
  })
}
