# Culver's Ice Cream iCal

## Summary

Generate a custom Culver's Flavor of the Day iCal feed.

## TODO

* Planned Libraries
  * [https://www.npmjs.com/package/ical.js](https://www.npmjs.com/package/ical.js)
  * [https://www.npmjs.com/package/@jacobmischka/ical-merger](https://www.npmjs.com/package/@jacobmischka/ical-merger)
  * [https://www.npmjs.com/package/ics](https://www.npmjs.com/package/ics)
* Hypermedia / HATEOAS
  * All resources will contain a `links` collection as a base type.
* Test Coverage Via Jest
* Startup Caching
  * Locations
    * Loops through location IDs from `1` through `1000`
      * If that ID is in the cache, move on.
      * If it is not in the cache, query [https://www.culvers.com/fotd.aspx?storeid={id}](https://www.culvers.com/fotd.aspx?storeid={id})
        * If a 302 to `/flavor-of-the-day/` then the location is not valid, and `NULL` is cached.
        * If a 301 to `/restaurants/{name-url}` make a `node-html-parser` query for `.postal-code` and use that value to do a postal code search (see below), and cache the 10 results.
* Planned Endpoints
  * `GET /api/location?postal={postal}`
    * Calls [https://www.culvers.com/api/locate/address/json?address={postal}](https://www.culvers.com/api/locate/address/json?address={postal})
    * Each Result Cached With Key `location:locationID`
    * Limited To 10 Results (Culver's API Constraint)
    * Returns Array Of
      * ID
      * Name, Display
      * Name, URL
      * URL
  * `GET /api/location/{locationID}`
    * Cached With Key `location:locationID`
    * Returns
      * ID
      * Name, Display
      * Name, URL
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
  * `GET /api/calendar/ical?location={locationIDs}&flavor={flavors}`
    * Calls [https://www.culvers.com/fotd-add-to-calendar/{locationID}/{year}-{month}-{day}](https://www.culvers.com/fotd-add-to-calendar/{locationID}/{year}-{month}-{day})
    * Processes Current And Next Month (Culver's Website Constraint)
    * Cached With Key `flavor:locationID:year-month-day`
    * Returns iCal Feed
      * Aggregates 1-to-Many LocationIDs
      * Filters On 0-to-Many Flavors (Omitted Implies No Filtering)
  * `GET /api/calendar/json?location={locationIDs}&flavor={flavors}`
    * Calls [https://www.culvers.com/fotd-add-to-calendar/{locationID}/{year}-{month}-{day}](https://www.culvers.com/fotd-add-to-calendar/{locationID}/{year}-{month}-{day})
    * Processes Current And Next Month (Culver's Website Constraint)
    * Cached With Key `flavor:locationID:year-month-day`
    * Returns JSON Array
      * Aggregates 1-to-Many LocationIDs
      * Filters On 0-to-Many Flavors (Omitted Implies No Filtering)
  * `GET /api/status`
    * Performs A Health Check
    * Includes Diagnostic Information
      * Total Cached Locations
      * Total Cached Flavors
      * Total Cached Calendar Entries
