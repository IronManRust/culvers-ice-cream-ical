const spawn = require('child_process').spawn
const fs = require('fs')

// This script spins up the Fastify server to cause it to write the `spec-2.0.json` and `spec-3.0.json` files to disk, then shuts the server down.

console.log('Fastify Server - Starting')
const childFastify = spawn('node', ['./dist/index'])
console.log('Fastify Server - Started')

setTimeout(() => {

  console.log('Fastify Server - Stopping')
  childFastify.kill('SIGINT')
  console.log('Fastify Server - Stopped')

}, 10000) // We assume that 10 seconds is sufficient for the Fastify server to start.
