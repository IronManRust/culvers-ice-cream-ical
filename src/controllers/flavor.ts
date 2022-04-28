import { FastifyInstance } from 'fastify'
import { RouteFlavorList, RouteFlavorGet } from '../routes/flavor'

/**
 * Registers the controller.
 * @param {FastifyInstance} fastifyInstance - The instance of the Fastify runtime to apply the routing to.
 */
export const registerFlavorController = (fastifyInstance: FastifyInstance): void => {
  fastifyInstance.get(RouteFlavorList.path, RouteFlavorList.options, (_request, response) => {
    // TODO: Make Async / Perform Operation / Add Hypermedia / Add Expiration Header
    response
      .code(RouteFlavorList.successCode)
      .send(undefined) // TODO: Return Response Body
  })
  fastifyInstance.get(RouteFlavorGet.path, RouteFlavorGet.options, (_request, response) => {
    // TODO: Make Async / Perform Operation / Add Hypermedia / Add Expiration Header
    response
      .code(RouteFlavorGet.successCode)
      .send(undefined) // TODO: Return Response Body
  })
}
