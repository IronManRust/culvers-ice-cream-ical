const fs = require('fs')

const mapping = new Object()
const skip = []

async function processItem(zipCode) {
  if (!skip.includes(zipCode)) {
    console.log(`Processing Zip Code ${zipCode} - Initiated`)
    try {
      const url = `https://www.culvers.com/api/restaurants/getLocations?location=${zipCode}&limit=100`
      console.log('- Data Retrieval - Initiated')
      const response = await fetch(url)
      const json = await response.json()
      if (json.isSuccessful) {
        json.data.geofences.forEach((location) => {
          const id = location.externalId
          const key = location.metadata.slug
          const postalCode = location.metadata.postalCode
          if (!mapping.hasOwnProperty(id)) {
            console.log(`  - Added   Location ID ${id} - ${key} (${postalCode})`)
            mapping[id] = key
            skip.push(postalCode)
          } else {
            console.log(`  - Skipped Location ID ${id} - ${key} (${postalCode})`)
          }
        })
        console.log('- Data Retrieval - Succeeded')
      } else {
        console.log('- Data Retrieval - Failed')
      }
      console.log(`Processing Zip Code ${zipCode} - Completed`)
    } catch {
      console.log(`Processing Zip Code ${zipCode} - Errored`)
    }
  } else {
    console.log(`Processing Zip Code ${zipCode} - Skipped`)
  }
  console.log()
}

async function process(zipCodes) {
  for (const zipCode of zipCodes) {
    await processItem(zipCode)
  }
  fs.writeFileSync('./data/locationMapping.json', JSON.stringify(mapping, null, 2))
}

const zipCodes = fs.readFileSync('./data/zipCodes.txt').toString().split('\n')
process(zipCodes)
