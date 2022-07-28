import { FastifyInstance } from 'fastify'
import { HTTPHeader } from '../constants/httpHeader'
import { getContentTypeList } from '../enums/contentType'
import { getFlavorList, getFlavor } from '../managers/flavorManager'
import { RouteFlavorList, RouteFlavorGet } from '../routes/flavor'

/**
 * Registers the controller.
 * @param {FastifyInstance} fastifyInstance - The instance of the Fastify runtime to apply the routing to.
 */
export const registerFlavorController = (fastifyInstance: FastifyInstance): void => {
  fastifyInstance.get(RouteFlavorList.path, RouteFlavorList.options, async (request, response) => {
    const value = await getFlavorList(request)
    // TODO: Add Hypermedia
    response
      .code(RouteFlavorList.successCode)
      .header(HTTPHeader.ContentType, getContentTypeList(RouteFlavorList.options.schema.produces))
      .header(HTTPHeader.Expires, value.expires.toUTCString())
      .send(value.data)
  })
  fastifyInstance.get(RouteFlavorGet.path, RouteFlavorGet.options, async (request, response) => {
    const value = await getFlavor(request)
    // TODO: Add Hypermedia
    response
      .code(RouteFlavorGet.successCode)
      .header(HTTPHeader.ContentType, getContentTypeList(RouteFlavorGet.options.schema.produces))
      .header(HTTPHeader.Expires, value.expires.toUTCString())
      .send(value.data)
  })
}
