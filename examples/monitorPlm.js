'use strict'
const { createPlm } = require('../index')
const deviceNames = require('./deviceNames.json')

const main = async () => {
  const plm = createPlm({
    username: process.env.HUB_USERNAME,
    password: process.env.HUB_PASSWORD,
    // host: 'insteon-hub',
    host: '192.168.1.110',
    port: 25105,
  })

  await plm.clearBuffer()
  plm.emitter.on('command', command => {
    console.log(command)
  })
  plm.startPolling(deviceNames)
}

main()
