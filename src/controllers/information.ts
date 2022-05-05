import { FastifyInstance } from 'fastify'
import { getRoot, getStatus } from '../managers/informationManager'
import { RouteRoot, RouteStatus } from '../routes/information'

/**
 * Registers the controller.
 * @param {FastifyInstance} fastifyInstance - The instance of the Fastify runtime to apply the routing to.
 */
export const registerInformationController = (fastifyInstance: FastifyInstance): void => {
  fastifyInstance.get(RouteRoot.path, RouteRoot.options, (_request, response) => {
    const value = getRoot()
    // TODO: Add Hypermedia
    response
      .code(RouteRoot.successCode)
      .send(value)
  })
  fastifyInstance.get(RouteStatus.path, RouteStatus.options, (_request, response) => {
    const value = getStatus()
    // TODO: Add Hypermedia
    response
      .code(RouteStatus.successCode)
      .send(value)
  })
}
