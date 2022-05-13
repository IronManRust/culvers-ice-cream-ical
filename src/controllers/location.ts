import { FastifyInstance } from 'fastify'
import { HTTPHeader } from '../constants/httpHeader'
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
  fastifyInstance.get(RouteLocationGet.path, RouteLocationGet.options, async (request, response) => {
    const value = await getLocation(request)
    // TODO: Add Hypermedia
    response
      .code(RouteLocationGet.successCode)
      .header(HTTPHeader.Expires, value.expires.toUTCString())
      .send(value.data)
  })
}
