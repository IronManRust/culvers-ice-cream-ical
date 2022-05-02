import { FastifyInstance } from 'fastify'
import { searchLocation, getLocation } from '../managers/locationManager'
import { RouteLocationSearch, RouteLocationGet } from '../routes/location'
import LocationParams from '../types/locationParams'
import LocationQuery from '../types/locationListQuery'

/**
 * Registers the controller.
 * @param {FastifyInstance} fastifyInstance - The instance of the Fastify runtime to apply the routing to.
 */
export const registerLocationController = (fastifyInstance: FastifyInstance): void => {
  fastifyInstance.get(RouteLocationSearch.path, RouteLocationSearch.options, (request, response) => {
    const query = request.query as LocationQuery
    const value = searchLocation(query)
    // TODO: Add Hypermedia
    response
      .code(RouteLocationSearch.successCode)
      // TODO: Add Expiration Header
      .send(value)
  })
  fastifyInstance.get(RouteLocationGet.path, RouteLocationGet.options, (request, response) => {
    const params = request.params as LocationParams
    const value = getLocation(params)
    // TODO: Add Hypermedia
    response
      .code(RouteLocationGet.successCode)
      // TODO: Add Expiration Header
      .send(value)
  })
}
