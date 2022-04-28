import { FastifyInstance } from 'fastify'
import { RouteLocationSearch, RouteLocationGet } from '../routes/location'

/**
 * Registers the controller.
 * @param {FastifyInstance} fastifyInstance - The instance of the Fastify runtime to apply the routing to.
 */
export const registerLocationController = (fastifyInstance: FastifyInstance): void => {
  fastifyInstance.get(RouteLocationSearch.path, RouteLocationSearch.options, (_request, response) => {
    // TODO: Make Async / Perform Operation / Add Hypermedia / Add Expiration Header
    response
      .code(RouteLocationSearch.successCode)
      .send(undefined) // TODO: Return Response Body
  })
  fastifyInstance.get(RouteLocationGet.path, RouteLocationGet.options, (_request, response) => {
    // TODO: Make Async / Perform Operation / Add Hypermedia / Add Expiration Header
    response
      .code(RouteLocationGet.successCode)
      .send(undefined) // TODO: Return Response Body
  })
}
