import { RouteTag, getRouteTagDescription } from '../../src/enums/routeTag'

describe('Enum: RouteTag', () => {

  describe('getRouteTagDescription', () => {

    const mappings = [
      { key: RouteTag.Location, value: 'Resources related to dealing with store locations.' },
      { key: RouteTag.Flavor, value: 'Resources related to dealing with ice cream flavors.' },
      { key: RouteTag.Calendar, value: 'Resources related to dealing with Flavor of the Day calendar events.' },
      { key: RouteTag.Information, value: 'Resources related to dealing with API information.' },
      { key: 'InvalidRouteTag' as RouteTag, value: '' }
    ]

    for (const mapping of mappings) {
      it(`handles value '${mapping.key}'`, () => {
        expect(getRouteTagDescription(mapping.key)).toEqual(mapping.value)
      })
    }

  })

})
