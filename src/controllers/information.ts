import { FastifyInstance } from 'fastify'
import { RouteStatus } from '../routes/information'

/**
 * Registers the controller.
 * @param {FastifyInstance} fastifyInstance - The instance of the Fastify runtime to apply the routing to.
 */
export const registerInformationController = (fastifyInstance: FastifyInstance): void => {
  fastifyInstance.get(RouteStatus.path, RouteStatus.options, (_request, response) => {
    // TODO: Make Async / Perform Operation / Add Hypermedia / Add Expiration Header
    response
      .code(RouteStatus.successCode)
      .send(undefined) // TODO: Return Response Body
  })
}
