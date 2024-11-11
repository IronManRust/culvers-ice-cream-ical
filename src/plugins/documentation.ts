import { FastifyInstance, FastifyReply } from 'fastify'
import FastifyStatic from '@fastify/static'
import FastifySwagger from '@fastify/swagger'
import FastifySwaggerUI from '@fastify/swagger-ui'
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
export const setupDocumentation = async (fastifyInstance: FastifyInstance): Promise<void> => {
  const metadata = JSON.parse(fs.readFileSync(`${__dirname}/../metadata.json`, {
    encoding: 'utf8'
  }))
  await fastifyInstance.register(FastifySwagger, {
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
    }
  })

  await fastifyInstance.register(FastifySwaggerUI, {
    routePrefix: '/swagger',
    theme: {
      title: 'Culver\'s Ice Cream iCal',
      favicon: [
        {
          filename: 'favicon.ico',
          rel: 'icon',
          sizes: '16x16',
          type: 'image/x-icon',
          content: fs.readFileSync(`${__dirname}/../favicon.ico`)
        },
        {
          filename: 'favicon-16x16.png',
          rel: 'icon',
          sizes: '16x16',
          type: 'image/png',
          content: fs.readFileSync(`${__dirname}/../favicon-16x16.png`)
        },
        {
          filename: 'favicon-32x32.png',
          rel: 'icon',
          sizes: '32x32',
          type: 'image/png',
          content: fs.readFileSync(`${__dirname}/../favicon-32x32.png`)
        }
      ],
      js: [/* TODO: UI JS */],
      css: [/* TODO: UI CSS */]
    },
    logo: {
      type: 'image/png',
      content: fs.readFileSync(`${__dirname}/../logo.png`)
    }
  })

  await fastifyInstance.register(FastifyStatic, {
    root: `${__dirname}/..`
  })

  fastifyInstance.get(RouteIndex.path, RouteIndex.options, (_request, response) => {
    sendStaticFile(response, RouteIndex.successCode, ContentType.HTML, 'index.html')
  })
}
