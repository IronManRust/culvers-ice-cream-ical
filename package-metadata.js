const fs = require('fs')

const package = JSON.parse(fs.readFileSync('./package.json', {
  encoding: 'utf8'
}))
const metadata = {
  name: package.name,
  description: package.description,
  version: package.version,
  contactName: package.author.name,
  contactEmail: package.author.email,
  contactURL: package.author.url,
  license: package.license,
  timestamp: Date.now()
}

fs.writeFileSync('./dist/metadata.json', JSON.stringify(metadata, null, 2), {
  encoding: 'utf8'
})