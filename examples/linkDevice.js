'use strict'
const { createPlm } = require('../../node/insteon-plm')

const deviceNames = require('./deviceNames.json')

const linkDevice = async (plm, deviceAddress) => {
  await plm.sendModemCommand({
    command: 'Cancel ALL-Linking',
  })
  await plm.sendModemCommand({
    command: 'Start ALL-Linking',
    allLinkType: 'IM is Controller',
    groupNumber: 0,
  })
  // Cancel ALL-Linking
  // Start ALL-Linking
  // Get INSTEON Engine Version
  // Enter Linking Mode
  // ID Request
  // Cancel ALL-Linking
}

const main = async () => {
  const plm = createPlm({
    username: process.env.HUB_USERNAME,
    password: process.env.HUB_PASSWORD,
    host: 'insteon-hub',
    port: 25105,
    deviceNames,
  })
  await plm.start()
  await linkDevice(plm, '456789')
}

main()
