# Culver's Ice Cream iCal

## Summary

Generate a custom Culver's Flavor of the Day iCal feed.

## TODO

* Planned Libraries
  * [https://www.npmjs.com/package/node-cache](https://www.npmjs.com/package/node-cache)
  * [https://www.npmjs.com/package/ical.js](https://www.npmjs.com/package/ical.js)
  * [https://www.npmjs.com/package/@jacobmischka/ical-merger](https://www.npmjs.com/package/@jacobmischka/ical-merger)
  * [https://www.npmjs.com/package/ics](https://www.npmjs.com/package/ics)
* Hypermedia / HATEOAS
  * All resources will contain a `_links` collection as a base type.
* Planned Endpoints
  * `/api/location?postal={postal}`
    * Calls [https://www.culvers.com/api/locate/address/json?address={postal}](https://www.culvers.com/api/locate/address/json?address={postal})
    * Each Result Cached With Key `location:locationID`
    * Limited To 10 Results (Culver's API Constraint)
    * Returns Array Of
      * ID
      * Name, Display
      * Name, URL
      * URL
  * `/api/location/{locationID}`
    * Calls [http://www.culvers.com/restaurants/{name-url}](http://www.culvers.com/restaurants/{name-url})
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
  * `/api/flavor`
    * Calls [https://www.culvers.com/flavor-of-the-day](https://www.culvers.com/flavor-of-the-day)
    * Cached With Key `flavors`
    * Returns Array Of
      * Name, Display
      * Name, URL
      * Image URL
  * `/api/flavor/{name-url}`
    * Invokes `/api/flavor` If Not In Cache
    * Returns
      * Name, Display
      * Name, URL
      * Image URL
      * Description
  * `/api/calendar/ical?location={locationIDs}&flavor={flavors}`
    * Calls [https://www.culvers.com/fotd-add-to-calendar/{locationID}/{year}-{month}-{day}](https://www.culvers.com/fotd-add-to-calendar/{locationID}/{year}-{month}-{day})
    * Processes Current And Next Month (Culver's Website Constraint)
    * Cached With Key `flavor:locationID:year-month-day`
    * Returns iCal Feed
      * Aggregates 1-to-Many LocationIDs
      * Filters On 0-to-Many Flavors (Omitted Implies No Filtering)
  * `/api/calendar/json?location={locationIDs}&flavor={flavors}`
    * Calls [https://www.culvers.com/fotd-add-to-calendar/{locationID}/{year}-{month}-{day}](https://www.culvers.com/fotd-add-to-calendar/{locationID}/{year}-{month}-{day})
    * Processes Current And Next Month (Culver's Website Constraint)
    * Cached With Key `flavor:locationID:year-month-day`
    * Returns JSON Array
      * Aggregates 1-to-Many LocationIDs
      * Filters On 0-to-Many Flavors (Omitted Implies No Filtering)
