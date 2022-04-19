export enum RouteTag {
  Location = 'Location',
  Flavor = 'Flavor',
  Calendar = 'Calendar',
  Information = 'Information'
}

/**
 * Translates a RouteTag into its description.
 * @param {RouteTag} routeTag - The RouteTag to translate.
 * @returns {string} - The description.
 */
export const getRouteTagDescription = (routeTag: RouteTag): string => {
  switch (routeTag) {
    case RouteTag.Location:
      return 'Resources related to dealing with store locations.'
    case RouteTag.Flavor:
      return 'Resources related to dealing with ice cream flavors.'
    case RouteTag.Calendar:
      return 'Resources related to dealing with Flavor of the Day calendar events.'
    case RouteTag.Information:
      return 'Resources related to dealing with API information.'
    default:
      return ''
  }
}
