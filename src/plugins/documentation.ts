import { FastifyInstance, FastifyReply } from 'fastify'
import FastifyStatic from 'fastify-static'
import FastifySwagger from 'fastify-swagger'
import fs from 'fs'
import { HTTPHeader } from '../constants/httpHeader'
import { ContentType, getContentTypeValue } from '../enums/contentType'
import { RouteTag, getRouteTagDescription } from '../enums/routeTag'
import { RouteIndex } from '../routes/information'

/**
 * Returns a static file with the specified status code and file name.
 * @param {FastifyReply} response - The HTTP response object to return.
 * @param {number} statusCode - The HTTP status code to use.
 * @param {ContentType} contentType - The HTTP content type to use.
 * @param {string} fileName - The file name to use.
 * @returns {FastifyReply} - The HTTP response object to return.
 */
const sendStaticFile = (response: FastifyReply, statusCode: number, contentType: ContentType, fileName: string): FastifyReply => {
  return response
    .code(statusCode)
    .header(HTTPHeader.ContentType, getContentTypeValue(contentType))
    .sendFile(fileName)
}

/**
 * Sets up documentation handling functionality.
 * @param {FastifyInstance} fastifyInstance - The instance of the Fastify runtime to apply the documentation handlers to.
 */
export const setupDocumentation = (fastifyInstance: FastifyInstance): void => {
  const metadata = JSON.parse(fs.readFileSync(`${__dirname}/../metadata.json`, {
    encoding: 'utf8'
  }))
  fastifyInstance.register(FastifySwagger, {
    swagger: {
      info: {
        title: metadata.name || '',
        description: metadata.description || '',
        version: metadata.version || '0.0.0',
        contact: {
          name: metadata.contactName || '',
          email: metadata.contactEmail || '',
          url: metadata.contactURL || ''
        },
        license: {
          name: metadata.license || '',
          url: `https://opensource.org/licenses/${metadata.license || ''}`
        }
      },
      tags: [
        {
          name: RouteTag.Location,
          description: getRouteTagDescription(RouteTag.Location)
        },
        {
          name: RouteTag.Flavor,
          description: getRouteTagDescription(RouteTag.Flavor)
        },
        {
          name: RouteTag.Calendar,
          description: getRouteTagDescription(RouteTag.Calendar)
        },
        {
          name: RouteTag.Information,
          description: getRouteTagDescription(RouteTag.Information)
        }
      ]
    },
    exposeRoute: true,
    routePrefix: '/swagger'
  })

  fastifyInstance.register(FastifyStatic, {
    root: `${__dirname}/..`
  })

  fastifyInstance.ready(() => {
    const spec20 = fastifyInstance.swagger()
    const spec30 = JSON.parse(JSON.stringify(spec20))
    spec30.openapi = '3.0'
    try {
      fs.writeFileSync(`${__dirname}/../spec-2.0.json`, JSON.stringify(spec20), {
        encoding: 'utf8'
      })
      fs.writeFileSync(`${__dirname}/../spec-3.0.json`, JSON.stringify(spec30), {
        encoding: 'utf8'
      })
    } catch {
      // Do Nothing
      // TODO: Possibly Do Something
    }
  })

  fastifyInstance.get(RouteIndex.path, RouteIndex.options, (_request, response) => {
    sendStaticFile(response, RouteIndex.successCode, ContentType.HTML, 'index.html')
  })
}
