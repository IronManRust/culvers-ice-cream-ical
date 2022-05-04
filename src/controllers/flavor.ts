import { FastifyInstance } from 'fastify'
import { HTTPHeader } from '../constants/httpHeader'
import { getFlavorList, getFlavor } from '../managers/flavorManager'
import { RouteFlavorList, RouteFlavorGet } from '../routes/flavor'
import FlavorParams from '../types/flavorParams'

/**
 * Registers the controller.
 * @param {FastifyInstance} fastifyInstance - The instance of the Fastify runtime to apply the routing to.
 */
export const registerFlavorController = (fastifyInstance: FastifyInstance): void => {
  fastifyInstance.get(RouteFlavorList.path, RouteFlavorList.options, async (_request, response) => {
    const value = await getFlavorList()
    // TODO: Add Hypermedia
    response
      .code(RouteFlavorList.successCode)
      .header(HTTPHeader.Expires, value.expires.toUTCString())
      .send(value.data)
  })
  fastifyInstance.get(RouteFlavorGet.path, RouteFlavorGet.options, async (request, response) => {
    const params = request.params as FlavorParams
    const value = await getFlavor(params)
    // TODO: Add Hypermedia
    response
      .code(RouteFlavorGet.successCode)
      .header(HTTPHeader.Expires, value.expires.toUTCString())
      .send(value.data)
  })
}
