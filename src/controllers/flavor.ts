import { FastifyInstance } from 'fastify'
import { getFlavorList, getFlavor } from '../managers/flavorManager'
import { RouteFlavorList, RouteFlavorGet } from '../routes/flavor'
import FlavorParams from '../types/flavorParams'

/**
 * Registers the controller.
 * @param {FastifyInstance} fastifyInstance - The instance of the Fastify runtime to apply the routing to.
 */
export const registerFlavorController = (fastifyInstance: FastifyInstance): void => {
  fastifyInstance.get(RouteFlavorList.path, RouteFlavorList.options, (_request, response) => {
    const value = getFlavorList()
    // TODO: Add Hypermedia
    response
      .code(RouteFlavorList.successCode)
      // TODO: Add Expiration Header
      .send(value)
  })
  fastifyInstance.get(RouteFlavorGet.path, RouteFlavorGet.options, (request, response) => {
    const params = request.params as FlavorParams
    const value = getFlavor(params)
    // TODO: Add Hypermedia
    response
      .code(RouteFlavorGet.successCode)
      // TODO: Add Expiration Header
      .send(value)
  })
}
