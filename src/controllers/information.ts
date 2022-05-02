import { FastifyInstance } from 'fastify'
import { getStatus } from '../managers/informationManager'
import { RouteStatus } from '../routes/information'

/**
 * Registers the controller.
 * @param {FastifyInstance} fastifyInstance - The instance of the Fastify runtime to apply the routing to.
 */
export const registerInformationController = (fastifyInstance: FastifyInstance): void => {
  fastifyInstance.get(RouteStatus.path, RouteStatus.options, (_request, response) => {
    const value = getStatus()
    // TODO: Add Hypermedia
    response
      .code(RouteStatus.successCode)
      // TODO: Add Expiration Header
      .send(value)
  })
}
