const fs = require('fs')

const packageJSON = JSON.parse(fs.readFileSync('./package.json', {
  encoding: 'utf8'
}))
const metadata = {
  name: packageJSON.name,
  description: packageJSON.description,
  version: packageJSON.version,
  contactName: packageJSON.author.name,
  contactEmail: packageJSON.author.email,
  contactURL: packageJSON.author.url,
  license: packageJSON.license,
  timestamp: Date.now()
}

fs.writeFileSync('./dist/metadata.json', JSON.stringify(metadata, null, 2), {
  encoding: 'utf8'
})