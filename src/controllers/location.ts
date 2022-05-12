import { FastifyInstance } from 'fastify'
import { searchLocationList, getLocation } from '../managers/locationManager'
import { RouteLocationSearch, RouteLocationGet } from '../routes/location'

/**
 * Registers the controller.
 * @param {FastifyInstance} fastifyInstance - The instance of the Fastify runtime to apply the routing to.
 */
export const registerLocationController = (fastifyInstance: FastifyInstance): void => {
  fastifyInstance.get(RouteLocationSearch.path, RouteLocationSearch.options, async (request, response) => {
    const value = await searchLocationList(request)
    // TODO: Add Hypermedia
    response
      .code(RouteLocationSearch.successCode)
      .send(value)
  })
  fastifyInstance.get(RouteLocationGet.path, RouteLocationGet.options, (request, response) => {
    const value = getLocation(request)
    // TODO: Add Hypermedia
    response
      .code(RouteLocationGet.successCode)
      // TODO: Add Expiration Header
      .send(value)
  })
}
