import ToJsonSchema from 'to-json-schema'
import { ContentType } from '../enums/contentType'
import { RouteTag } from '../enums/routeTag'
import { RouteVerb } from '../enums/routeVerb'

export default interface Route {
  verb: RouteVerb
  path: string
  successCode: number
  options: {
    schema: {
      hide: boolean
      operationId: string
      summary: string
      description: string
      tags: RouteTag[]
      consumes: ContentType[]
      produces: ContentType[]
      body?: ToJsonSchema.JSONSchema3or4
      query?: ToJsonSchema.JSONSchema3or4
      params?: ToJsonSchema.JSONSchema3or4
      headers?: ToJsonSchema.JSONSchema3or4
      response?: {
        [code: string]: ToJsonSchema.JSONSchema3or4
      }
    }
  }
}
