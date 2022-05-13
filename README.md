# Culver's Ice Cream iCal

## Summary

Generate a custom Culver's Flavor of the Day iCal feed.

## TODO

* Planned Libraries
  * [https://www.npmjs.com/package/ical.js](https://www.npmjs.com/package/ical.js)
  * [https://www.npmjs.com/package/@jacobmischka/ical-merger](https://www.npmjs.com/package/@jacobmischka/ical-merger)
  * [https://www.npmjs.com/package/ics](https://www.npmjs.com/package/ics)
* Hypermedia Links
* Test Coverage Via Jest
* Planned Endpoints
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
