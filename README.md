# Culver's Ice Cream iCal

## Summary

Generate a custom Culver's Flavor of the Day iCal feed.

## TODO

* Planned Libraries
  * [https://www.npmjs.com/package/fastify-swagger](https://www.npmjs.com/package/fastify-swagger)
  * [https://www.npmjs.com/package/node-cache](https://www.npmjs.com/package/node-cache)
  * [https://www.npmjs.com/package/ical.js](https://www.npmjs.com/package/ical.js)
  * [https://www.npmjs.com/package/@jacobmischka/ical-merger](https://www.npmjs.com/package/@jacobmischka/ical-merger)
  * [https://www.npmjs.com/package/ics](https://www.npmjs.com/package/ics)
* Planned Endpoints
  * `/api/location?postal={postal}`
    * Calls [https://www.culvers.com/api/locate/address/json?address={postal}](https://www.culvers.com/api/locate/address/json?address={postal})
    * Each Result Cached With Key `location:locationID`
    * Limited To 10 Results (Culver's API Constraint)
    * Returns Array Of
      * ID
      * Name
      * URL
      * Address
        * Address1
        * Address2
        * City
        * State
        * Postal
        * Country
      * Hours
        * Monday
        * Tuesday
        * Wednesday
        * Thursday
        * Friday
        * Saturday
        * Sunday
  * `/api/flavors`
    * Calls [https://www.culvers.com/flavor-of-the-day](https://www.culvers.com/flavor-of-the-day)
    * Cached With Key `flavors`
    * Returns Array Of
      * Name
      * Description
      * Image URL
  * `/api/calendar?location={locationIDs}&flavor={flavors}`
    * Calls [https://www.culvers.com/fotd-add-to-calendar/{locationID}/{year}-{month}-{day}](https://www.culvers.com/fotd-add-to-calendar/{locationID}/{year}-{month}-{day})
    * Processes Current And Next Month (Culver's Website Constraint)
    * Cached With Key `flavor:locationID:year-month-day`
    * Returns iCal Feed
      * Aggregates 1-to-Many LocationIDs
      * Filters On 0-to-Many Flavors (Omitted Implies No Filtering)
